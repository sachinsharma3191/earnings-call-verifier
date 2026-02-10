/**
 * API Client for Backend Communication
 * Handles all HTTP requests to the Flask backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Companies
  async getCompanies() {
    return this.request('/companies/');
  }

  async getCompany(ticker, quarters = 4) {
    return this.request(`/companies/${ticker}?quarters=${quarters}`);
  }

  async getCompanyQuarters(ticker) {
    return this.request(`/companies/${ticker}/quarters`);
  }

  async getQuarterMetrics(ticker, quarter) {
    const encodedQuarter = encodeURIComponent(quarter);
    return this.request(`/companies/${ticker}/metrics/${encodedQuarter}`);
  }

  // Claims
  async extractClaims(transcript, ticker, quarter) {
    return this.request('/claims/extract', {
      method: 'POST',
      body: JSON.stringify({ transcript, ticker, quarter }),
    });
  }

  async getSampleClaims(ticker, quarter) {
    const encodedQuarter = encodeURIComponent(quarter);
    return this.request(`/claims/sample/${ticker}/${encodedQuarter}`);
  }

  // Verification
  async verifyClaims(claims, ticker, quarter) {
    return this.request('/verification/verify', {
      method: 'POST',
      body: JSON.stringify({ claims, ticker, quarter }),
    });
  }

  async verifyTranscript(transcript, ticker, quarter) {
    return this.request('/verification/verify-transcript', {
      method: 'POST',
      body: JSON.stringify({ transcript, ticker, quarter }),
    });
  }

  async getFullCompanyAnalysis(ticker) {
    return this.request(`/verification/company/${ticker}/full-analysis`);
  }

  async getStatistics() {
    return this.request('/verification/statistics');
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export class for testing
export default APIClient;
