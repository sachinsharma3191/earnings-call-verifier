
import { TranscriptScraper } from '../../../_lib/services/TranscriptScraper.js';
import { getTranscriptSource, FALLBACK_POLICY } from '../../../_lib/data/transcriptSources.js';

export default async function handler(req, res) {
  const { ticker, year, quarter } = req.query;

  if (!ticker || !year || !quarter) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const quarterKey = `Q${quarter}-${year}`;
  const sourceConfig = getTranscriptSource(ticker, quarterKey);

  if (!sourceConfig) {
    return res.status(404).json({ error: 'Transcript source not found in manifest' });
  }

  // 1. Try to fetch from configured source
  if (sourceConfig.available && sourceConfig.type === 'transcript') {
    try {
      const scraper = new TranscriptScraper();
      const transcriptText = await scraper.fetchTranscript(sourceConfig.url, sourceConfig.source);

      if (transcriptText) {
        return res.status(200).json({
          ticker,
          year: parseInt(year),
          quarter: parseInt(quarter),
          transcript: transcriptText,
          source: sourceConfig.source,
          source_url: sourceConfig.url,
          type: 'transcript'
        });
      }

      console.warn(`Scraping failed for ${ticker} ${quarterKey}, falling back to policy.`);
    } catch (error) {
      console.error(`Scraper error for ${ticker} ${quarterKey}:`, error);
    }
  }

  // 2. Fallback Policy
  // If configured as 'proxy' OR if scraping failed, return proxy response
  if (sourceConfig.type === 'proxy' || FALLBACK_POLICY.MISSING_TRANSCRIPT === 'proxy') {
    return res.status(200).json({
      ticker,
      year: parseInt(year),
      quarter: parseInt(quarter),
      transcript: `[PROXY DOCUMENT: SEC ${FALLBACK_POLICY.PROXY_POLICY.type}]\n\nVerification performed against official SEC filings. Full transcript text is not available for this quarter.`,
      source: 'SEC EDGAR (Proxy)',
      source_url: sourceConfig.url || 'https://www.sec.gov/edgar/searchedgar/companysearch',
      type: 'proxy',
      note: sourceConfig.note || 'Fallback to proxy'
    });
  }

  return res.status(404).json({
    error: 'Transcript unavailable',
    message: 'Transcript not available and no proxy fallback enabled.'
  });
}
