// Single Responsibility: Handle SEC EDGAR data fetching and processing
import { ISECDataProvider, CompanyFinancials, QuarterData } from '../interfaces/ISECDataProvider';

export class SECDataService implements ISECDataProvider {
  private readonly baseUrl = 'https://data.sec.gov';
  private readonly userAgent = 'EarningsVerifier/1.0';

  async getCompanyFinancials(cik: string): Promise<CompanyFinancials> {
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

  async getQuarterlyData(cik: string): Promise<QuarterData[]> {
    const financials = await this.getCompanyFinancials(cik);
    return financials.quarters;
  }

  private extractTicker(data: any): string {
    // Extract ticker from SEC data
    return data.tickers?.[0] || '';
  }

  private extractQuarterlyData(data: any): QuarterData[] {
    const facts = data.facts?.['us-gaap'] || {};
    const quarters: QuarterData[] = [];

    // Extract revenue data
    const revenueData = facts.Revenues?.units?.USD || facts.RevenueFromContractWithCustomerExcludingAssessedTax?.units?.USD || [];
    
    // Process each filing
    revenueData.forEach((item: any) => {
      if (item.form === '10-Q' || item.form === '10-K') {
        quarters.push({
          end_date: item.end,
          fiscal_year: item.fy,
          fiscal_period: item.fp,
          filed: item.filed,
          form: item.form,
          Revenues: item.val / 1e9, // Convert to billions
          NetIncome: this.extractMetric(facts, 'NetIncomeLoss', item.end) / 1e9,
          GrossProfit: this.extractMetric(facts, 'GrossProfit', item.end) / 1e9,
          OperatingIncome: this.extractMetric(facts, 'OperatingIncomeLoss', item.end) / 1e9,
          CostOfRevenue: this.extractMetric(facts, 'CostOfRevenue', item.end) / 1e9,
          OperatingExpenses: this.extractMetric(facts, 'OperatingExpenses', item.end) / 1e9,
          EPS: this.extractMetric(facts, 'EarningsPerShareBasic', item.end)
        });
      }
    });

    // Sort by date descending
    return quarters.sort((a, b) => {
      if (a.fiscal_year !== b.fiscal_year) {
        return b.fiscal_year - a.fiscal_year;
      }
      return b.fiscal_period.localeCompare(a.fiscal_period);
    });
  }

  private extractMetric(facts: any, metricName: string, endDate: string): number {
    const metricData = facts[metricName]?.units?.USD || [];
    const match = metricData.find((item: any) => item.end === endDate);
    return match?.val || 0;
  }
}
