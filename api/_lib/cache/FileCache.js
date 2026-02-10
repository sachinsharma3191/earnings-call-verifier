import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// File-based cache that persists across server restarts
class FileCache {
  constructor() {
    this.cacheDir = join(__dirname, '../../.cache');
    this.cacheFile = join(this.cacheDir, 'companies.json');
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  loadCache() {
    try {
      if (existsSync(this.cacheFile)) {
        const data = readFileSync(this.cacheFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
    return { companies: {}, lastUpdated: null };
  }

  saveCache(cache) {
    try {
      writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }

  get(ticker) {
    const cache = this.loadCache();
    const cached = cache.companies[ticker];
    
    if (!cached) return null;
    
    // Cache expires after 1 hour
    const isExpired = Date.now() - cached.timestamp > 3600000;
    if (isExpired) {
      return null;
    }
    
    return cached.data;
  }

  set(ticker, data) {
    const cache = this.loadCache();
    cache.companies[ticker] = {
      data,
      timestamp: Date.now()
    };
    cache.lastUpdated = new Date().toISOString();
    this.saveCache(cache);
  }

  getAll() {
    const cache = this.loadCache();
    const result = {};
    
    for (const [ticker, cached] of Object.entries(cache.companies)) {
      const isExpired = Date.now() - cached.timestamp > 3600000;
      if (!isExpired) {
        result[ticker] = cached.data;
      }
    }
    
    return result;
  }

  clear() {
    this.saveCache({ companies: {}, lastUpdated: null });
  }

  has(ticker) {
    return this.get(ticker) !== null;
  }
}

// Singleton instance
export const fileCache = new FileCache();
