export default async function handler(req, res) {
  const companies = [
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
  
  return res.status(200).json({
    companies,
    total: companies.length
  });
}
