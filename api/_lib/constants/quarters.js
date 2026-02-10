// Quarter constants - mock and static fallback data

export const MOCK_QUARTERS = [
  { 
    fiscal_period: 'Q4', fiscal_year: 2025, end_date: '2025-12-31', filed: '2026-01-31', 
    Revenues: 124.3, NetIncome: 35.2, GrossProfit: 57.1, OperatingIncome: 42.8,
    CostOfRevenue: 67.2, OperatingExpenses: 14.9, EPS: 2.30
  },
  { 
    fiscal_period: 'Q3', fiscal_year: 2025, end_date: '2025-09-30', filed: '2025-10-31', 
    Revenues: 94.9, NetIncome: 22.5, GrossProfit: 44.3, OperatingIncome: 29.2,
    CostOfRevenue: 50.6, OperatingExpenses: 15.1, EPS: 1.46
  },
  { 
    fiscal_period: 'Q2', fiscal_year: 2025, end_date: '2025-06-30', filed: '2025-07-31', 
    Revenues: 85.8, NetIncome: 21.4, GrossProfit: 40.1, OperatingIncome: 27.4,
    CostOfRevenue: 45.7, OperatingExpenses: 12.7, EPS: 1.40
  },
  { 
    fiscal_period: 'Q1', fiscal_year: 2025, end_date: '2025-03-31', filed: '2025-04-30', 
    Revenues: 90.8, NetIncome: 23.6, GrossProfit: 41.9, OperatingIncome: 28.3,
    CostOfRevenue: 48.9, OperatingExpenses: 13.6, EPS: 1.53
  }
];

export const STATIC_QUARTERS = [
  { quarter: 'Q4 2025', endDate: '2025-12-31', filed: '2026-01-31' },
  { quarter: 'Q3 2025', endDate: '2025-09-30', filed: '2025-10-31' },
  { quarter: 'Q2 2025', endDate: '2025-06-30', filed: '2025-07-31' },
  { quarter: 'Q1 2025', endDate: '2025-03-31', filed: '2025-04-30' }
];
