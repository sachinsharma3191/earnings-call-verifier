import { fileCache } from '../_lib/cache/FileCache.js';

const COMPANIES_LIST = [
  { ticker: 'AAPL', name: 'Apple Inc.', cik: '0000320193' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', cik: '0001045810' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', cik: '0000789019' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', cik: '0001652044' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', cik: '0001018724' },
  { ticker: 'META', name: 'Meta Platforms Inc.', cik: '0001326801' },
  { ticker: 'TSLA', name: 'Tesla Inc.', cik: '0001318605' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', cik: '0000019617' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', cik: '0000200406' },
  { ticker: 'WMT', name: 'Walmart Inc.', cik: '0000104169' }
];

/**
 * GET /api/companies
 * Returns all companies with their cached financial data in a single call
 * Checks file cache first to avoid multiple API calls
 */
export default async function handler(req, res) {
  try {
    // Get all companies with their cached data
    const companiesWithData = COMPANIES_LIST.map(company => {
      const cachedData = fileCache.get(company.ticker);
      
      if (cachedData) {
        // Return basic info with quarters from cache
        return {
          ticker: company.ticker,
          name: company.name,
          cik: company.cik,
          quarters: cachedData.quarters || [],
          latestQuarter: cachedData.quarters?.[0] 
            ? `${cachedData.quarters[0].fiscal_period} ${cachedData.quarters[0].fiscal_year}`
            : 'Q4 2025',
          data_source: 'cache'
        };
      }
      
      // Return basic info without quarters if not cached
      return {
        ticker: company.ticker,
        name: company.name,
        cik: company.cik,
        quarters: [],
        latestQuarter: 'Q4 2025',
        data_source: 'not_cached'
      };
    });
    
    const cachedCount = companiesWithData.filter(c => c.data_source === 'cache').length;
    
    return res.status(200).json({
      companies: companiesWithData,
      total: companiesWithData.length,
      cached: cachedCount,
      cache_coverage: `${cachedCount}/${companiesWithData.length}`
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
