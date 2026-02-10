// Server startup: lightweight cache init (NO heavy work)
// - Loads existing cache files from disk (instant)
// - Spawns a separate worker process for heavy data aggregation
// - Starts periodic check every 30 min to re-spawn worker if cache expired
// - Server is ready to accept requests immediately
import { cacheRefresher } from './cache/CacheRefresher.js';

let initialized = false;

export function initializeCache() {
  if (initialized) return;
  initialized = true;

  try {
    // 1. Load existing cache from disk (instant, no API calls)
    cacheRefresher.initialize();

    // 2. Start periodic background check (spawns worker if cache expired)
    cacheRefresher.startBackgroundRefresh();

    console.log('✅ Server cache system ready (serves stale data while worker refreshes)');
  } catch (error) {
    console.error('❌ Cache init error:', error.message);
  }
}

// Auto-start on module load (synchronous, non-blocking)
initializeCache();
