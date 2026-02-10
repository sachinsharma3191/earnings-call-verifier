// Interface for SEC data providers
export interface ISECDataProvider {
  getCompanyFinancials(cik: string): Promise<CompanyFinancials>;
  getQuarterlyData(cik: string): Promise<QuarterData[]>;
}

export interface CompanyFinancials {
  cik: string;
  name: string;
  ticker: string;
  quarters: QuarterData[];
}

export interface QuarterData {
  end_date: string;
  fiscal_year: number;
  fiscal_period: string;
  filed: string;
  form: string;
  Revenues?: number;
  NetIncome?: number;
  GrossProfit?: number;
  OperatingIncome?: number;
  CostOfRevenue?: number;
  OperatingExpenses?: number;
  EPS?: number;
}
