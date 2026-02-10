// DataAggregator: Combines data from all available sources for each company/quarter
// Priority: No fixed priority among external sources - use whichever has data
// Fallback chain: SEC EDGAR -> External Transcript Sources -> Static/Mock data

import { SECDataService } from './SECDataService.js';
import { TRANSCRIPT_SOURCES, getTranscriptSource } from '../data/transcriptSources.js';
import { TICKER_TO_CIK, COMPANY_NAMES, MOCK_QUARTERS, STATIC_QUARTERS } from '../constants/index.js';

const TARGET_QUARTERS = ['Q4', 'Q3', 'Q2', 'Q1'];
const TARGET_YEAR = 2025;

export class DataAggregator {
  constructor() {
    this.secService = new SECDataService();
  }

  /**
   * Get aggregated data for a single company across all 4 quarters.
   * Checks SEC first, then fills gaps from transcript sources, then static fallback.
   * @param {string} ticker - Company ticker symbol
   * @returns {object} - Aggregated company data with source attribution per quarter
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
    const aggregatedQuarters = TARGET_QUARTERS.map(qp => {
      const key = `${qp}-${TARGET_YEAR}`;
      const quarterLabel = `${qp} ${TARGET_YEAR}`;

      // Source 1: SEC EDGAR (financial data)
      const secData = secMap.get(key);

      // Source 2: Transcript source manifest (external transcript links)
      const transcriptSource = getTranscriptSource(ticker, key);

      // Source 3: Static/Mock fallback
      const staticData = MOCK_QUARTERS.find(
        m => m.fiscal_period === qp && m.fiscal_year === TARGET_YEAR
      );
      const staticQuarter = STATIC_QUARTERS.find(
        s => s.quarter === quarterLabel
      );

      // Determine financial data source
      let financials = null;
      let dataSource = 'none';

      if (secData) {
        // SEC has real financial data for this quarter
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
        // Use static/mock financial data as fallback
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

      // Determine transcript availability
      let transcript = {
        available: false,
        source: 'Not Available',
        type: 'missing',
        url: null,
        note: 'No transcript source found'
      };

      if (transcriptSource && transcriptSource.available) {
        // External transcript is available (Motley Fool, Yahoo, Investing.com, etc.)
        transcript = {
          available: true,
          source: transcriptSource.source,
          type: transcriptSource.type || 'transcript',
          url: transcriptSource.url,
          filed: transcriptSource.filed
        };
      } else if (transcriptSource && transcriptSource.type === 'proxy') {
        // Proxy document (SEC 10-Q MD&A) available
        transcript = {
          available: false,
          source: transcriptSource.source,
          type: 'proxy',
          url: transcriptSource.url,
          filed: transcriptSource.filed,
          note: transcriptSource.note || 'Using SEC filing as proxy'
        };
      }

      return {
        quarter: quarterLabel,
        endDate: secData?.end_date || staticQuarter?.endDate || null,
        filed: secData?.filed || staticQuarter?.filed || null,
        financials,
        dataSource,
        transcript
      };
    });

    // Summary of sources used
    const secCount = aggregatedQuarters.filter(q => q.dataSource === 'sec_edgar').length;
    const staticCount = aggregatedQuarters.filter(q => q.dataSource === 'static_fallback').length;
    const transcriptCount = aggregatedQuarters.filter(q => q.transcript.available).length;
    const proxyCount = aggregatedQuarters.filter(q => q.transcript.type === 'proxy').length;

    console.log(`[DataAggregator] ${ticker}: ${secCount} SEC, ${staticCount} static, ${transcriptCount} transcripts, ${proxyCount} proxies`);

    return {
      ticker,
      name: companyName,
      cik,
      quarters: aggregatedQuarters,
      coverage: {
        financial: { sec: secCount, static: staticCount, total: 4 },
        transcript: { available: transcriptCount, proxy: proxyCount, missing: 4 - transcriptCount - proxyCount, total: 4 }
      }
    };
  }

  /**
   * Get aggregated data for ALL companies.
   * @returns {object[]} - Array of aggregated company data
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
        transcriptsAvailable: results.reduce((sum, c) => sum + c.coverage.transcript.available, 0),
        transcriptsProxy: results.reduce((sum, c) => sum + c.coverage.transcript.proxy, 0)
      }
    };
  }
}
