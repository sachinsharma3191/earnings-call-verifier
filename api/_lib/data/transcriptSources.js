// Transcript source configuration and manifest
// Tracks all 40 data points (10 companies × 4 quarters) with source attribution

export const TRANSCRIPT_SOURCES = {
  'AAPL': {
    'Q4-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/10/31/apple-q4-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-10-31'
    },
    'Q3-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/08/01/apple-aapl-q3-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-08-01'
    },
    'Q2-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/05/02/apple-aapl-q2-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-05-01'
    },
    'Q1-2025': {
      available: false,
      source: 'SEC EDGAR (10-Q MD&A)',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193',
      type: 'proxy',
      filed: '2025-02-01',
      note: 'Using 10-Q MD&A as proxy - transcript not publicly available'
    }
  },
  'NVDA': {
    'Q4-2025': {
      available: true,
      source: 'Investing.com',
      url: 'https://www.investing.com/news/transcripts/earnings-call-transcript-nvidia-beats-q4-2025-estimates-stock-gains-93CH-3894615',
      type: 'transcript',
      filed: '2025-02-26'
    },
    'Q3-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2024/11/20/nvidia-nvda-q3-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2024-11-20'
    },
    'Q2-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/nvidia-nvda-q2-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2024-08-28'
    },
    'Q1-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2024/05/22/nvidia-nvda-q1-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2024-05-22'
    }
  },
  'MSFT': {
    'Q4-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/07/30/microsoft-msft-q4-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-07-30'
    },
    'Q3-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/04/25/microsoft-msft-q3-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-04-25'
    },
    'Q2-2025': {
      available: true,
      source: 'Investing.com',
      url: 'https://www.investing.com/earnings/microsoft-corp-earnings',
      type: 'transcript',
      filed: '2025-01-30'
    },
    'Q1-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/microsoft-msft-q1-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2024-10-30'
    }
  },
  'GOOGL': {
    'Q4-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2026/02/04/alphabet-googl-q4-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2026-02-04'
    },
    'Q3-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/alphabet-googl-q3-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-10-29'
    },
    'Q2-2025': {
      available: true,
      source: 'Investing.com',
      url: 'https://www.investing.com/earnings/alphabet-inc-earnings',
      type: 'transcript',
      filed: '2025-07-24'
    },
    'Q1-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/04/25/alphabet-googl-q1-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-04-25'
    }
  },
  'AMZN': {
    'Q4-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/amazon-amzn-q4-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2026-02-02'
    },
    'Q3-2025': {
      available: true,
      source: 'Investing.com',
      url: 'https://www.investing.com/earnings/amazon-com-inc-earnings',
      type: 'transcript',
      filed: '2025-10-30'
    },
    'Q2-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/08/01/amazon-amzn-q2-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-08-01'
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
      url: 'https://www.fool.com/earnings/call-transcripts/2026/01/28/meta-meta-q4-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2026-01-28'
    },
    'Q3-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/meta-platforms-meta-q3-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-10-30'
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
      filed: '2025-04-24',
      note: 'Using 10-Q MD&A as proxy - transcript not publicly available'
    }
  },
  'TSLA': {
    'Q4-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2026/01/28/tesla-tsla-q4-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2026-01-28'
    },
    'Q3-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/tesla-inc-tsla-q3-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-10-23'
    },
    'Q2-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/07/24/tesla-tsla-q2-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-07-23'
    },
    'Q1-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/tesla-inc-tsla-q1-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-04-23'
    }
  },
  'JPM': {
    'Q4-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2026/01/15/j-p-morgan-chase-jpm-q4-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2026-01-15'
    },
    'Q3-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/jpmorgan-chase-jpm-q3-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-10-11'
    },
    'Q2-2025': {
      available: true,
      source: 'Investing.com',
      url: 'https://www.investing.com/earnings/jpmorgan-chase-co-earnings',
      type: 'transcript',
      filed: '2025-07-11'
    },
    'Q1-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/04/12/jpmorgan-chase-jpm-q1-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-04-12'
    }
  },
  'JNJ': {
    'Q4-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2026/01/20/johnson-johnson-jnj-q4-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2026-01-20'
    },
    'Q3-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/johnson-johnson-jnj-q3-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2025-10-15'
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
      filed: '2025-04-16'
    }
  },
  'WMT': {
    'Q4-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2025/02/20/walmart-wmt-q4-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2025-02-20'
    },
    'Q3-2025': {
      available: true,
      source: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/news/walmart-wmt-q3-2025-earnings-call-transcript',
      type: 'transcript',
      filed: '2024-11-19'
    },
    'Q2-2025': {
      available: true,
      source: 'Investing.com',
      url: 'https://www.investing.com/earnings/walmart-inc-earnings',
      type: 'transcript',
      filed: '2024-08-15'
    },
    'Q1-2025': {
      available: true,
      source: 'The Motley Fool',
      url: 'https://www.fool.com/earnings/call-transcripts/2024/05/16/walmart-wmt-q1-2025-earnings-call-transcript/',
      type: 'transcript',
      filed: '2024-05-16'
    }
  }
};

export const FALLBACK_POLICY = {
  MISSING_TRANSCRIPT: 'proxy',
  FALLBACK_SOURCES: [
    'The Motley Fool',
    'Yahoo Finance',
    'Investing.com',
    'Seeking Alpha',
    'SEC EDGAR (10-Q/10-K MD&A)'
  ],
  PROXY_POLICY: {
    enabled: true,
    type: '10-Q/10-K MD&A',
    label: 'SEC Filing Proxy',
    requiresDisclosure: true
  }
};

export function getTranscriptSource(ticker, quarter) {
  const companyData = TRANSCRIPT_SOURCES[ticker];
  if (!companyData) return null;
  return companyData[quarter] || null;
}

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