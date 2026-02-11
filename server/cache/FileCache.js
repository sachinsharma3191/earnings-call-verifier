import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Detect if running in serverless environment (Vercel, AWS Lambda, etc.)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

// File-based cache that persists across server restarts
// TTL-based expiry: entries expire after configurable duration
class FileCache {
  constructor({ ttlMs = DEFAULT_TTL_MS, name = 'companies' } = {}) {
    this.ttlMs = ttlMs;
    this.name = name;
    // Use /tmp in serverless environments (only writable directory)
    this.cacheDir = isServerless 
      ? join('/tmp', '.cache')
      : join(__dirname, '../../.cache');
    this.cacheFile = join(this.cacheDir, `${name}.json`);
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    try {
      if (!existsSync(this.cacheDir)) {
        mkdirSync(this.cacheDir, { recursive: true });
      }
    } catch (error) {
      // In serverless, cache dir creation might fail - that's ok, we'll work without cache
      console.warn(`[FileCache] Could not create cache dir: ${error.message}`);
    }
  }

  loadCache() {
    try {
      if (existsSync(this.cacheFile)) {
        const data = readFileSync(this.cacheFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error(`[${this.name}Cache] Error loading:`, error.message);
    }
    return { entries: {}, lastUpdated: null };
  }

  saveCache(cache) {
    try {
      writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2));
    } catch (error) {
      console.error(`[${this.name}Cache] Error saving:`, error.message);
    }
  }

  isEntryExpired(entry) {
    if (!entry || !entry.timestamp) return true;
    return Date.now() - entry.timestamp > this.ttlMs;
  }

  get(key) {
    const cache = this.loadCache();
    const entry = cache.entries[key];

    if (!entry) return null;

    if (this.isEntryExpired(entry)) {
      return null;
    }

    return entry.data;
  }

  set(key, data) {
    const cache = this.loadCache();
    cache.entries[key] = {
      data,
      timestamp: Date.now()
    };
    cache.lastUpdated = new Date().toISOString();
    this.saveCache(cache);
  }

  getAll() {
    const cache = this.loadCache();
    const result = {};

    for (const [key, entry] of Object.entries(cache.entries)) {
      if (!this.isEntryExpired(entry)) {
        result[key] = entry.data;
      }
    }

    return result;
  }

  // Get all entries including expired ones (for stale-while-revalidate)
  getAllIncludingExpired() {
    const cache = this.loadCache();
    const result = {};
    for (const [key, entry] of Object.entries(cache.entries)) {
      result[key] = entry.data;
    }
    return result;
  }

  has(key) {
    return this.get(key) !== null;
  }

  hasAny() {
    return Object.keys(this.getAllIncludingExpired()).length > 0;
  }

  clear() {
    this.saveCache({ entries: {}, lastUpdated: null });
  }

  // Get age of a specific entry in ms
  getAge(key) {
    const cache = this.loadCache();
    const entry = cache.entries[key];
    if (!entry?.timestamp) return Infinity;
    return Date.now() - entry.timestamp;
  }

  // Get the oldest entry age across all entries
  getOldestAge() {
    const cache = this.loadCache();
    let oldest = 0;
    for (const entry of Object.values(cache.entries)) {
      if (entry.timestamp) {
        const age = Date.now() - entry.timestamp;
        if (age > oldest) oldest = age;
      }
    }
    return oldest;
  }

  // Check if any entries are expired
  hasExpiredEntries() {
    const cache = this.loadCache();
    for (const entry of Object.values(cache.entries)) {
      if (this.isEntryExpired(entry)) return true;
    }
    return false;
  }

  getStats() {
    const cache = this.loadCache();
    const entries = Object.entries(cache.entries);
    const valid = entries.filter(([, e]) => !this.isEntryExpired(e));
    const expired = entries.filter(([, e]) => this.isEntryExpired(e));
    return {
      name: this.name,
      total: entries.length,
      valid: valid.length,
      expired: expired.length,
      ttlMs: this.ttlMs,
      ttlMinutes: Math.round(this.ttlMs / 60000),
      lastUpdated: cache.lastUpdated,
      oldestAgeMs: this.getOldestAge()
    };
  }
}

// Singleton: per-company data cache (15 min TTL)
export const fileCache = new FileCache({ ttlMs: DEFAULT_TTL_MS, name: 'companies' });
