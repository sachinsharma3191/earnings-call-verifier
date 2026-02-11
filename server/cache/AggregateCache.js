// AggregateCache: In-memory cache for pre-computed aggregated data
// Stores the full aggregated response so endpoints can filter instantly
// Backed by file cache for persistence, with its own TTL

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Detect if running in serverless environment (Vercel, AWS Lambda, etc.)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

class AggregateCache {
  constructor({ ttlMs = DEFAULT_TTL_MS } = {}) {
    this.ttlMs = ttlMs;
    // Use /tmp in serverless environments (only writable directory)
    this.cacheDir = isServerless 
      ? join('/tmp', '.cache')
      : join(__dirname, '../../.cache');
    this.cacheFile = join(this.cacheDir, 'aggregate.json');
    this.ensureCacheDir();

    // In-memory for fast access
    this.memCache = null;
    this.memTimestamp = 0;

    // Load from file on startup
    this._loadFromFile();
  }

  ensureCacheDir() {
    try {
      if (!existsSync(this.cacheDir)) {
        mkdirSync(this.cacheDir, { recursive: true });
      }
    } catch (error) {
      // In serverless, cache dir creation might fail - that's ok, we'll work without cache
      console.warn(`[AggregateCache] Could not create cache dir: ${error.message}`);
    }
  }

  _loadFromFile() {
    try {
      if (existsSync(this.cacheFile)) {
        const raw = readFileSync(this.cacheFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed?.data && parsed?.timestamp) {
          this.memCache = parsed.data;
          this.memTimestamp = parsed.timestamp;
          console.log(`[AggregateCache] Loaded from file (age: ${this.getAgeMinutes()}min)`);
        }
      }
    } catch (err) {
      console.error('[AggregateCache] Error loading from file:', err.message);
    }
  }

  _saveToFile() {
    try {
      const payload = {
        data: this.memCache,
        timestamp: this.memTimestamp,
        lastUpdated: new Date().toISOString()
      };
      writeFileSync(this.cacheFile, JSON.stringify(payload));
    } catch (err) {
      console.error('[AggregateCache] Error saving to file:', err.message);
    }
  }

  isExpired() {
    if (!this.memCache || !this.memTimestamp) return true;
    return Date.now() - this.memTimestamp > this.ttlMs;
  }

  getAgeMs() {
    if (!this.memTimestamp) return Infinity;
    return Date.now() - this.memTimestamp;
  }

  getAgeMinutes() {
    return Math.round(this.getAgeMs() / 60000);
  }

  // Store the full aggregated dataset
  set(data) {
    this.memCache = data;
    this.memTimestamp = Date.now();
    this._saveToFile();
    console.log(`[AggregateCache] Updated (${Object.keys(data).length} companies)`);
  }

  // Get the full aggregated dataset (null if expired)
  get() {
    if (this.isExpired()) return null;
    return this.memCache;
  }

  // Get even if expired (stale-while-revalidate)
  getStale() {
    return this.memCache;
  }

  // Get a single company from the aggregate
  getCompany(ticker) {
    const data = this.memCache;
    if (!data) return null;
    return data[ticker] || null;
  }

  // Get a specific quarter for a company
  getQuarter(ticker, quarter) {
    const company = this.getCompany(ticker);
    if (!company?.quarters) return null;
    return company.quarters.find(q => q.quarter === quarter) || null;
  }

  // Re-read from file (picks up data written by worker process)
  reload() {
    this._loadFromFile();
  }

  hasData() {
    return this.memCache !== null && Object.keys(this.memCache).length > 0;
  }

  clear() {
    this.memCache = null;
    this.memTimestamp = 0;
    this._saveToFile();
  }

  getStats() {
    const companies = this.memCache ? Object.keys(this.memCache).length : 0;
    return {
      name: 'aggregate',
      companies,
      isExpired: this.isExpired(),
      ageMs: this.getAgeMs(),
      ageMinutes: this.getAgeMinutes(),
      ttlMs: this.ttlMs,
      ttlMinutes: Math.round(this.ttlMs / 60000),
      lastUpdated: this.memTimestamp ? new Date(this.memTimestamp).toISOString() : null
    };
  }
}

// Singleton
export const aggregateCache = new AggregateCache({ ttlMs: DEFAULT_TTL_MS });
