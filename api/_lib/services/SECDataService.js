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
      name: data.entityName,
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
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 1; // Only last 1 year (2025-2026 if current is 2026)

    const revenueData = facts.Revenues?.units?.USD || facts.RevenueFromContractWithCustomerExcludingAssessedTax?.units?.USD || [];
    
    revenueData.forEach((item) => {
      // Extract quarter from frame field (e.g., "CY2024Q3" -> "Q3")
      const frameMatch = item.frame?.match(/Q(\d)$/);
      if (frameMatch && item.end) {
        const quarter = `Q${frameMatch[1]}`;
        const year = new Date(item.end).getFullYear();
        
        // Filter: only include data from last 1 year (2025-2026)
        if (year < minYear) {
          return; // Skip old data
        }
        
        const key = `${year}-${quarter}`;
        
        // Only keep the most recent filing for each quarter
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
    
    return quarters.sort((a, b) => {
      if (a.fiscal_year !== b.fiscal_year) {
        return b.fiscal_year - a.fiscal_year;
      }
      const qOrder = { 'Q4': 4, 'Q3': 3, 'Q2': 2, 'Q1': 1 };
      return (qOrder[b.fiscal_period] || 0) - (qOrder[a.fiscal_period] || 0);
    }).slice(0, 4); // Limit to 4 most recent quarters
  }

  extractMetric(facts, metricName, endDate) {
    const metricData = facts[metricName]?.units?.USD || [];
    const match = metricData.find((item) => item.end === endDate);
    return match?.val || 0;
  }
}
