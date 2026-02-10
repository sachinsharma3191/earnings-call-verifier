import { SECDataService } from '../_lib/services/SECDataService.js';
import { fileCache } from '../_lib/cache/FileCache.js';
import { TICKER_TO_CIK, COMPANY_NAMES, MOCK_QUARTERS } from '../_lib/constants/index.js';

export default async function handler(req, res) {
  
  const results = {
    success: [],
    failed: [],
    cached: 0
  };

  try {
    const secService = new SECDataService();
    
    for (const [ticker, cik] of Object.entries(TICKER_TO_CIK)) {
      try {
        // Check if already cached
        if (fileCache.has(ticker)) {
          results.cached++;
          continue;
        }

        const data = await secService.getCompanyFinancials(cik);
        
        // Check if data is recent (within last 1 year)
        const latestYear = data.quarters[0]?.fiscal_year || 0;
        const currentYear = new Date().getFullYear();
        
        if (currentYear - latestYear > 1 || data.quarters.length === 0) {
          // Use mock data for old SEC data
          const mockData = {
            ticker: ticker,
            company_name: COMPANY_NAMES[ticker] || ticker,
            cik: cik,
            quarters: MOCK_QUARTERS,
            data_source: 'mock_fallback'
          };
          fileCache.set(ticker, mockData);
          results.success.push({ ticker, source: 'mock' });
        } else {
          fileCache.set(ticker, data);
          results.success.push({ ticker, source: 'sec' });
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        // Use mock data on error
        const mockData = {
          ticker: ticker,
          company_name: COMPANY_NAMES[ticker] || ticker,
          cik: cik,
          quarters: MOCK_QUARTERS,
          data_source: 'mock_fallback'
        };
        fileCache.set(ticker, mockData);
        results.failed.push({ ticker, error: error.message });
      }
    }

    return res.status(200).json({
      status: 'completed',
      results,
      total: Object.keys(TICKER_TO_CIK).length,
      message: 'Company data cached successfully'
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
}
