import { SECDataService } from '../../_lib/services/SECDataService.js';
import { getTranscriptSource } from '../../_lib/data/transcriptSources.js';

const TICKER_TO_CIK = {
  'AAPL': '0000320193',
  'NVDA': '0001045810',
  'MSFT': '0000789019',
  'GOOGL': '0001652044',
  'AMZN': '0001018724',
  'META': '0001326801',
  'TSLA': '0001318605',
  'JPM': '0000019617',
  'JNJ': '0000200406',
  'WMT': '0000104169'
};

const STATIC_QUARTERS = [
  { quarter: 'Q4 2025', endDate: '2025-12-31', filed: '2026-01-31' },
  { quarter: 'Q3 2025', endDate: '2025-09-30', filed: '2025-10-31' },
  { quarter: 'Q2 2025', endDate: '2025-06-30', filed: '2025-07-31' },
  { quarter: 'Q1 2025', endDate: '2025-03-31', filed: '2025-04-30' }
];

export default async function handler(req, res) {
  const { ticker } = req.query;
  
  if (!ticker) {
    return res.status(400).json({ error: 'Missing ticker parameter' });
  }

  const cik = TICKER_TO_CIK[ticker.toUpperCase()];
  if (!cik) {
    return res.status(404).json({ error: 'Company not found' });
  }

  try {
    const secService = new SECDataService();
    const quarters = await secService.getQuarterlyData(cik);
    
    // Add transcript source attribution to each quarter
    const quartersWithSources = quarters.slice(0, 4).map(q => {
      const quarterStr = `${q.fiscal_period} ${q.fiscal_year}`;
      const quarterKey = quarterStr.replace(' ', '-');
      const transcriptSource = getTranscriptSource(ticker.toUpperCase(), quarterKey);
      
      return {
        quarter: quarterStr,
        endDate: q.end_date,
        filed: q.filed,
        transcriptSource: transcriptSource || {
          available: false,
          source: 'Not Available',
          type: 'missing',
          note: 'Transcript source not configured'
        }
      };
    });
    
    return res.status(200).json({
      ticker: ticker.toUpperCase(),
      quarters: quartersWithSources,
      source: 'sec_edgar'
    });
  } catch (error) {
    console.warn(`SEC API failed for ${ticker}, using static data:`, error);
    
    // Add transcript sources to static quarters too
    const quartersWithSources = STATIC_QUARTERS.map(q => {
      const quarterKey = q.quarter.replace(' ', '-');
      const transcriptSource = getTranscriptSource(ticker.toUpperCase(), quarterKey);
      
      return {
        ...q,
        transcriptSource: transcriptSource || {
          available: false,
          source: 'Not Available',
          type: 'missing',
          note: 'Transcript source not configured'
        }
      };
    });
    
    return res.status(200).json({
      ticker: ticker.toUpperCase(),
      quarters: quartersWithSources,
      source: 'static_fallback'
    });
  }
}
