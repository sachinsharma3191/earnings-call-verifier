// Auto-prefetch companies data when server starts
import { fileCache } from './cache/FileCache.js';
import { SECDataService } from './services/SECDataService.js';
import { getTranscriptSource } from './data/transcriptSources.js';
import { TICKER_TO_CIK, COMPANY_NAMES, MOCK_QUARTERS } from './constants/index.js';

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
