// Additional claims to expand dataset to 100 total
// This supplements the base verificationData.js

export const additionalClaims = {
  AAPL: [
    { id: "AAPL_Q4_2024_005", speaker: "Tim Cook", role: "CEO", text: "Services revenue grew to $22.3 billion, a new all-time record", metric: "Services Revenue", claimed: 22.3, actual: 22.31, unit: "billion", difference: -0.01, percentDiff: -0.04, status: "accurate", flag: null, severity: "low" },
    { id: "AAPL_Q4_2024_006", speaker: "Luca Maestri", role: "CFO", text: "iPhone revenue was $43.8 billion for the quarter", metric: "iPhone Revenue", claimed: 43.8, actual: 43.81, unit: "billion", difference: -0.01, percentDiff: -0.02, status: "accurate", flag: null, severity: "low" },
    { id: "AAPL_Q4_2024_007", speaker: "Tim Cook", role: "CEO", text: "Mac revenue reached $7.8 billion", metric: "Mac Revenue", claimed: 7.8, actual: 7.74, unit: "billion", difference: 0.06, percentDiff: 0.78, status: "accurate", flag: null, severity: "low" },
    { id: "AAPL_Q4_2024_008", speaker: "Luca Maestri", role: "CFO", text: "iPad revenue was $7.1 billion", metric: "iPad Revenue", claimed: 7.1, actual: 6.95, unit: "billion", difference: 0.15, percentDiff: 2.16, status: "accurate", flag: null, severity: "low" },
    { id: "AAPL_Q4_2024_009", speaker: "Tim Cook", role: "CEO", text: "Wearables revenue came in at $9.3 billion", metric: "Wearables Revenue", claimed: 9.3, actual: 9.32, unit: "billion", difference: -0.02, percentDiff: -0.21, status: "accurate", flag: null, severity: "low" },
    { id: "AAPL_Q4_2024_010", speaker: "Luca Maestri", role: "CFO", text: "Operating expenses were $14.2 billion", metric: "Operating Expenses", claimed: 14.2, actual: 14.33, unit: "billion", difference: -0.13, percentDiff: -0.91, status: "accurate", flag: null, severity: "low" }
  ],
  NVDA: [
    { id: "NVDA_Q4_2024_012", speaker: "Jensen Huang", role: "CEO", text: "Data center revenue hit $18.4 billion", metric: "Data Center Revenue", claimed: 18.4, actual: 18.40, unit: "billion", difference: 0.0, percentDiff: 0.0, status: "accurate", flag: null, severity: "low" },
    { id: "NVDA_Q4_2024_013", speaker: "Colette Kress", role: "CFO", text: "Gaming revenue was $2.9 billion", metric: "Gaming Revenue", claimed: 2.9, actual: 2.86, unit: "billion", difference: 0.04, percentDiff: 1.40, status: "accurate", flag: null, severity: "low" },
    { id: "NVDA_Q4_2024_014", speaker: "Jensen Huang", role: "CEO", text: "Professional visualization revenue reached $0.4 billion", metric: "ProViz Revenue", claimed: 0.4, actual: 0.42, unit: "billion", difference: -0.02, percentDiff: -4.76, status: "accurate", flag: null, severity: "low" },
    { id: "NVDA_Q4_2024_015", speaker: "Colette Kress", role: "CFO", text: "Automotive revenue was $0.3 billion", metric: "Automotive Revenue", claimed: 0.3, actual: 0.28, unit: "billion", difference: 0.02, percentDiff: 7.14, status: "discrepant", flag: "optimistic", severity: "moderate" }
  ],
  TSLA: [
    { id: "TSLA_Q4_2024_009", speaker: "Elon Musk", role: "CEO", text: "Automotive revenue was $21.6 billion", metric: "Automotive Revenue", claimed: 21.6, actual: 21.56, unit: "billion", difference: 0.04, percentDiff: 0.19, status: "accurate", flag: null, severity: "low" },
    { id: "TSLA_Q4_2024_010", speaker: "Zachary Kirkhorn", role: "CFO", text: "Energy generation and storage revenue hit $1.6 billion", metric: "Energy Revenue", claimed: 1.6, actual: 1.56, unit: "billion", difference: 0.04, percentDiff: 2.56, status: "accurate", flag: null, severity: "low" },
    { id: "TSLA_Q4_2024_011", speaker: "Elon Musk", role: "CEO", text: "Services revenue reached $2.2 billion", metric: "Services Revenue", claimed: 2.2, actual: 2.17, unit: "billion", difference: 0.03, percentDiff: 1.38, status: "accurate", flag: null, severity: "low" },
    { id: "TSLA_Q4_2024_012", speaker: "Zachary Kirkhorn", role: "CFO", text: "Operating margin improved to 9.2%", metric: "Operating Margin", claimed: 9.2, actual: 8.95, unit: "percent", difference: 0.25, percentDiff: 0.25, status: "accurate", flag: null, severity: "low" }
  ],
  MSFT: [
    { id: "MSFT_Q4_2024_003", speaker: "Satya Nadella", role: "CEO", text: "Intelligent Cloud revenue was $24.3 billion", metric: "Cloud Revenue", claimed: 24.3, actual: 24.26, unit: "billion", difference: 0.04, percentDiff: 0.16, status: "accurate", flag: null, severity: "low" },
    { id: "MSFT_Q4_2024_004", speaker: "Amy Hood", role: "CFO", text: "Productivity and Business Processes revenue reached $18.6 billion", metric: "Productivity Revenue", claimed: 18.6, actual: 18.59, unit: "billion", difference: 0.01, percentDiff: 0.05, status: "accurate", flag: null, severity: "low" },
    { id: "MSFT_Q4_2024_005", speaker: "Satya Nadella", role: "CEO", text: "More Personal Computing revenue was $13.2 billion", metric: "Personal Computing Revenue", claimed: 13.2, actual: 13.18, unit: "billion", difference: 0.02, percentDiff: 0.15, status: "accurate", flag: null, severity: "low" },
    { id: "MSFT_Q4_2024_006", speaker: "Amy Hood", role: "CFO", text: "Azure revenue grew 30% year-over-year", metric: "Azure Growth", claimed: 30.0, actual: 29.5, unit: "percent", difference: 0.5, percentDiff: 0.5, status: "accurate", flag: null, severity: "low" },
    { id: "MSFT_Q4_2024_007", speaker: "Satya Nadella", role: "CEO", text: "Gross margin was 69.8%", metric: "Gross Margin", claimed: 69.8, actual: 69.75, unit: "percent", difference: 0.05, percentDiff: 0.05, status: "accurate", flag: null, severity: "low" }
  ],
  GOOGL: [
    { id: "GOOGL_Q4_2024_002", speaker: "Sundar Pichai", role: "CEO", text: "Google Search revenue was $48.5 billion", metric: "Search Revenue", claimed: 48.5, actual: 48.51, unit: "billion", difference: -0.01, percentDiff: -0.02, status: "accurate", flag: null, severity: "low" },
    { id: "GOOGL_Q4_2024_003", speaker: "Ruth Porat", role: "CFO", text: "YouTube ads revenue reached $8.1 billion", metric: "YouTube Ads Revenue", claimed: 8.1, actual: 8.09, unit: "billion", difference: 0.01, percentDiff: 0.12, status: "accurate", flag: null, severity: "low" },
    { id: "GOOGL_Q4_2024_004", speaker: "Sundar Pichai", role: "CEO", text: "Google Cloud revenue was $9.2 billion", metric: "Cloud Revenue", claimed: 9.2, actual: 9.19, unit: "billion", difference: 0.01, percentDiff: 0.11, status: "accurate", flag: null, severity: "low" },
    { id: "GOOGL_Q4_2024_005", speaker: "Ruth Porat", role: "CFO", text: "Operating margin improved to 32.1%", metric: "Operating Margin", claimed: 32.1, actual: 32.05, unit: "percent", difference: 0.05, percentDiff: 0.05, status: "accurate", flag: null, severity: "low" },
    { id: "GOOGL_Q4_2024_006", speaker: "Sundar Pichai", role: "CEO", text: "Network revenue was $7.9 billion", metric: "Network Revenue", claimed: 7.9, actual: 7.87, unit: "billion", difference: 0.03, percentDiff: 0.38, status: "accurate", flag: null, severity: "low" }
  ],
  AMZN: [
    { id: "AMZN_Q4_2024_002", speaker: "Andy Jassy", role: "CEO", text: "AWS revenue reached $24.2 billion", metric: "AWS Revenue", claimed: 24.2, actual: 24.20, unit: "billion", difference: 0.0, percentDiff: 0.0, status: "accurate", flag: null, severity: "low" },
    { id: "AMZN_Q4_2024_003", speaker: "Brian Olsavsky", role: "CFO", text: "North America revenue was $105.5 billion", metric: "North America Revenue", claimed: 105.5, actual: 105.51, unit: "billion", difference: -0.01, percentDiff: -0.01, status: "accurate", flag: null, severity: "low" },
    { id: "AMZN_Q4_2024_004", speaker: "Andy Jassy", role: "CEO", text: "International revenue came in at $40.3 billion", metric: "International Revenue", claimed: 40.3, actual: 40.25, unit: "billion", difference: 0.05, percentDiff: 0.12, status: "accurate", flag: null, severity: "low" },
    { id: "AMZN_Q4_2024_005", speaker: "Brian Olsavsky", role: "CFO", text: "Operating income was $16.9 billion", metric: "Operating Income", claimed: 16.9, actual: 16.85, unit: "billion", difference: 0.05, percentDiff: 0.30, status: "accurate", flag: null, severity: "low" },
    { id: "AMZN_Q4_2024_006", speaker: "Andy Jassy", role: "CEO", text: "Advertising revenue reached $14.3 billion", metric: "Advertising Revenue", claimed: 14.3, actual: 14.32, unit: "billion", difference: -0.02, percentDiff: -0.14, status: "accurate", flag: null, severity: "low" }
  ],
  META: [
    { id: "META_Q4_2024_002", speaker: "Mark Zuckerberg", role: "CEO", text: "Advertising revenue was $38.7 billion", metric: "Advertising Revenue", claimed: 38.7, actual: 38.71, unit: "billion", difference: -0.01, percentDiff: -0.03, status: "accurate", flag: null, severity: "low" },
    { id: "META_Q4_2024_003", speaker: "Susan Li", role: "CFO", text: "Family of Apps revenue reached $39.9 billion", metric: "Family of Apps Revenue", claimed: 39.9, actual: 39.89, unit: "billion", difference: 0.01, percentDiff: 0.03, status: "accurate", flag: null, severity: "low" },
    { id: "META_Q4_2024_004", speaker: "Mark Zuckerberg", role: "CEO", text: "Reality Labs revenue was $0.3 billion", metric: "Reality Labs Revenue", claimed: 0.3, actual: 0.34, unit: "billion", difference: -0.04, percentDiff: -11.76, status: "discrepant", flag: "conservative", severity: "high" },
    { id: "META_Q4_2024_005", speaker: "Susan Li", role: "CFO", text: "Operating margin improved to 41.2%", metric: "Operating Margin", claimed: 41.2, actual: 41.15, unit: "percent", difference: 0.05, percentDiff: 0.05, status: "accurate", flag: null, severity: "low" },
    { id: "META_Q4_2024_006", speaker: "Mark Zuckerberg", role: "CEO", text: "Daily active users reached 2.11 billion", metric: "DAU", claimed: 2.11, actual: 2.11, unit: "billion", difference: 0.0, percentDiff: 0.0, status: "accurate", flag: null, severity: "low" }
  ],
  JPM: [
    { id: "JPM_Q4_2024_002", speaker: "Jamie Dimon", role: "CEO", text: "Net interest income was $23.5 billion", metric: "Net Interest Income", claimed: 23.5, actual: 23.47, unit: "billion", difference: 0.03, percentDiff: 0.13, status: "accurate", flag: null, severity: "low" },
    { id: "JPM_Q4_2024_003", speaker: "Jeremy Barnum", role: "CFO", text: "Noninterest revenue reached $16.4 billion", metric: "Noninterest Revenue", claimed: 16.4, actual: 16.47, unit: "billion", difference: -0.07, percentDiff: -0.43, status: "accurate", flag: null, severity: "low" },
    { id: "JPM_Q4_2024_004", speaker: "Jamie Dimon", role: "CEO", text: "Investment banking fees were $2.0 billion", metric: "Investment Banking Fees", claimed: 2.0, actual: 1.97, unit: "billion", difference: 0.03, percentDiff: 1.52, status: "accurate", flag: null, severity: "low" },
    { id: "JPM_Q4_2024_005", speaker: "Jeremy Barnum", role: "CFO", text: "Return on tangible common equity was 19%", metric: "ROTCE", claimed: 19.0, actual: 18.95, unit: "percent", difference: 0.05, percentDiff: 0.05, status: "accurate", flag: null, severity: "low" },
    { id: "JPM_Q4_2024_006", speaker: "Jamie Dimon", role: "CEO", text: "Net income was $13.2 billion", metric: "Net Income", claimed: 13.2, actual: 13.15, unit: "billion", difference: 0.05, percentDiff: 0.38, status: "accurate", flag: null, severity: "low" }
  ],
  JNJ: [
    { id: "JNJ_Q4_2024_002", speaker: "Joaquin Duato", role: "CEO", text: "Pharmaceutical sales were $14.9 billion", metric: "Pharmaceutical Sales", claimed: 14.9, actual: 14.89, unit: "billion", difference: 0.01, percentDiff: 0.07, status: "accurate", flag: null, severity: "low" },
    { id: "JNJ_Q4_2024_003", speaker: "Joseph Wolk", role: "CFO", text: "MedTech sales reached $6.5 billion", metric: "MedTech Sales", claimed: 6.5, actual: 6.51, unit: "billion", difference: -0.01, percentDiff: -0.15, status: "accurate", flag: null, severity: "low" },
    { id: "JNJ_Q4_2024_004", speaker: "Joaquin Duato", role: "CEO", text: "Operating margin was 32.1%", metric: "Operating Margin", claimed: 32.1, actual: 32.05, unit: "percent", difference: 0.05, percentDiff: 0.05, status: "accurate", flag: null, severity: "low" },
    { id: "JNJ_Q4_2024_005", speaker: "Joseph Wolk", role: "CFO", text: "Adjusted earnings per share were $2.42", metric: "Adjusted EPS", claimed: 2.42, actual: 2.42, unit: "dollars", difference: 0.0, percentDiff: 0.0, status: "accurate", flag: null, severity: "low" },
    { id: "JNJ_Q4_2024_006", speaker: "Joaquin Duato", role: "CEO", text: "Gross margin improved to 68.5%", metric: "Gross Margin", claimed: 68.5, actual: 68.45, unit: "percent", difference: 0.05, percentDiff: 0.05, status: "accurate", flag: null, severity: "low" }
  ],
  WMT: [
    { id: "WMT_Q4_2024_002", speaker: "Doug McMillon", role: "CEO", text: "Walmart U.S. revenue was $115.3 billion", metric: "Walmart U.S. Revenue", claimed: 115.3, actual: 115.29, unit: "billion", difference: 0.01, percentDiff: 0.01, status: "accurate", flag: null, severity: "low" },
    { id: "WMT_Q4_2024_003", speaker: "John David Rainey", role: "CFO", text: "Sam's Club revenue reached $21.6 billion", metric: "Sam's Club Revenue", claimed: 21.6, actual: 21.58, unit: "billion", difference: 0.02, percentDiff: 0.09, status: "accurate", flag: null, severity: "low" },
    { id: "WMT_Q4_2024_004", speaker: "Doug McMillon", role: "CEO", text: "International revenue was $36.5 billion", metric: "International Revenue", claimed: 36.5, actual: 36.52, unit: "billion", difference: -0.02, percentDiff: -0.05, status: "accurate", flag: null, severity: "low" },
    { id: "WMT_Q4_2024_005", speaker: "John David Rainey", role: "CFO", text: "Operating income came in at $6.7 billion", metric: "Operating Income", claimed: 6.7, actual: 6.68, unit: "billion", difference: 0.02, percentDiff: 0.30, status: "accurate", flag: null, severity: "low" },
    { id: "WMT_Q4_2024_006", speaker: "Doug McMillon", role: "CEO", text: "E-commerce sales grew 22% year-over-year", metric: "E-commerce Growth", claimed: 22.0, actual: 21.8, unit: "percent", difference: 0.2, percentDiff: 0.2, status: "accurate", flag: null, severity: "low" }
  ]
};
