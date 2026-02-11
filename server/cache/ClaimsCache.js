import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Detect if running in serverless environment (Vercel, AWS Lambda, etc.)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Persistent claims cache — no TTL, claims are stored forever
class ClaimsCache {
  constructor() {
    if (isServerless) {
      // In serverless, try to load from project root .cache (deployed with app)
      // Fall back to /tmp/.cache for writes
      const projectCache = join(__dirname, '../../.cache');
      const tmpCache = join('/tmp', '.cache');
      
      // Check if pre-built cache exists in project root
      const projectCacheFile = join(projectCache, 'claims.json');
      this.cacheDir = existsSync(projectCacheFile) ? projectCache : tmpCache;
    } else {
      this.cacheDir = join(__dirname, '../../.cache');
    }
    
    this.cacheFile = join(this.cacheDir, 'claims.json');
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    try {
      if (!existsSync(this.cacheDir)) {
        mkdirSync(this.cacheDir, { recursive: true });
      }
    } catch (error) {
      // In serverless, cache dir creation might fail - that's ok, we'll work without cache
      console.warn(`[ClaimsCache] Could not create cache dir: ${error.message}`);
    }
  }

  load() {
    try {
      if (existsSync(this.cacheFile)) {
        return JSON.parse(readFileSync(this.cacheFile, 'utf-8'));
      }
    } catch (e) {
      console.error('[ClaimsCache] Error loading:', e.message);
    }
    return { claims: [], lastUpdated: null };
  }

  save(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('[ClaimsCache] Error saving:', e.message);
    }
  }

  // Store a batch of verified claims (from one verification run)
  store(ticker, quarter, verifiedClaims, summary) {
    const data = this.load();
    const timestamp = new Date().toISOString();
    const batchId = `${ticker}_${quarter}_${Date.now()}`;

    // Add each claim with metadata
    for (const claim of verifiedClaims) {
      data.claims.push({
        ...claim,
        ticker: ticker.toUpperCase(),
        quarter,
        batchId,
        storedAt: timestamp,
      });
    }

    this.save(data);
    return { batchId, count: verifiedClaims.length };
  }

  // Search claims with flexible filters
  search({ ticker, quarter, metric, status, severity, speaker, text, limit = 50, offset = 0 } = {}) {
    const data = this.load();
    let results = data.claims;

    if (ticker) {
      const t = ticker.toUpperCase();
      results = results.filter(c => c.ticker === t);
    }
    if (quarter) {
      results = results.filter(c => c.quarter === quarter);
    }
    if (metric) {
      const m = metric.toLowerCase();
      results = results.filter(c => (c.metric || '').toLowerCase().includes(m));
    }
    if (status) {
      results = results.filter(c => c.status === status);
    }
    if (severity) {
      results = results.filter(c => c.severity === severity);
    }
    if (speaker) {
      const s = speaker.toLowerCase();
      results = results.filter(c => (c.speaker || '').toLowerCase().includes(s));
    }
    if (text) {
      const t = text.toLowerCase();
      results = results.filter(c =>
        (c.text || '').toLowerCase().includes(t) ||
        (c.metric || '').toLowerCase().includes(t) ||
        (c.speaker || '').toLowerCase().includes(t)
      );
    }

    const total = results.length;

    // Sort by storedAt descending (newest first)
    results.sort((a, b) => (b.storedAt || '').localeCompare(a.storedAt || ''));

    // Paginate
    results = results.slice(offset, offset + limit);

    return { total, claims: results, limit, offset };
  }

  getStats() {
    const data = this.load();
    const claims = data.claims;
    const tickers = [...new Set(claims.map(c => c.ticker))];
    const statuses = {};
    for (const c of claims) {
      statuses[c.status] = (statuses[c.status] || 0) + 1;
    }
    return {
      totalClaims: claims.length,
      companies: tickers.length,
      tickers,
      byStatus: statuses,
      lastUpdated: data.lastUpdated,
    };
  }
}

export const claimsCache = new ClaimsCache();
