// CacheRefresher: Background process that periodically recomputes expired data
// - Runs on a configurable interval (default 30 min)
// - Checks if aggregate cache is expired
// - If expired, recomputes all company data using DataAggregator
// - Uses stale-while-revalidate: serves old data while refreshing in background

import { fileCache } from './FileCache.js';
import { aggregateCache } from './AggregateCache.js';
import { DataAggregator } from '../services/DataAggregator.js';
import { TICKER_TO_CIK } from '../constants/index.js';

const DEFAULT_REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

class CacheRefresher {
  constructor({ refreshIntervalMs = DEFAULT_REFRESH_INTERVAL_MS, scrapeTranscripts = true } = {}) {
    this.refreshIntervalMs = refreshIntervalMs;
    this.scrapeTranscripts = scrapeTranscripts;
    this.intervalHandle = null;
    this.isRefreshing = false;
    this.lastRefreshTime = null;
    this.refreshCount = 0;
  }

  // Initial load: populate caches on server start
  async initialize() {
    console.log('🔄 CacheRefresher: Initializing...');

    // If aggregate cache has valid (non-expired) data, use it
    if (!aggregateCache.isExpired() && aggregateCache.hasData()) {
      console.log(`✅ CacheRefresher: Aggregate cache valid (age: ${aggregateCache.getAgeMinutes()}min)`);
      // Also populate fileCache from aggregate for backward compat
      this._syncToFileCache(aggregateCache.getStale());
      return;
    }

    // If aggregate has stale data, serve it while we refresh
    if (aggregateCache.hasData()) {
      console.log(`⏳ CacheRefresher: Aggregate cache stale (age: ${aggregateCache.getAgeMinutes()}min), serving stale while refreshing...`);
      this._syncToFileCache(aggregateCache.getStale());
      // Refresh in background
      this.refresh().catch(err => console.error('Background refresh failed:', err.message));
      return;
    }

    // No data at all - must compute fresh
    console.log('📡 CacheRefresher: No cached data, computing fresh...');
    await this.refresh();
  }

  // Start the background refresh interval
  startBackgroundRefresh() {
    if (this.intervalHandle) {
      console.log('[CacheRefresher] Background refresh already running');
      return;
    }

    const intervalMin = Math.round(this.refreshIntervalMs / 60000);
    console.log(`🔁 CacheRefresher: Background refresh started (every ${intervalMin} min)`);

    this.intervalHandle = setInterval(async () => {
      console.log(`[CacheRefresher] Periodic check (aggregate age: ${aggregateCache.getAgeMinutes()}min, expired: ${aggregateCache.isExpired()})`);

      if (aggregateCache.isExpired()) {
        console.log('[CacheRefresher] Cache expired, triggering refresh...');
        await this.refresh();
      } else {
        console.log('[CacheRefresher] Cache still valid, skipping refresh');
      }
    }, this.refreshIntervalMs);
  }

  // Stop the background refresh
  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      console.log('[CacheRefresher] Background refresh stopped');
    }
  }

  // Recompute all company data and update both caches
  async refresh() {
    if (this.isRefreshing) {
      console.log('[CacheRefresher] Already refreshing, skipping...');
      return;
    }

    this.isRefreshing = true;
    const startTime = Date.now();
    console.log('[CacheRefresher] 🔄 Refreshing all company data...');

    try {
      const aggregator = new DataAggregator({ scrapeTranscripts: this.scrapeTranscripts });
      const aggregateData = {};
      let successCount = 0;
      let failedCount = 0;

      for (const ticker of Object.keys(TICKER_TO_CIK)) {
        try {
          const data = await aggregator.getCompanyData(ticker);
          if (data) {
            aggregateData[ticker] = data;
            fileCache.set(ticker, data);
            const secQ = data.coverage.financial.sec;
            const staticQ = data.coverage.financial.static;
            const scraped = data.coverage.transcript.scraped;
            const sysDefault = data.coverage.transcript.systemDefault;
            console.log(`  ✓ ${ticker} (${secQ} SEC + ${staticQ} static | ${scraped} scraped, ${sysDefault} default)`);
            successCount++;
          } else {
            failedCount++;
            console.error(`  ✗ ${ticker} - no data returned`);
          }
        } catch (err) {
          failedCount++;
          console.error(`  ✗ ${ticker} failed: ${err.message}`);
        }
      }

      // Update aggregate cache
      aggregateCache.set(aggregateData);

      const duration = Math.round((Date.now() - startTime) / 1000);
      this.lastRefreshTime = new Date().toISOString();
      this.refreshCount++;

      console.log(`[CacheRefresher] ✅ Refresh #${this.refreshCount} complete: ${successCount} success, ${failedCount} failed (${duration}s)`);
    } catch (err) {
      console.error('[CacheRefresher] ❌ Refresh failed:', err.message);
    } finally {
      this.isRefreshing = false;
    }
  }

  // Sync aggregate data into fileCache (for backward compat)
  _syncToFileCache(aggregateData) {
    if (!aggregateData) return;
    for (const [ticker, data] of Object.entries(aggregateData)) {
      if (!fileCache.has(ticker)) {
        fileCache.set(ticker, data);
      }
    }
  }

  getStatus() {
    return {
      isRefreshing: this.isRefreshing,
      lastRefreshTime: this.lastRefreshTime,
      refreshCount: this.refreshCount,
      refreshIntervalMs: this.refreshIntervalMs,
      refreshIntervalMinutes: Math.round(this.refreshIntervalMs / 60000),
      backgroundRunning: this.intervalHandle !== null,
      aggregateCache: aggregateCache.getStats(),
      fileCache: fileCache.getStats()
    };
  }
}

// Singleton
export const cacheRefresher = new CacheRefresher({
  refreshIntervalMs: DEFAULT_REFRESH_INTERVAL_MS,
  scrapeTranscripts: true
});
