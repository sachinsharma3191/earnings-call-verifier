// Server startup: initialize caches and start background refresh
// - Loads aggregated data into both fileCache and aggregateCache
// - Starts background process that checks every 30 min
// - Data expires after 15 min, gets recomputed on next check
import { cacheRefresher } from './cache/CacheRefresher.js';

let initialized = false;

export async function initializeCache() {
  if (initialized) return;
  initialized = true;

  try {
    // 1. Initial load (uses cached data if valid, else computes fresh)
    await cacheRefresher.initialize();

    // 2. Start background refresh (checks every 30 min)
    cacheRefresher.startBackgroundRefresh();

    console.log('✅ Cache system ready (TTL: 15min, refresh check: 30min)');
  } catch (error) {
    console.error('❌ Cache initialization error:', error.message);
  }
}

// Auto-start on module load
initializeCache();
