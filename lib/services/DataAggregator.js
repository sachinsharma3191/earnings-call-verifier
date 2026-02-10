// DataAggregator: Combines data from all available sources for each company/quarter
// Fallback chain per quarter:
//   1. Try primary source from transcriptSources.json (scrape)
//   2. If primary fails -> try ALL other sources (Motley Fool, Yahoo, Investing.com, SEC proxy)
//   3. If all external sources fail -> use system default (static/mock data)
//   4. UI shows "No source available - using system default" when all fail

import { SECDataService } from './SECDataService.js';
import { TranscriptScraper } from './TranscriptScraper.js';
import { TRANSCRIPT_SOURCES, getTranscriptSource } from '../data/transcriptSources.js';
import { TICKER_TO_CIK, COMPANY_NAMES, MOCK_QUARTERS, STATIC_QUARTERS, TARGET_QUARTERS, TARGET_YEAR, PRIOR_YEAR } from '../constants/index.js';

// All known transcript source URLs to try as fallbacks
// These are generic search/listing pages that may have transcripts
const FALLBACK_SOURCES = [
  {
    name: 'The Motley Fool',
    buildUrl: (ticker, qNum, year) =>
      `https://www.fool.com/earnings/call-transcripts/${year > 2025 ? '2026' : year}/${String(qNum * 3 + 1).padStart(2, '0')}/01/${ticker.toLowerCase()}-${ticker.toLowerCase()}-q${qNum}-${year}-earnings-call-transcript/`
  },
  {
    name: 'Yahoo Finance',
    buildUrl: (ticker, qNum, year) =>
      `https://finance.yahoo.com/news/${ticker.toLowerCase()}-q${qNum}-${year}-earnings-call-transcript`
  },
  {
    name: 'Investing.com',
    buildUrl: (ticker, qNum, year) =>
      `https://www.investing.com/earnings/${ticker.toLowerCase()}-earnings`
  }
];

export class DataAggregator {
  constructor({ scrapeTranscripts = false } = {}) {
    this.secService = new SECDataService();
    this.scraper = new TranscriptScraper();
    this.scrapeTranscripts = scrapeTranscripts;
  }

  /**
   * Try to scrape transcript text from a URL.
   * Returns { text, charCount } or { text: null, charCount: 0 } on failure.
   */
  async tryScrapeSingle(url, sourceName) {
    try {
      const text = await this.scraper.fetchTranscript(url, sourceName);
      if (text && text.length > 500) {
        return { text, charCount: text.length };
      }
      return { text: null, charCount: 0 };
    } catch {
      return { text: null, charCount: 0 };
    }
  }

  /**
   * For a given company/quarter, try ALL sources until one succeeds.
   * Order: primary source first, then all fallback sources.
   * @returns {{ source, url, text, charCount, scraped, type, sourcesTried }}
   */
  async tryAllTranscriptSources(ticker, quarterKey, primarySource) {
    const sourcesTried = [];

    // 1. Try primary source from transcriptSources.json
    if (primarySource?.url && primarySource?.available) {
      sourcesTried.push(primarySource.source);
      const result = await this.tryScrapeSingle(primarySource.url, primarySource.source);
      if (result.text) {
        return {
          source: primarySource.source,
          url: primarySource.url,
          text: result.text,
          charCount: result.charCount,
          scraped: true,
          type: 'transcript',
          sourcesTried
        };
      }
      console.log(`[DataAggregator] ${ticker} ${quarterKey}: Primary source ${primarySource.source} failed, trying fallbacks...`);
    }

    // 2. Try each fallback source
    const parts = quarterKey.split('-'); // e.g. "Q4-2025"
    const qNum = parseInt(parts[0].replace('Q', ''));
    const year = parseInt(parts[1]);

    for (const fallback of FALLBACK_SOURCES) {
      // Skip if this is the same as the primary source we already tried
      if (primarySource?.source === fallback.name) continue;

      const fallbackUrl = fallback.buildUrl(ticker, qNum, year);
      sourcesTried.push(fallback.name);
      const result = await this.tryScrapeSingle(fallbackUrl, fallback.name);
      if (result.text) {
        console.log(`[DataAggregator] ${ticker} ${quarterKey}: ✅ Fallback ${fallback.name} succeeded (${result.charCount} chars)`);
        return {
          source: fallback.name,
          url: fallbackUrl,
          text: result.text,
          charCount: result.charCount,
          scraped: true,
          type: 'transcript',
          sourcesTried
        };
      }
    }

    // 3. Try SEC proxy if available
    if (primarySource?.type === 'proxy' && primarySource?.url) {
      sourcesTried.push('SEC EDGAR (proxy)');
      return {
        source: primarySource.source,
        url: primarySource.url,
        text: null,
        charCount: 0,
        scraped: false,
        type: 'proxy',
        note: primarySource.note || 'Using SEC filing as proxy',
        sourcesTried
      };
    }

    // 4. All sources failed
    console.log(`[DataAggregator] ${ticker} ${quarterKey}: ❌ All sources failed (tried: ${sourcesTried.join(', ')})`);
    return {
      source: 'System Default',
      url: null,
      text: null,
      charCount: 0,
      scraped: false,
      type: 'system_default',
      note: `No source available - using system default. Tried: ${sourcesTried.join(', ')}`,
      sourcesTried
    };
  }

  /**
   * Get aggregated data for a single company across all 4 quarters.
   * For each quarter: SEC for financials, then try all transcript sources with fallback.
   */
  async getCompanyData(ticker) {
    const cik = TICKER_TO_CIK[ticker];
    if (!cik) {
      console.log(`[DataAggregator] Unknown ticker: ${ticker}`);
      return null;
    }

    const companyName = COMPANY_NAMES[ticker] || ticker;
    console.log(`[DataAggregator] Aggregating data for ${ticker} (${companyName})...`);

    // Step 1: Try SEC EDGAR for financial data
    let secQuarters = [];
    try {
      secQuarters = await this.secService.getQuarterlyData(cik);
      console.log(`[DataAggregator] ${ticker}: SEC returned ${secQuarters.length} quarters`);
    } catch (err) {
      console.warn(`[DataAggregator] ${ticker}: SEC failed - ${err.message}`);
    }

    // Step 2: Build a map of available SEC quarters
    const secMap = new Map();
    for (const q of secQuarters) {
      const key = `${q.fiscal_period}-${q.fiscal_year}`;
      secMap.set(key, q);
    }

    // Step 3: For each target quarter, aggregate from best available source
    const aggregatedQuarters = [];

    for (const qp of TARGET_QUARTERS) {
      const key = `${qp}-${TARGET_YEAR}`;
      const quarterLabel = `${qp} ${TARGET_YEAR}`;

      // Financial data: SEC first, then static fallback
      const secData = secMap.get(key);
      const staticData = MOCK_QUARTERS.find(
        m => m.fiscal_period === qp && m.fiscal_year === TARGET_YEAR
      );
      const staticQuarter = STATIC_QUARTERS.find(
        s => s.quarter === quarterLabel
      );

      let financials = null;
      let dataSource = 'none';

      if (secData) {
        financials = {
          Revenues: secData.Revenues,
          NetIncome: secData.NetIncome,
          GrossProfit: secData.GrossProfit,
          OperatingIncome: secData.OperatingIncome,
          CostOfRevenue: secData.CostOfRevenue,
          OperatingExpenses: secData.OperatingExpenses,
          EPS: secData.EPS
        };
        dataSource = 'sec_edgar';
      } else if (staticData) {
        financials = {
          Revenues: staticData.Revenues,
          NetIncome: staticData.NetIncome,
          GrossProfit: staticData.GrossProfit,
          OperatingIncome: staticData.OperatingIncome,
          CostOfRevenue: staticData.CostOfRevenue || 0,
          OperatingExpenses: staticData.OperatingExpenses || 0,
          EPS: staticData.EPS || 0
        };
        dataSource = 'static_fallback';
      }

      // Transcript: try all sources with fallback chain
      const primarySource = getTranscriptSource(ticker, key);
      let transcript;

      if (this.scrapeTranscripts) {
        // Scraping enabled: try primary, then fallbacks, then system default
        const scrapeResult = await this.tryAllTranscriptSources(ticker, key, primarySource);
        transcript = {
          available: scrapeResult.type === 'transcript' && scrapeResult.scraped,
          source: scrapeResult.source,
          type: scrapeResult.type,
          url: scrapeResult.url,
          scraped: scrapeResult.scraped,
          charCount: scrapeResult.charCount,
          sourcesTried: scrapeResult.sourcesTried,
          note: scrapeResult.note || null
        };
        if (scrapeResult.text) {
          transcript.textPreview = scrapeResult.text.substring(0, 200) + '...';
        }
      } else {
        // Scraping disabled: just report what's configured
        if (primarySource?.available) {
          transcript = {
            available: true,
            source: primarySource.source,
            type: primarySource.type || 'transcript',
            url: primarySource.url,
            scraped: false,
            charCount: 0,
            sourcesTried: [primarySource.source]
          };
        } else if (primarySource?.type === 'proxy') {
          transcript = {
            available: false,
            source: primarySource.source,
            type: 'proxy',
            url: primarySource.url,
            scraped: false,
            charCount: 0,
            note: primarySource.note || 'Using SEC filing as proxy',
            sourcesTried: [primarySource.source]
          };
        } else {
          transcript = {
            available: false,
            source: 'System Default',
            type: 'system_default',
            url: null,
            scraped: false,
            charCount: 0,
            note: 'No source available - using system default',
            sourcesTried: []
          };
        }
      }

      const quarterObj = {
        quarter: quarterLabel,
        endDate: secData?.end_date || staticQuarter?.endDate || null,
        filed: secData?.filed || staticQuarter?.filed || null,
        financials,
        dataSource,
        transcript
      };

      aggregatedQuarters.push(quarterObj);
    }

    // Step 4: Also aggregate prior year (2024) quarters for YoY comparison (financials only, no transcripts)
    for (const qp of TARGET_QUARTERS) {
      const key = `${qp}-${PRIOR_YEAR}`;
      const quarterLabel = `${qp} ${PRIOR_YEAR}`;

      const secData = secMap.get(key);
      if (secData) {
        aggregatedQuarters.push({
          quarter: quarterLabel,
          endDate: secData.end_date || null,
          filed: secData.filed || null,
          financials: {
            Revenues: secData.Revenues,
            NetIncome: secData.NetIncome,
            GrossProfit: secData.GrossProfit,
            OperatingIncome: secData.OperatingIncome,
            CostOfRevenue: secData.CostOfRevenue,
            OperatingExpenses: secData.OperatingExpenses,
            EPS: secData.EPS
          },
          dataSource: 'sec_edgar',
          transcript: { available: false, source: 'N/A', type: 'prior_year', scraped: false, charCount: 0, sourcesTried: [] }
        });
      }
    }

    // Summary
    const secCount = aggregatedQuarters.filter(q => q.dataSource === 'sec_edgar').length;
    const staticCount = aggregatedQuarters.filter(q => q.dataSource === 'static_fallback').length;
    const scrapedCount = aggregatedQuarters.filter(q => q.transcript.scraped).length;
    const proxyCount = aggregatedQuarters.filter(q => q.transcript.type === 'proxy').length;
    const defaultCount = aggregatedQuarters.filter(q => q.transcript.type === 'system_default').length;

    console.log(`[DataAggregator] ${ticker}: financials=${secCount} SEC + ${staticCount} static | transcripts=${scrapedCount} scraped, ${proxyCount} proxy, ${defaultCount} system_default`);

    return {
      ticker,
      name: companyName,
      cik,
      quarters: aggregatedQuarters,
      coverage: {
        financial: { sec: secCount, static: staticCount, total: 4 },
        transcript: { scraped: scrapedCount, proxy: proxyCount, systemDefault: defaultCount, total: 4 }
      }
    };
  }

  /**
   * Get aggregated data for ALL companies.
   */
  async getAllCompaniesData() {
    const tickers = Object.keys(TICKER_TO_CIK);
    console.log(`[DataAggregator] Aggregating data for ${tickers.length} companies...`);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const ticker of tickers) {
      try {
        const data = await this.getCompanyData(ticker);
        if (data) {
          results.push(data);
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(`[DataAggregator] ${ticker}: Failed - ${err.message}`);
        failCount++;
      }
    }

    console.log(`[DataAggregator] Complete: ${successCount} success, ${failCount} failed`);

    return {
      companies: results,
      total: results.length,
      coverage: {
        companies: results.length,
        quarters: results.length * 4,
        financialFromSEC: results.reduce((sum, c) => sum + c.coverage.financial.sec, 0),
        financialFromStatic: results.reduce((sum, c) => sum + c.coverage.financial.static, 0),
        transcriptsScraped: results.reduce((sum, c) => sum + c.coverage.transcript.scraped, 0),
        transcriptsProxy: results.reduce((sum, c) => sum + c.coverage.transcript.proxy, 0),
        transcriptsDefault: results.reduce((sum, c) => sum + c.coverage.transcript.systemDefault, 0)
      }
    };
  }
}
