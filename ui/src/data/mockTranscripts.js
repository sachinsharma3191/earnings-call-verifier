// Mock transcript data for all 10 companies when API is unavailable
export const MOCK_TRANSCRIPTS = {
  'AAPL': {
    name: 'Apple Inc.',
    quarters: {
      'Q4 2025': {
        available: true,
        source: 'Sample Transcript',
        type: 'mock',
        filed: '2026-01-30',
        excerpt: 'CEO Tim Cook: We are pleased to report record revenue of $124.3B for Q4 2025, representing 8% year-over-year growth. Our Services business continues to show strong momentum...'
      },
      'Q3 2025': {
        available: true,
        source: 'Sample Transcript',
        type: 'mock',
        filed: '2025-10-31',
        excerpt: 'CFO Luca Maestri: Revenue for the quarter was $94.9B, with gross margin of 46.7%. iPhone revenue grew 12% year-over-year...'
      },
      'Q2 2025': {
        available: true,
        source: 'Sample Transcript',
        type: 'mock',
        filed: '2025-07-31',
        excerpt: 'We delivered strong results with revenue of $85.8B and net income of $21.4B. Mac and iPad showed particularly strong performance...'
      },
      'Q1 2025': {
        available: true,
        source: 'Sample Transcript',
        type: 'mock',
        filed: '2025-04-30',
        excerpt: 'Q1 revenue reached $90.8B with operating income of $28.3B. Our installed base of active devices reached a new all-time high...'
      }
    }
  },
  'NVDA': {
    name: 'NVIDIA Corporation',
    quarters: {
      'Q4 2025': {
        available: true,
        source: 'Sample Transcript',
        type: 'mock',
        filed: '2026-01-31',
        excerpt: 'CEO Jensen Huang: Data center revenue reached record levels driven by strong demand for AI computing. Revenue was $XX billion...'
      },
      'Q3 2025': {
        available: true,
        source: 'Sample Transcript',
        type: 'mock',
        filed: '2025-10-31',
        excerpt: 'Our AI platform continues to see unprecedented adoption across cloud providers and enterprises...'
      },
      'Q2 2025': {
        available: true,
        source: 'Sample Transcript',
        type: 'mock',
        filed: '2025-07-31',
        excerpt: 'Gaming and professional visualization segments showed strong growth alongside data center...'
      },
      'Q1 2025': {
        available: true,
        source: 'Sample Transcript',
        type: 'mock',
        filed: '2025-04-30',
        excerpt: 'Record quarterly revenue driven by accelerated computing and AI adoption...'
      }
    }
  },
  'MSFT': {
    name: 'Microsoft Corporation',
    quarters: {
      'Q4 2025': {
        available: true,
        source: 'Sample Transcript',
        type: 'mock',
        filed: '2026-01-31',
        excerpt: 'CEO Satya Nadella: Azure and cloud services revenue grew 30% year-over-year, driven by AI services adoption...'
      },
      'Q3 2025': {
        available: true,
        source: 'Sample Transcript',
        type: 'mock',
        filed: '2025-10-31',
        excerpt: 'Intelligent Cloud revenue was strong with continued momentum in Azure AI and enterprise services...'
      },
      'Q2 2025': {
        available: true,
        source: 'Sample Transcript',
        type: 'mock',
        filed: '2025-07-31',
        excerpt: 'Commercial cloud revenue surpassed expectations with strong bookings across all segments...'
      },
      'Q1 2025': {
        available: true,
        source: 'Sample Transcript',
        type: 'mock',
        filed: '2025-04-30',
        excerpt: 'Office 365 and Dynamics 365 showed strong subscriber growth...'
      }
    }
  }
};

// Mock earnings claims for verification
export const MOCK_CLAIMS = {
  'AAPL': {
    'Q4 2025': [
      {
        id: 1,
        claim: 'Revenue increased 8% year-over-year to $124.3 billion',
        metric: 'Revenue',
        claimedValue: 124.3,
        actualValue: 124.3,
        status: 'verified',
        variance: 0
      },
      {
        id: 2,
        claim: 'Net income was $35.2 billion',
        metric: 'Net Income',
        claimedValue: 35.2,
        actualValue: 35.2,
        status: 'verified',
        variance: 0
      },
      {
        id: 3,
        claim: 'Gross margin improved to 46.0%',
        metric: 'Gross Margin',
        claimedValue: 46.0,
        actualValue: 45.9,
        status: 'minor_discrepancy',
        variance: 0.1
      }
    ],
    'Q3 2025': [
      {
        id: 1,
        claim: 'Revenue was $94.9 billion',
        metric: 'Revenue',
        claimedValue: 94.9,
        actualValue: 94.9,
        status: 'verified',
        variance: 0
      },
      {
        id: 2,
        claim: 'Operating income reached $29.2 billion',
        metric: 'Operating Income',
        claimedValue: 29.2,
        actualValue: 29.2,
        status: 'verified',
        variance: 0
      }
    ]
  },
  'NVDA': {
    'Q4 2025': [
      {
        id: 1,
        claim: 'Data center revenue grew 200% year-over-year',
        metric: 'Data Center Revenue Growth',
        claimedValue: 200,
        actualValue: 195,
        status: 'minor_discrepancy',
        variance: 5
      },
      {
        id: 2,
        claim: 'Total revenue exceeded expectations',
        metric: 'Revenue',
        claimedValue: 'N/A',
        actualValue: 'N/A',
        status: 'qualitative',
        variance: 0
      }
    ]
  },
  'MSFT': {
    'Q4 2025': [
      {
        id: 1,
        claim: 'Azure revenue grew 30% year-over-year',
        metric: 'Azure Revenue Growth',
        claimedValue: 30,
        actualValue: 29,
        status: 'minor_discrepancy',
        variance: 1
      },
      {
        id: 2,
        claim: 'Commercial cloud gross margin expanded',
        metric: 'Cloud Gross Margin',
        claimedValue: 'Improved',
        actualValue: 'Improved',
        status: 'verified',
        variance: 0
      }
    ]
  }
};

export function getMockTranscript(ticker, quarter) {
  return MOCK_TRANSCRIPTS[ticker]?.quarters[quarter] || null;
}

export function getMockClaims(ticker, quarter) {
  return MOCK_CLAIMS[ticker]?.[quarter] || [];
}

export function getAllMockCompanies() {
  return Object.keys(MOCK_TRANSCRIPTS).map(ticker => ({
    ticker,
    name: MOCK_TRANSCRIPTS[ticker].name,
    quarters: Object.keys(MOCK_TRANSCRIPTS[ticker].quarters)
  }));
}
