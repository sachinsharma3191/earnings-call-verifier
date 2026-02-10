// Company constants - centralized configuration for all 10 companies

export const TICKER_TO_CIK = {
  'AAPL': '0000320193',
  'NVDA': '0001045810',
  'MSFT': '0000789019',
  'GOOGL': '0001652044',
  'AMZN': '0001018724',
  'META': '0001326801',
  'TSLA': '0001318605',
  'JPM': '0000019617',
  'JNJ': '0000200406',
  'WMT': '0000104169'
};

export const COMPANY_NAMES = {
  'AAPL': 'Apple Inc.',
  'NVDA': 'NVIDIA Corporation',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'META': 'Meta Platforms Inc.',
  'TSLA': 'Tesla Inc.',
  'JPM': 'JPMorgan Chase & Co.',
  'JNJ': 'Johnson & Johnson',
  'WMT': 'Walmart Inc.'
};

export const COMPANIES_LIST = [
  { ticker: 'AAPL', name: 'Apple Inc.', cik: '0000320193' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', cik: '0001045810' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', cik: '0000789019' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', cik: '0001652044' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', cik: '0001018724' },
  { ticker: 'META', name: 'Meta Platforms Inc.', cik: '0001326801' },
  { ticker: 'TSLA', name: 'Tesla Inc.', cik: '0001318605' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', cik: '0000019617' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', cik: '0000200406' },
  { ticker: 'WMT', name: 'Walmart Inc.', cik: '0000104169' }
];

// Legacy export for backward compatibility
export const COMPANY_CIKS = TICKER_TO_CIK;
