import { SECDataService } from '../_lib/services/SECDataService.js';
import { companyCache } from '../_lib/cache/CompanyCache.js';

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

const COMPANY_NAMES = {
  'AAPL': 'Apple Inc.',
  'NVDA': 'NVIDIA Corporation',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'META': 'Meta Platforms Inc.',
  'TSLA': 'Tesla Inc.',
  'JPM': 'JPMorgan Chase & Co.',
  'JNJ': 'Johnson & Johnson',
  'WMT': 'Walmart Inc.'
};

const MOCK_QUARTERS = [
  { fiscal_period: 'Q3', fiscal_year: 2024, end_date: '2024-09-30', filed: '2024-10-31', Revenues: 94.9, NetIncome: 22.5, GrossProfit: 44.3, OperatingIncome: 29.2 },
  { fiscal_period: 'Q2', fiscal_year: 2024, end_date: '2024-06-30', filed: '2024-07-31', Revenues: 85.8, NetIncome: 21.4, GrossProfit: 40.1, OperatingIncome: 27.4 },
  { fiscal_period: 'Q1', fiscal_year: 2024, end_date: '2024-03-31', filed: '2024-04-30', Revenues: 90.8, NetIncome: 23.6, GrossProfit: 41.9, OperatingIncome: 28.3 },
  { fiscal_period: 'Q4', fiscal_year: 2023, end_date: '2023-12-31', filed: '2024-01-31', Revenues: 119.6, NetIncome: 33.9, GrossProfit: 54.9, OperatingIncome: 40.3 }
];

export default async function handler(req, res) {
  if (companyCache.getLoadingStatus()) {
    return res.status(200).json({ 
      status: 'loading',
      message: 'Cache is being populated. Please try again in a few seconds.'
    });
  }

  companyCache.setLoading(true);
  
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
        if (companyCache.has(ticker)) {
          results.cached++;
          continue;
        }

        const data = await secService.getCompanyFinancials(cik);
        
        // Check if data is recent
        const latestYear = data.quarters[0]?.fiscal_year || 0;
        const currentYear = new Date().getFullYear();
        
        if (currentYear - latestYear > 2) {
          // Use mock data for old SEC data
          const mockData = {
            ticker: ticker,
            company_name: COMPANY_NAMES[ticker] || ticker,
            cik: cik,
            quarters: MOCK_QUARTERS,
            data_source: 'mock_fallback'
          };
          companyCache.set(ticker, mockData);
          results.success.push({ ticker, source: 'mock' });
        } else {
          companyCache.set(ticker, data);
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
        companyCache.set(ticker, mockData);
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
  } finally {
    companyCache.setLoading(false);
  }
}
