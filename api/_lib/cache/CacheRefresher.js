// CacheRefresher: Lightweight orchestrator that spawns a separate worker process
// for heavy data aggregation. The server stays responsive at all times.
//
// Architecture:
//   Server (light) ──spawns──> Worker (heavy, separate process)
//   Server reads from .cache/ files that the worker writes to
//   Server never does SEC API calls or transcript scraping itself

import { fork } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { aggregateCache } from './AggregateCache.js';
import { fileCache } from './FileCache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WORKER_PATH = join(__dirname, '../../../bin/worker.js');

const DEFAULT_CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

class CacheRefresher {
  constructor({ checkIntervalMs = DEFAULT_CHECK_INTERVAL_MS } = {}) {
    this.checkIntervalMs = checkIntervalMs;
    this.intervalHandle = null;
    this.workerProcess = null;
    this.isRefreshing = false;
    this.lastRefreshTime = null;
    this.refreshCount = 0;
    this.lastWorkerDuration = null;
  }

  // Light init: just load whatever is already in the cache files (instant)
  initialize() {
    console.log('[CacheRefresher] Loading existing cache (no heavy work)...');

    if (aggregateCache.hasData()) {
      const age = aggregateCache.getAgeMinutes();
      const expired = aggregateCache.isExpired();
      console.log(`[CacheRefresher] Aggregate cache loaded (age: ${age}min, expired: ${expired})`);

      // Sync to fileCache for backward compat
      this._syncToFileCache(aggregateCache.getStale());

      if (expired) {
        console.log('[CacheRefresher] Cache expired, spawning worker to refresh...');
        this.spawnWorker();
      }
    } else {
      console.log('[CacheRefresher] No cached data found, spawning worker...');
      this.spawnWorker();
    }
  }

  // Start periodic check interval
  startBackgroundRefresh() {
    if (this.intervalHandle) {
      console.log('[CacheRefresher] Background check already running');
      return;
    }

    const intervalMin = Math.round(this.checkIntervalMs / 60000);
    console.log(`🔁 CacheRefresher: Background check started (every ${intervalMin} min)`);

    this.intervalHandle = setInterval(() => {
      // Re-read from file in case worker updated it
      aggregateCache.reload();

      const age = aggregateCache.getAgeMinutes();
      const expired = aggregateCache.isExpired();
      console.log(`[CacheRefresher] Periodic check (age: ${age}min, expired: ${expired})`);

      if (expired && !this.isRefreshing) {
        console.log('[CacheRefresher] Cache expired, spawning worker...');
        this.spawnWorker();
      } else if (this.isRefreshing) {
        console.log('[CacheRefresher] Worker already running, skipping');
      } else {
        // Sync fresh data to fileCache
        this._syncToFileCache(aggregateCache.getStale());
        console.log('[CacheRefresher] Cache valid, no action needed');
      }
    }, this.checkIntervalMs);
  }

  // Spawn worker.js as a separate child process
  spawnWorker() {
    if (this.isRefreshing) {
      console.log('[CacheRefresher] Worker already running, skipping spawn');
      return;
    }

    this.isRefreshing = true;
    console.log(`[CacheRefresher] � Spawning worker process: ${WORKER_PATH}`);

    try {
      this.workerProcess = fork(WORKER_PATH, [], {
        stdio: ['ignore', 'pipe', 'pipe', 'ipc']
      });

      // Pipe worker stdout/stderr to server console with prefix
      this.workerProcess.stdout.on('data', (data) => {
        process.stdout.write(data.toString());
      });
      this.workerProcess.stderr.on('data', (data) => {
        process.stderr.write(data.toString());
      });

      // Listen for completion message from worker
      this.workerProcess.on('message', (msg) => {
        if (msg.type === 'refresh_complete') {
          this.lastRefreshTime = new Date().toISOString();
          this.refreshCount++;
          this.lastWorkerDuration = msg.duration;
          console.log(`[CacheRefresher] Worker completed refresh #${this.refreshCount} (${msg.successCount} success, ${msg.failedCount} failed, ${msg.duration}s)`);

          // Reload caches from files written by worker
          aggregateCache.reload();
          this._syncToFileCache(aggregateCache.getStale());
        }
      });

      this.workerProcess.on('exit', (code) => {
        this.isRefreshing = false;
        this.workerProcess = null;
        if (code === 0) {
          console.log('[CacheRefresher] Worker process exited successfully');
          // Reload caches from files
          aggregateCache.reload();
          this._syncToFileCache(aggregateCache.getStale());
        } else {
          console.error(`[CacheRefresher] Worker process exited with code ${code}`);
        }
      });

      this.workerProcess.on('error', (err) => {
        this.isRefreshing = false;
        this.workerProcess = null;
        console.error('[CacheRefresher] Worker process error:', err.message);
      });
    } catch (err) {
      this.isRefreshing = false;
      console.error('[CacheRefresher] Failed to spawn worker:', err.message);
    }
  }

  // Stop background check and kill worker if running
  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      console.log('[CacheRefresher] Background check stopped');
    }
    if (this.workerProcess) {
      this.workerProcess.kill();
      this.workerProcess = null;
      this.isRefreshing = false;
      console.log('[CacheRefresher] Worker process killed');
    }
  }

  // Sync aggregate data into fileCache
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
      workerPid: this.workerProcess?.pid || null,
      lastRefreshTime: this.lastRefreshTime,
      lastWorkerDuration: this.lastWorkerDuration,
      refreshCount: this.refreshCount,
      checkIntervalMs: this.checkIntervalMs,
      checkIntervalMinutes: Math.round(this.checkIntervalMs / 60000),
      backgroundRunning: this.intervalHandle !== null,
      aggregateCache: aggregateCache.getStats(),
      fileCache: fileCache.getStats()
    };
  }
}

// Singleton
export const cacheRefresher = new CacheRefresher({
  checkIntervalMs: DEFAULT_CHECK_INTERVAL_MS
});
