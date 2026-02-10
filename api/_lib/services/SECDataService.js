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

    const revenueData = facts.Revenues?.units?.USD || facts.RevenueFromContractWithCustomerExcludingAssessedTax?.units?.USD || [];
    
    revenueData.forEach((item) => {
      if (item.form === '10-Q') {
        const key = `${item.fy}-${item.fp}`;
        
        if (!quartersMap.has(key)) {
          quartersMap.set(key, {
            end_date: item.end,
            fiscal_year: item.fy,
            fiscal_period: item.fp,
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
    }).slice(0, 8);
  }

  extractMetric(facts, metricName, endDate) {
    const metricData = facts[metricName]?.units?.USD || [];
    const match = metricData.find((item) => item.end === endDate);
    return match?.val || 0;
  }
}
