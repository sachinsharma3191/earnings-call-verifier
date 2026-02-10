import { SECDataService } from '../_lib/services/SECDataService.js';
import { fileCache } from '../_lib/cache/FileCache.js';
import { getTranscriptSource } from '../_lib/data/transcriptSources.js';
import { TICKER_TO_CIK, COMPANY_NAMES, MOCK_QUARTERS } from '../_lib/constants/index.js';

export default async function handler(req, res) {
  const startTime = Date.now();
  
  try {
    const { ticker } = req.query;
    console.log(`[API] GET /api/companies/${ticker} - Request received`);
    
    if (!ticker) {
      console.log(`[API] GET /api/companies/${ticker} - Error: Missing ticker`);
      return res.status(400).json({ error: 'Missing ticker parameter' });
    }

    const cik = TICKER_TO_CIK[ticker];
    if (!cik) {
      console.log(`[API] GET /api/companies/${ticker} - Error: Company not found`);
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check cache first
    const cached = fileCache.get(ticker);
    if (cached) {
      const duration = Date.now() - startTime;
      console.log(`[API] GET /api/companies/${ticker} - Cache hit (${duration}ms)`);
      return res.status(200).json({
        ...cached,
        data_source: 'file_cache'
      });
    }
    
    console.log(`[API] GET /api/companies/${ticker} - Cache miss, fetching from SEC...`);

    try {
      const secService = new SECDataService();
      const data = await secService.getCompanyFinancials(cik);
      
      // Cache the result
      fileCache.set(ticker, data);

      // Check if data is recent (within last 1 year)
      const latestYear = data.quarters[0]?.fiscal_year || 0;
      const currentYear = new Date().getFullYear();
      
      if (currentYear - latestYear > 1 || data.quarters.length === 0) {
        // SEC data is too old, use mock data with transcript sources
        const quartersWithSources = MOCK_QUARTERS.map(q => {
          const quarterKey = `${q.fiscal_period}-${q.fiscal_year}`;
          const transcriptSource = getTranscriptSource(ticker.toUpperCase(), quarterKey);
          return {
            ...q,
            transcriptSource: transcriptSource || {
              available: false,
              source: 'Not Available',
              type: 'missing'
            }
          };
        });
        
        return res.status(200).json({
          ticker: ticker,
          company_name: COMPANY_NAMES[ticker] || ticker,
          cik: cik,
          quarters: quartersWithSources,
          data_source: 'mock_fallback',
          last_updated: new Date().toISOString().slice(0, 10)
        });
      }
      
      // Add transcript sources to real data
      const quartersWithSources = data.quarters.map(q => {
        const quarterKey = `${q.fiscal_period}-${q.fiscal_year}`;
        const transcriptSource = getTranscriptSource(ticker.toUpperCase(), quarterKey);
        return {
          ...q,
          transcriptSource: transcriptSource || {
            available: false,
            source: 'Not Available',
            type: 'missing'
          }
        };
      });
      
      const duration = Date.now() - startTime;
      console.log(`[API] GET /api/companies/${ticker} - Success (${duration}ms) - ${quartersWithSources.length} quarters from SEC`);
      
      return res.status(200).json({
        ...data,
        quarters: quartersWithSources
      });
    } catch (secError) {
      console.warn(`[API] GET /api/companies/${ticker} - SEC API failed:`, secError.message);
      // SEC API failed, return mock data with transcript sources
      const quartersWithSources = MOCK_QUARTERS.map(q => {
        const quarterKey = `${q.fiscal_period}-${q.fiscal_year}`;
        const transcriptSource = getTranscriptSource(ticker.toUpperCase(), quarterKey);
        return {
          ...q,
          transcriptSource: transcriptSource || {
            available: false,
            source: 'Not Available',
            type: 'missing'
          }
        };
      });
      
      const duration = Date.now() - startTime;
      console.log(`[API] GET /api/companies/${ticker} - Fallback (${duration}ms) - Using mock data`);
      
      return res.status(200).json({
        ticker: ticker,
        company_name: COMPANY_NAMES[ticker] || ticker,
        cik: cik,
        quarters: quartersWithSources,
        data_source: 'mock_fallback',
        last_updated: new Date().toISOString().slice(0, 10)
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API] GET /api/companies/${ticker} - Error (${duration}ms):`, error.message);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
