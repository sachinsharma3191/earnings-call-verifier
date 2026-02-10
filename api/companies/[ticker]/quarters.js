import { SECDataService } from '../../_lib/services/SECDataService.js';
import { getTranscriptSource } from '../../_lib/data/transcriptSources.js';
import { TICKER_TO_CIK, STATIC_QUARTERS } from '../../_lib/constants/index.js';

export default async function handler(req, res) {
  const { ticker } = req.query;
  const startTime = Date.now();
  
  console.log(`[API] GET /api/companies/${ticker}/quarters - Request received`);
  
  if (!ticker) {
    console.log(`[API] GET /api/companies/${ticker}/quarters - Error: Missing ticker`);
    return res.status(400).json({ error: 'Missing ticker parameter' });
  }

  const cik = TICKER_TO_CIK[ticker.toUpperCase()];
  if (!cik) {
    console.log(`[API] GET /api/companies/${ticker}/quarters - Error: Company not found`);
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
    
    const duration = Date.now() - startTime;
    console.log(`[API] GET /api/companies/${ticker}/quarters - Success (${duration}ms) - ${quartersWithSources.length} quarters from SEC`);
    
    return res.status(200).json({
      ticker: ticker.toUpperCase(),
      quarters: quartersWithSources,
      source: 'sec_edgar'
    });
  } catch (error) {
    console.warn(`[API] GET /api/companies/${ticker}/quarters - SEC API failed, using static data:`, error.message);
    
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
    
    const duration = Date.now() - startTime;
    console.log(`[API] GET /api/companies/${ticker}/quarters - Fallback (${duration}ms) - ${quartersWithSources.length} static quarters`);
    
    return res.status(200).json({
      ticker: ticker.toUpperCase(),
      quarters: quartersWithSources,
      source: 'static_fallback'
    });
  }
}
