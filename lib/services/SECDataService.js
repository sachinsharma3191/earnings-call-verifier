
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

    // Revenue: try all known XBRL names (including bank-specific InterestIncomeExpenseNet)
    const revenueSources = [
      'Revenues',
      'RevenueFromContractWithCustomerExcludingAssessedTax',
      'RevenueFromContractWithCustomerIncludingAssessedTax',
      'SalesRevenueNet',
      'InterestIncomeExpenseNet'
    ];
    let revenueData = [];
    for (const src of revenueSources) {
      const items = facts[src]?.units?.USD || [];
      if (items.length > 0) {
        revenueData = [...revenueData, ...items];
      }
    }

    revenueData.forEach((item) => {
      let quarter = null;
      let year = null;

      if (item.fp && item.fy) {
        if (item.fp.startsWith('Q')) {
          quarter = item.fp;
          year = item.fy;
        }
      }

      if (!quarter && item.frame) {
        const frameMatch = item.frame.match(/Q(\d)$/);
        if (frameMatch) {
          quarter = `Q${frameMatch[1]}`;
          year = new Date(item.end).getFullYear();
        }
      }

      if (quarter && year && item.end && item.start) {
        const startDate = new Date(item.start);
        const endDate = new Date(item.end);
        const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

        if (durationDays < 75 || durationDays > 105) return;
        if (year !== 2025) return;

        const key = `Q${quarter.replace('Q', '')}-${year}`;

        if (!quartersMap.has(key) || new Date(item.filed) > new Date(quartersMap.get(key).filed)) {
          const end = item.end;
          const revenue = item.val / 1e9;

          const netIncome = this.extractMetricMulti(facts, [
            'NetIncomeLoss', 'NetIncomeLossAvailableToCommonStockholdersBasic', 'ProfitLoss'
          ], end) / 1e9;

          const grossProfit = this.extractMetric(facts, 'GrossProfit', end) / 1e9;

          const operatingIncome = this.extractMetricMulti(facts, [
            'OperatingIncomeLoss',
            'IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest'
          ], end) / 1e9;

          const costOfRevenue = this.extractMetricMulti(facts, [
            'CostOfRevenue', 'CostOfGoodsAndServicesSold', 'CostOfGoodsSold'
          ], end) / 1e9;

          let operatingExpenses = this.extractMetricMulti(facts, [
            'OperatingExpenses', 'OperatingCostsAndExpenses', 'CostsAndExpenses', 'NoninterestExpense'
          ], end) / 1e9;

          const eps = this.extractMetricMulti(facts, [
            'EarningsPerShareDiluted', 'EarningsPerShareBasic'
          ], end, true);

          // Computed fallbacks for missing data
          const computedGrossProfit = grossProfit || (revenue && costOfRevenue ? revenue - costOfRevenue : 0);

          quartersMap.set(key, {
            end_date: end,
            fiscal_year: year,
            fiscal_period: quarter,
            filed: item.filed,
            form: item.form,
            Revenues: revenue,
            NetIncome: netIncome,
            GrossProfit: computedGrossProfit,
            OperatingIncome: operatingIncome,
            CostOfRevenue: costOfRevenue,
            OperatingExpenses: operatingExpenses,
            EPS: eps
          });
        }
      }
    });

    const quarters = Array.from(quartersMap.values());
    return quarters.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
  }

  extractMetric(facts, metricName, endDate, isPerShare = false) {
    const units = isPerShare ? (facts[metricName]?.units?.['USD/shares'] || []) : (facts[metricName]?.units?.USD || []);

    const candidates = units.filter((item) => item.end === endDate);
    if (candidates.length === 0) return 0;

    // Find the one with ~90 days duration (quarterly, not YTD)
    const quarterly = candidates.find(item => {
      if (!item.start) return false;
      const d = (new Date(item.end) - new Date(item.start)) / (1000 * 60 * 60 * 24);
      return d > 75 && d < 105;
    });

    return quarterly?.val || candidates[0]?.val || 0;
  }

  // Try multiple XBRL concept names, return first non-zero match
  extractMetricMulti(facts, metricNames, endDate, isPerShare = false) {
    for (const name of metricNames) {
      const val = this.extractMetric(facts, name, endDate, isPerShare);
      if (val !== 0) return val;
    }
    return 0;
  }
}
