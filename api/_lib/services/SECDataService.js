
// Single Responsibility: Handle SEC EDGAR data fetching and processing

export class SECDataService {
  constructor() {
    this.baseUrl = 'https://data.sec.gov';
    this.userAgent = 'EarningsVerifier/1.0';
  }

  async getCompanyFinancials(cik) {
    const paddedCik = cik.padStart(10, '0');
    const url = `${this.baseUrl}/api/xbrl/companyfacts/CIK${paddedCik}.json`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`SEC API error: ${response.status}`);
    }

    const data = await response.json();
    const quarters = this.extractQuarterlyData(data);

    return {
      cik: data.cik,
      company_name: data.entityName,
      ticker: this.extractTicker(data),
      quarters
    };
  }

  async getQuarterlyData(cik) {
    const financials = await this.getCompanyFinancials(cik);
    return financials.quarters;
  }

  extractTicker(data) {
    return data.tickers?.[0] || '';
  }

  extractQuarterlyData(data) {
    const facts = data.facts?.['us-gaap'] || {};
    const quartersMap = new Map();

    const revenueData1 = facts.Revenues?.units?.USD || [];
    const revenueData2 = facts.RevenueFromContractWithCustomerExcludingAssessedTax?.units?.USD || [];
    const revenueData = [...revenueData1, ...revenueData2];

    // console.log(`[SECDataService] Revenue data points found: ${revenueData.length}`);

    revenueData.forEach((item) => {
      let quarter = null;
      let year = null;

      // Strategy: Prioritize 'fp' (Fiscal Period) and 'fy' (Fiscal Year)
      if (item.fp && item.fy) {
        if (item.fp.startsWith('Q')) {
          quarter = item.fp;
          year = item.fy;
        }
      }

      // Fallback: 'frame' field
      if (!quarter && item.frame) {
        const frameMatch = item.frame.match(/Q(\d)$/);
        if (frameMatch) {
          quarter = `Q${frameMatch[1]}`;
          year = new Date(item.end).getFullYear();
        }
      }

      if (quarter && year && item.end && item.start) {

        // Duration check: Ensure it's a quarterly figure (~90 days), not YTD (~270 days)
        const startDate = new Date(item.start);
        const endDate = new Date(item.end);
        const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

        // Allow some flexibility (75-105 days)
        if (durationDays < 75 || durationDays > 105) {
          return;
        }

        // Filter: include data from last 4 years
        const currentYear = new Date().getFullYear();
        if (year < currentYear - 4) {
          return;
        }

        const key = `Q${quarter.replace('Q', '')}-${year}`; // Format: Q4-2025

        // Logic: prefer the latest filing date for corrections
        if (!quartersMap.has(key) || new Date(item.filed) > new Date(quartersMap.get(key).filed)) {
          quartersMap.set(key, {
            end_date: item.end,
            fiscal_year: year,
            fiscal_period: quarter,
            filed: item.filed,
            form: item.form,
            Revenues: item.val / 1e9,
            NetIncome: this.extractMetric(facts, 'NetIncomeLoss', item.end) / 1e9,
            GrossProfit: this.extractMetric(facts, 'GrossProfit', item.end) / 1e9,
            OperatingIncome: this.extractMetric(facts, 'OperatingIncomeLoss', item.end) / 1e9,
            CostOfRevenue: this.extractMetric(facts, 'CostOfRevenue', item.end) / 1e9,
            OperatingExpenses: this.extractMetric(facts, 'OperatingExpenses', item.end) / 1e9,
            EPS: this.extractMetric(facts, 'EarningsPerShareBasic', item.end)
          });
        }
      }
    });

    const quarters = Array.from(quartersMap.values());

    // Sort descending by date
    return quarters.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
  }

  extractMetric(facts, metricName, endDate) {
    const metricData = facts[metricName]?.units?.USD || [];
    // We strictly match endDate, but we should probably also check start date/duration to avoid YTD matching logic issues for other metrics?
    // Usually matching 'end' is enough if the main loop filtered the quarter correctly, 
    // BUT what if 'NetIncome' has both Q3 (3mo) and Q3 (9mo) ending on same date?
    // We should pick the one with similar duration or smallest duration?
    // For now, let's pick the one < 105 days.

    const candidates = metricData.filter((item) => item.end === endDate);
    if (candidates.length === 0) return 0;

    // Find the one with ~90 days duration
    const quarterly = candidates.find(item => {
      if (!item.start) return false;
      const d = (new Date(item.end) - new Date(item.start)) / (1000 * 60 * 60 * 24);
      return d > 75 && d < 105;
    });

    return quarterly?.val || candidates[0]?.val || 0;
  }
}
