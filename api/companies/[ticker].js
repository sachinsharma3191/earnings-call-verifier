import { SECDataService } from '../_lib/services/SECDataService.js';
import { fileCache } from '../_lib/cache/FileCache.js';
import { getTranscriptSource } from '../_lib/data/transcriptSources.js';

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
  { fiscal_period: 'Q4', fiscal_year: 2025, end_date: '2025-12-31', filed: '2026-01-31', Revenues: 124.3, NetIncome: 35.2, GrossProfit: 57.1, OperatingIncome: 42.8 },
  { fiscal_period: 'Q3', fiscal_year: 2025, end_date: '2025-09-30', filed: '2025-10-31', Revenues: 94.9, NetIncome: 22.5, GrossProfit: 44.3, OperatingIncome: 29.2 },
  { fiscal_period: 'Q2', fiscal_year: 2025, end_date: '2025-06-30', filed: '2025-07-31', Revenues: 85.8, NetIncome: 21.4, GrossProfit: 40.1, OperatingIncome: 27.4 },
  { fiscal_period: 'Q1', fiscal_year: 2025, end_date: '2025-03-31', filed: '2025-04-30', Revenues: 90.8, NetIncome: 23.6, GrossProfit: 41.9, OperatingIncome: 28.3 }
];

export default async function handler(req, res) {
  try {
    const { ticker } = req.query;
    if (!ticker) {
      return res.status(400).json({ error: 'Missing ticker parameter' });
    }

    const cik = TICKER_TO_CIK[ticker];
    if (!cik) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check cache first
    const cached = fileCache.get(ticker);
    if (cached) {
      return res.status(200).json({
        ...cached,
        data_source: 'file_cache'
      });
    }

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
      
      return res.status(200).json({
        ...data,
        quarters: quartersWithSources
      });
    } catch (secError) {
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
    console.error('Error fetching company:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
