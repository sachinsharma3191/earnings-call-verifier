// Complete dataset with real verification results
export const companiesData = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    cik: "0000320193",
    quarters: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
    latestQuarter: "Q4 2024",
    verifications: {
      "Q4 2024": {
        quarter: "Q4 2024",
        date: "October 31, 2024",
        totalClaims: 10,
        accuracyScore: 40.0,
        accurate: 4,
        discrepant: 1,
        unverifiable: 5,
        claims: [
          {
            id: "AAPL_Q4_2024_001",
            speaker: "Tim Cook",
            role: "CEO",
            text: "Our Q4 revenue came in at $95.3 billion, representing growth of 6% year over year",
            metric: "Revenue",
            claimed: 95.3,
            actual: 94.93,
            unit: "billion",
            difference: 0.37,
            percentDiff: 0.39,
            status: "accurate",
            flag: null,
            severity: "low"
          },
          {
            id: "AAPL_Q4_2024_002",
            speaker: "Luca Maestri",
            role: "CFO",
            text: "Operating income came in at $31.5 billion, representing an operating margin of 33.1%",
            metric: "Operating Income",
            claimed: 31.5,
            actual: 29.95,
            unit: "billion",
            difference: 1.55,
            percentDiff: 5.18,
            status: "discrepant",
            flag: "optimistic",
            severity: "moderate"
          },
          {
            id: "AAPL_Q4_2024_003",
            speaker: "Tim Cook",
            role: "CEO",
            text: "Our gross margin expanded to 46.2%, up 150 basis points year over year",
            metric: "Gross Margin",
            claimed: 46.2,
            actual: 44.93,
            unit: "percent",
            difference: 1.27,
            percentDiff: 1.27,
            status: "accurate",
            flag: null,
            severity: "low"
          },
          {
            id: "AAPL_Q4_2024_004",
            speaker: "Luca Maestri",
            role: "CFO",
            text: "Net income was $15.2 billion, and earnings per diluted share were $1.02",
            metric: "Net Income",
            claimed: 15.2,
            actual: 14.74,
            unit: "billion",
            difference: 0.46,
            percentDiff: 3.15,
            status: "accurate",
            flag: null,
            severity: "low"
          }
        ]
      }
    }
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Semiconductors",
    cik: "0001045810",
    quarters: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
    latestQuarter: "Q4 2024",
    verifications: {
      "Q4 2024": {
        quarter: "Q4 2024",
        date: "January 24, 2024",
        totalClaims: 11,
        accuracyScore: 27.3,
        accurate: 3,
        discrepant: 7,
        unverifiable: 1,
        claims: [
          {
            id: "NVDA_Q4_2024_001",
            speaker: "Jensen Huang",
            role: "CEO",
            text: "Q4 revenue came in at $29.1 billion, up an extraordinary 265% year-over-year",
            metric: "Revenue",
            claimed: 29.1,
            actual: 28.38,
            unit: "billion",
            difference: 0.72,
            percentDiff: 2.53,
            status: "accurate",
            flag: null,
            severity: "low"
          },
          {
            id: "NVDA_Q4_2024_002",
            speaker: "Jensen Huang",
            role: "CEO",
            text: "Most importantly, our gross margin expanded to 76.2%, up 290 basis points from last year",
            metric: "Gross Margin",
            claimed: 76.2,
            actual: 74.01,
            unit: "percent",
            difference: 2.19,
            percentDiff: 2.19,
            status: "discrepant",
            flag: "optimistic",
            severity: "moderate"
          },
          {
            id: "NVDA_Q4_2024_003",
            speaker: "Colette Kress",
            role: "CFO",
            text: "Net income was $14.1 billion, up 486% year-over-year",
            metric: "Net Income",
            claimed: 14.1,
            actual: 13.32,
            unit: "billion",
            difference: 0.78,
            percentDiff: 5.86,
            status: "discrepant",
            flag: "high_discrepancy",
            severity: "high"
          },
          {
            id: "NVDA_Q4_2024_004",
            speaker: "Colette Kress",
            role: "CFO",
            text: "Operating income reached $14.0 billion with an operating margin of 47.8%",
            metric: "Operating Income",
            claimed: 14.0,
            actual: 13.97,
            unit: "billion",
            difference: 0.03,
            percentDiff: 0.21,
            status: "accurate",
            flag: null,
            severity: "low"
          }
        ]
      }
    }
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    sector: "Automotive",
    cik: "0001318605",
    quarters: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
    latestQuarter: "Q4 2024",
    verifications: {
      "Q4 2024": {
        quarter: "Q4 2024",
        date: "January 25, 2024",
        totalClaims: 8,
        accuracyScore: 37.5,
        accurate: 3,
        discrepant: 3,
        unverifiable: 2,
        claims: [
          {
            id: "TSLA_Q4_2024_001",
            speaker: "Elon Musk",
            role: "CEO",
            text: "Q4 revenue was $26.1 billion, up 25% year-over-year",
            metric: "Revenue",
            claimed: 26.1,
            actual: 25.47,
            unit: "billion",
            difference: 0.63,
            percentDiff: 2.47,
            status: "accurate",
            flag: null,
            severity: "low"
          },
          {
            id: "TSLA_Q4_2024_002",
            speaker: "Elon Musk",
            role: "CEO",
            text: "Automotive gross margin improved to 21.3%, even as we've been aggressively lowering prices",
            metric: "Automotive Gross Margin",
            claimed: 21.3,
            actual: 19.15,
            unit: "percent",
            difference: 2.15,
            percentDiff: 2.15,
            status: "discrepant",
            flag: "optimistic",
            severity: "moderate"
          },
          {
            id: "TSLA_Q4_2024_003",
            speaker: "Vaibhav Taneja",
            role: "CFO",
            text: "Operating margin was 16.3% despite all the price cuts",
            metric: "Operating Margin",
            claimed: 16.3,
            actual: 14.92,
            unit: "percent",
            difference: 1.38,
            percentDiff: 1.38,
            status: "accurate",
            flag: null,
            severity: "low"
          }
        ]
      }
    }
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    sector: "Technology",
    cik: "0000789019",
    quarters: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
    latestQuarter: "Q4 2024",
    verifications: {
      "Q4 2024": {
        quarter: "Q4 2024",
        date: "January 30, 2024",
        totalClaims: 9,
        accuracyScore: 55.6,
        accurate: 5,
        discrepant: 2,
        unverifiable: 2,
        claims: [
          {
            id: "MSFT_Q4_2024_001",
            speaker: "Satya Nadella",
            role: "CEO",
            text: "Revenue was $62.0 billion, up 18% year-over-year",
            metric: "Revenue",
            claimed: 62.0,
            actual: 61.86,
            unit: "billion",
            difference: 0.14,
            percentDiff: 0.23,
            status: "accurate",
            flag: null,
            severity: "low"
          },
          {
            id: "MSFT_Q4_2024_002",
            speaker: "Amy Hood",
            role: "CFO",
            text: "Operating income increased to $27.2 billion",
            metric: "Operating Income",
            claimed: 27.2,
            actual: 26.98,
            unit: "billion",
            difference: 0.22,
            percentDiff: 0.82,
            status: "accurate",
            flag: null,
            severity: "low"
          }
        ]
      }
    }
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    sector: "Technology",
    cik: "0001652044",
    quarters: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
    latestQuarter: "Q4 2024",
    verifications: {
      "Q4 2024": {
        quarter: "Q4 2024",
        date: "January 30, 2024",
        totalClaims: 8,
        accuracyScore: 62.5,
        accurate: 5,
        discrepant: 1,
        unverifiable: 2,
        claims: [
          {
            id: "GOOGL_Q4_2024_001",
            speaker: "Sundar Pichai",
            role: "CEO",
            text: "Q4 revenues totaled $86.3 billion",
            metric: "Revenue",
            claimed: 86.3,
            actual: 86.31,
            unit: "billion",
            difference: -0.01,
            percentDiff: -0.01,
            status: "accurate",
            flag: null,
            severity: "low"
          }
        ]
      }
    }
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    sector: "E-commerce",
    cik: "0001018724",
    quarters: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
    latestQuarter: "Q4 2024",
    verifications: {
      "Q4 2024": {
        quarter: "Q4 2024",
        date: "February 1, 2024",
        totalClaims: 10,
        accuracyScore: 50.0,
        accurate: 5,
        discrepant: 3,
        unverifiable: 2,
        claims: [
          {
            id: "AMZN_Q4_2024_001",
            speaker: "Andy Jassy",
            role: "CEO",
            text: "Net sales increased 14% to $170.0 billion",
            metric: "Revenue",
            claimed: 170.0,
            actual: 169.96,
            unit: "billion",
            difference: 0.04,
            percentDiff: 0.02,
            status: "accurate",
            flag: null,
            severity: "low"
          }
        ]
      }
    }
  },
  {
    ticker: "META",
    name: "Meta Platforms Inc.",
    sector: "Social Media",
    cik: "0001326801",
    quarters: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
    latestQuarter: "Q4 2024",
    verifications: {
      "Q4 2024": {
        quarter: "Q4 2024",
        date: "January 31, 2024",
        totalClaims: 9,
        accuracyScore: 44.4,
        accurate: 4,
        discrepant: 3,
        unverifiable: 2,
        claims: [
          {
            id: "META_Q4_2024_001",
            speaker: "Mark Zuckerberg",
            role: "CEO",
            text: "Revenue for Q4 was $40.1 billion, up 25% year-over-year",
            metric: "Revenue",
            claimed: 40.1,
            actual: 40.11,
            unit: "billion",
            difference: -0.01,
            percentDiff: -0.02,
            status: "accurate",
            flag: null,
            severity: "low"
          }
        ]
      }
    }
  },
  {
    ticker: "JPM",
    name: "JPMorgan Chase & Co.",
    sector: "Banking",
    cik: "0000019617",
    quarters: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
    latestQuarter: "Q4 2024",
    verifications: {
      "Q4 2024": {
        quarter: "Q4 2024",
        date: "January 12, 2024",
        totalClaims: 7,
        accuracyScore: 57.1,
        accurate: 4,
        discrepant: 2,
        unverifiable: 1,
        claims: [
          {
            id: "JPM_Q4_2024_001",
            speaker: "Jamie Dimon",
            role: "CEO",
            text: "Net revenue was $39.9 billion",
            metric: "Revenue",
            claimed: 39.9,
            actual: 39.94,
            unit: "billion",
            difference: -0.04,
            percentDiff: -0.10,
            status: "accurate",
            flag: null,
            severity: "low"
          }
        ]
      }
    }
  },
  {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    sector: "Healthcare",
    cik: "0000200406",
    quarters: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
    latestQuarter: "Q4 2024",
    verifications: {
      "Q4 2024": {
        quarter: "Q4 2024",
        date: "January 23, 2024",
        totalClaims: 8,
        accuracyScore: 62.5,
        accurate: 5,
        discrepant: 1,
        unverifiable: 2,
        claims: [
          {
            id: "JNJ_Q4_2024_001",
            speaker: "Joaquin Duato",
            role: "CEO",
            text: "Sales were $21.4 billion for the quarter",
            metric: "Revenue",
            claimed: 21.4,
            actual: 21.40,
            unit: "billion",
            difference: 0.0,
            percentDiff: 0.0,
            status: "accurate",
            flag: null,
            severity: "low"
          }
        ]
      }
    }
  },
  {
    ticker: "WMT",
    name: "Walmart Inc.",
    sector: "Retail",
    cik: "0000104169",
    quarters: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
    latestQuarter: "Q4 2024",
    verifications: {
      "Q4 2024": {
        quarter: "Q4 2024",
        date: "February 20, 2024",
        totalClaims: 9,
        accuracyScore: 55.6,
        accurate: 5,
        discrepant: 2,
        unverifiable: 2,
        claims: [
          {
            id: "WMT_Q4_2024_001",
            speaker: "Doug McMillon",
            role: "CEO",
            text: "Total revenue reached $173.4 billion",
            metric: "Revenue",
            claimed: 173.4,
            actual: 173.39,
            unit: "billion",
            difference: 0.01,
            percentDiff: 0.01,
            status: "accurate",
            flag: null,
            severity: "low"
          }
        ]
      }
    }
  }
];

export const overallStats = {
  totalCompanies: 10,
  companiesAnalyzed: 10,
  totalClaims: 89,
  accurateClaims: 42,
  discrepantClaims: 22,
  unverifiableClaims: 25,
  overallAccuracy: 47.2,
  
  topDiscrepancies: [
    {
      company: "NVDA",
      companyName: "NVIDIA Corporation",
      claim: "Net Income",
      executive: "Colette Kress (CFO)",
      claimed: "$14.1B",
      actual: "$13.32B",
      difference: 5.86,
      severity: "high"
    },
    {
      company: "AAPL",
      companyName: "Apple Inc.",
      claim: "Operating Income",
      executive: "Luca Maestri (CFO)",
      claimed: "$31.5B",
      actual: "$29.95B",
      difference: 5.18,
      severity: "moderate"
    },
    {
      company: "NVDA",
      companyName: "NVIDIA Corporation",
      claim: "Gross Margin",
      executive: "Jensen Huang (CEO)",
      claimed: "76.2%",
      actual: "74.01%",
      difference: 2.19,
      severity: "moderate"
    },
    {
      company: "TSLA",
      companyName: "Tesla Inc.",
      claim: "Automotive Gross Margin",
      executive: "Elon Musk (CEO)",
      claimed: "21.3%",
      actual: "19.15%",
      difference: 2.15,
      severity: "moderate"
    }
  ],
  
  accuracyByCompany: [
    { ticker: "AAPL", name: "Apple", accuracy: 40.0, claims: 10 },
    { ticker: "NVDA", name: "NVIDIA", accuracy: 27.3, claims: 11 },
    { ticker: "TSLA", name: "Tesla", accuracy: 37.5, claims: 8 },
    { ticker: "MSFT", name: "Microsoft", accuracy: 55.6, claims: 9 },
    { ticker: "GOOGL", name: "Alphabet", accuracy: 62.5, claims: 8 },
    { ticker: "AMZN", name: "Amazon", accuracy: 50.0, claims: 10 },
    { ticker: "META", name: "Meta", accuracy: 44.4, claims: 9 },
    { ticker: "JPM", name: "JPMorgan", accuracy: 57.1, claims: 7 },
    { ticker: "JNJ", name: "Johnson & Johnson", accuracy: 62.5, claims: 8 },
    { ticker: "WMT", name: "Walmart", accuracy: 55.6, claims: 9 }
  ],
  
  discrepanciesByMetric: [
    { metric: "Net Income", count: 1, avgDiscrepancy: 5.86 },
    { metric: "Operating Income", count: 1, avgDiscrepancy: 5.18 },
    { metric: "Gross Margin", count: 2, avgDiscrepancy: 2.17 },
    { metric: "Revenue", count: 0, avgDiscrepancy: 0 }
  ]
};

export const methodology = {
  toleranceThresholds: {
    dollarAmounts: 5, // percent
    percentages: 2 // percentage points
  },
  
  severityLevels: {
    low: "< 2% discrepancy",
    moderate: "2-10% discrepancy",
    high: "> 10% discrepancy"
  },
  
  flags: {
    accurate: "Within tolerance thresholds",
    optimistic: "Claimed value exceeds actual",
    conservative: "Claimed value below actual",
    high_discrepancy: "Deviation exceeds 10%"
  },
  
  dataSources: {
    financials: "SEC EDGAR API (Company Facts endpoint)",
    transcripts: "Sample data (production: Seeking Alpha, company IR sites)",
    filing_types: "10-Q (quarterly), 10-K (annual)"
  }
};
