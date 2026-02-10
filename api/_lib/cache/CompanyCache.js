// In-memory cache for company data to avoid slow SEC API calls
class CompanyCache {
  constructor() {
    this.cache = new Map();
    this.lastUpdated = null;
    this.isLoading = false;
  }

  set(ticker, data) {
    this.cache.set(ticker, {
      data,
      timestamp: Date.now()
    });
  }

  get(ticker) {
    const cached = this.cache.get(ticker);
    if (!cached) return null;
    
    // Cache expires after 1 hour
    const isExpired = Date.now() - cached.timestamp > 3600000;
    if (isExpired) {
      this.cache.delete(ticker);
      return null;
    }
    
    return cached.data;
  }

  has(ticker) {
    return this.get(ticker) !== null;
  }

  clear() {
    this.cache.clear();
    this.lastUpdated = null;
  }

  getAll() {
    const result = {};
    for (const [ticker, cached] of this.cache.entries()) {
      const isExpired = Date.now() - cached.timestamp > 3600000;
      if (!isExpired) {
        result[ticker] = cached.data;
      }
    }
    return result;
  }

  setLoading(loading) {
    this.isLoading = loading;
  }

  getLoadingStatus() {
    return this.isLoading;
  }
}

// Singleton instance
export const companyCache = new CompanyCache();
