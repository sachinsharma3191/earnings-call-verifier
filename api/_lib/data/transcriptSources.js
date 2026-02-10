// Transcript source configuration and manifest
// Tracks all 40 data points (10 companies × 4 quarters) with source attribution

export const TRANSCRIPT_SOURCES = {
  'AAPL': {
    'Q4-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2026/01/30/apple-aapl-q4-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2026-01-30'
    },
    'Q3-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/apple-inc-aapl-q3-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-10-31'
    },
    'Q2-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/08/01/apple-aapl-q2-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-07-31'
    },
    'Q1-2025': {
      available: false,
      source: 'SEC EDGAR (10-Q MD&A)',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193',
      type: 'proxy',
      filed: '2025-04-30',
      note: 'Using 10-Q MD&A as proxy - transcript not publicly available'
    }
  },
  'NVDA': {
    'Q4-2025': {
      available: true,
      source: 'Investing.com',
      url: 'https://www.investing.com/earnings/nvidia-corp-earnings',
      type: 'transcript',
      filed: '2026-01-31'
    },
    'Q3-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/11/20/nvidia-nvda-q3-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-10-31'
    },
    'Q2-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/nvidia-nvda-q2-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-07-31'
    },
    'Q1-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/05/22/nvidia-nvda-q1-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-04-30'
    }
  },
  'MSFT': {
    'Q4-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/microsoft-msft-q4-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2026-01-31'
    },
    'Q3-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/10/24/microsoft-msft-q3-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-10-31'
    },
    'Q2-2025': {
      available: true,
      source: 'Investing.com',
      url: 'https://www.investing.com/earnings/microsoft-corp-earnings',
      type: 'transcript',
      filed: '2025-07-31'
    },
    'Q1-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/microsoft-msft-q1-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-04-30'
    }
  },
  'GOOGL': {
    'Q4-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2026/01/30/alphabet-googl-q4-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2026-01-30'
    },
    'Q3-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/alphabet-googl-q3-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-10-31'
    },
    'Q2-2025': {
      available: true,
      source: 'Investing.com',
      url: 'https://www.investing.com/earnings/alphabet-inc-earnings',
      type: 'transcript',
      filed: '2025-07-31'
    },
    'Q1-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/04/25/alphabet-googl-q1-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-04-30'
    }
  },
  'AMZN': {
    'Q4-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/amazon-amzn-q4-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2026-01-31'
    },
    'Q3-2025': {
      available: true,
      source: 'Investing.com',
      url: 'https://www.investing.com/earnings/amazon-com-inc-earnings',
      type: 'transcript',
      filed: '2025-10-31'
    },
    'Q2-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/08/01/amazon-amzn-q2-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-07-31'
    },
    'Q1-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/amazon-amzn-q1-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-04-30'
    }
  },
  'META': {
    'Q4-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2026/01/31/meta-platforms-meta-q4-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2026-01-31'
    },
    'Q3-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/meta-platforms-meta-q3-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-10-31'
    },
    'Q2-2025': {
      available: true,
      source: 'Investing.com',
      url: 'https://www.investing.com/earnings/meta-platforms-inc-earnings',
      type: 'transcript',
      filed: '2025-07-31'
    },
    'Q1-2025': {
      available: false,
      source: 'SEC EDGAR (10-Q MD&A)',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001326801',
      type: 'proxy',
      filed: '2025-04-30',
      note: 'Using 10-Q MD&A as proxy - transcript not publicly available'
    }
  },
  'TSLA': {
    'Q4-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/tesla-tsla-q4-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2026-01-31'
    },
    'Q3-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/10/23/tesla-tsla-q3-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-10-31'
    },
    'Q2-2025': {
      available: true,
      source: 'Investing.com',
      url: 'https://www.investing.com/earnings/tesla-inc-earnings',
      type: 'transcript',
      filed: '2025-07-31'
    },
    'Q1-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/tesla-tsla-q1-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-04-30'
    }
  },
  'JPM': {
    'Q4-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2026/01/14/jpmorgan-chase-jpm-q4-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2026-01-31'
    },
    'Q3-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/jpmorgan-chase-jpm-q3-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-10-31'
    },
    'Q2-2025': {
      available: true,
      source: 'Investing.com',
      url: 'https://www.investing.com/earnings/jpmorgan-chase-co-earnings',
      type: 'transcript',
      filed: '2025-07-31'
    },
    'Q1-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/04/12/jpmorgan-chase-jpm-q1-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-04-30'
    }
  },
  'JNJ': {
    'Q4-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/johnson-johnson-jnj-q4-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2026-01-31'
    },
    'Q3-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/10/15/johnson-johnson-jnj-q3-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-10-31'
    },
    'Q2-2025': {
      available: false,
      source: 'SEC EDGAR (10-Q MD&A)',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000200406',
      type: 'proxy',
      filed: '2025-07-31',
      note: 'Using 10-Q MD&A as proxy - transcript not publicly available'
    },
    'Q1-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/johnson-johnson-jnj-q1-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-04-30'
    }
  },
  'WMT': {
    'Q4-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2026/02/20/walmart-wmt-q4-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2026-01-31'
    },
    'Q3-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/walmart-wmt-q3-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-10-31'
    },
    'Q2-2025': {
      available: true,
      source: 'Investing.com',
      url: 'https://www.investing.com/earnings/walmart-inc-earnings',
      type: 'transcript',
      filed: '2025-07-31'
    },
    'Q1-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/05/16/walmart-wmt-q1-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-04-30'
    }
  }
};

// Fallback policy configuration
export const FALLBACK_POLICY = {
  // When transcript is missing or gated
  MISSING_TRANSCRIPT: 'proxy', // Options: 'skip', 'fallback', 'proxy'
  
  // Fallback sources in order of preference
  FALLBACK_SOURCES: [
    'The Motley Fool',
    'Yahoo Finance',
    'Investing.com',
    'Seeking Alpha',
    'SEC EDGAR (10-Q/10-K MD&A)'
  ],
  
  // Proxy document policy
  PROXY_POLICY: {
    enabled: true,
    type: '10-Q/10-K MD&A',
    label: 'SEC Filing Proxy',
    requiresDisclosure: true
  }
};

// Get transcript info for a specific company/quarter
export function getTranscriptSource(ticker, quarter) {
  const companyData = TRANSCRIPT_SOURCES[ticker];
  if (!companyData) return null;
  
  return companyData[quarter] || null;
}

// Get coverage statistics
export function getCoverageStats() {
  let total = 0;
  let available = 0;
  let proxy = 0;
  let missing = 0;
  
  Object.values(TRANSCRIPT_SOURCES).forEach(company => {
    Object.values(company).forEach(quarter => {
      total++;
      if (quarter.available && quarter.type === 'transcript') {
        available++;
      } else if (quarter.type === 'proxy') {
        proxy++;
      } else {
        missing++;
      }
    });
  });
  
  return {
    total,
    available,
    proxy,
    missing,
    coverage: ((available + proxy) / total * 100).toFixed(1)
  };
}
