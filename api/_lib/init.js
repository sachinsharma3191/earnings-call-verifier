// Auto-prefetch companies data when server starts
import { fileCache } from './cache/FileCache.js';
import { SECDataService } from './services/SECDataService.js';
import { getTranscriptSource } from './data/transcriptSources.js';

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

let prefetchStarted = false;

export async function initializeCache() {
  // Only run once
  if (prefetchStarted) return;
  prefetchStarted = true;

  console.log('🔄 Initializing company cache on server startup...');

  try {
    // Check if cache already has data
    const cached = fileCache.getAll();
    const cachedCount = Object.keys(cached).length;

    if (cachedCount >= 10) {
      console.log(`✅ Cache already populated with ${cachedCount} companies`);
      return;
    }

    console.log('📡 Prefetching all companies data...');
    
    const secService = new SECDataService();
    let successCount = 0;
    let failedCount = 0;

    // Prefetch all companies synchronously on startup
    for (const [ticker, cik] of Object.entries(TICKER_TO_CIK)) {
      try {
        // Check if already cached
        if (fileCache.has(ticker)) {
          console.log(`  ✓ ${ticker} already cached`);
          successCount++;
          continue;
        }

        const data = await secService.getCompanyFinancials(cik);
        
        // Check if data is recent (within last 1 year)
        const latestYear = data.quarters[0]?.fiscal_year || 0;
        const currentYear = new Date().getFullYear();
        
        if (currentYear - latestYear > 1 || data.quarters.length === 0) {
          // Use mock data with transcript sources
          const quartersWithSources = MOCK_QUARTERS.map(q => {
            const quarterKey = `${q.fiscal_period}-${q.fiscal_year}`;
            const transcriptSource = getTranscriptSource(ticker, quarterKey);
            return {
              ...q,
              transcriptSource: transcriptSource || { available: false, source: 'Not Available', type: 'missing' }
            };
          });
          
          const mockData = {
            ticker,
            company_name: COMPANY_NAMES[ticker] || ticker,
            cik,
            quarters: quartersWithSources,
            data_source: 'mock_fallback'
          };
          
          fileCache.set(ticker, mockData);
          console.log(`  ✓ ${ticker} cached (mock data)`);
        } else {
          // Add transcript sources to real data
          const quartersWithSources = data.quarters.map(q => {
            const quarterKey = `${q.fiscal_period}-${q.fiscal_year}`;
            const transcriptSource = getTranscriptSource(ticker, quarterKey);
            return {
              ...q,
              transcriptSource: transcriptSource || { available: false, source: 'Not Available', type: 'missing' }
            };
          });
          
          fileCache.set(ticker, { ...data, quarters: quartersWithSources });
          console.log(`  ✓ ${ticker} cached (SEC data)`);
        }
        
        successCount++;
      } catch (error) {
        console.error(`  ✗ ${ticker} failed:`, error.message);
        failedCount++;
      }
    }

    console.log(`✅ Cache initialization complete: ${successCount} success, ${failedCount} failed`);

  } catch (error) {
    console.error('❌ Cache initialization error:', error.message);
  }
}

// Auto-start prefetch on module load
initializeCache();
