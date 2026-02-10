// Auto-prefetch companies data when server starts using DataAggregator
// Combines all sources: SEC EDGAR, Transcript Sources, Static/Mock fallback
import { fileCache } from './cache/FileCache.js';
import { DataAggregator } from './services/DataAggregator.js';
import { TICKER_TO_CIK } from './constants/index.js';

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

    console.log('📡 Prefetching all companies data (aggregating sources)...');
    
    const aggregator = new DataAggregator({ scrapeTranscripts: true });
    let successCount = 0;
    let failedCount = 0;

    for (const ticker of Object.keys(TICKER_TO_CIK)) {
      try {
        if (fileCache.has(ticker)) {
          console.log(`  ✓ ${ticker} already cached`);
          successCount++;
          continue;
        }

        const data = await aggregator.getCompanyData(ticker);
        if (data) {
          fileCache.set(ticker, data);
          const secQ = data.coverage.financial.sec;
          const staticQ = data.coverage.financial.static;
          const transcripts = data.coverage.transcript.available;
          console.log(`  ✓ ${ticker} cached (${secQ} SEC + ${staticQ} static, ${transcripts} transcripts)`);
          successCount++;
        } else {
          console.error(`  ✗ ${ticker} - no data returned`);
          failedCount++;
        }
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
