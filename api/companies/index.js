import { fileCache } from '../_lib/cache/FileCache.js';
import { COMPANIES_LIST } from '../_lib/constants/index.js';

/**
 * GET /api/companies
 * Returns all companies with their cached financial data in a single call
 * Checks file cache first to avoid multiple API calls
 */
export default async function handler(req, res) {
  const startTime = Date.now();
  console.log(`[API] GET /api/companies - Request received`);
  
  try {
    // Get all companies with their cached aggregated data
    const companiesWithData = COMPANIES_LIST.map(company => {
      const cachedData = fileCache.get(company.ticker);
      
      if (cachedData) {
        return {
          ticker: cachedData.ticker || company.ticker,
          name: cachedData.name || company.name,
          cik: cachedData.cik || company.cik,
          quarters: cachedData.quarters || [],
          latestQuarter: cachedData.quarters?.[0]?.quarter || 'Q4 2025',
          coverage: cachedData.coverage || null,
          data_source: 'cache'
        };
      }
      
      return {
        ticker: company.ticker,
        name: company.name,
        cik: company.cik,
        quarters: [],
        latestQuarter: 'Q4 2025',
        coverage: null,
        data_source: 'not_cached'
      };
    });
    
    const cachedCount = companiesWithData.filter(c => c.data_source === 'cache').length;
    const duration = Date.now() - startTime;
    
    console.log(`[API] GET /api/companies - Success (${duration}ms) - ${cachedCount}/${companiesWithData.length} cached`);
    
    return res.status(200).json({
      companies: companiesWithData,
      total: companiesWithData.length,
      cached: cachedCount,
      cache_coverage: `${cachedCount}/${companiesWithData.length}`
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API] GET /api/companies - Error (${duration}ms):`, error.message);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
