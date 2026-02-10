import { SECDataService } from '../../_lib/services/SECDataService.js';

const TICKER_TO_CIK = {
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

const STATIC_QUARTERS = [
  { quarter: 'Q3 2024', endDate: '2024-09-30', filed: '2024-10-31' },
  { quarter: 'Q2 2024', endDate: '2024-06-30', filed: '2024-07-31' },
  { quarter: 'Q1 2024', endDate: '2024-03-31', filed: '2024-04-30' },
  { quarter: 'Q4 2023', endDate: '2023-12-31', filed: '2024-01-31' }
];

export default async function handler(req, res) {
  const { ticker } = req.query;
  
  if (!ticker) {
    return res.status(400).json({ error: 'Missing ticker parameter' });
  }

  const cik = TICKER_TO_CIK[ticker];
  if (!cik) {
    return res.status(404).json({ error: 'Company not found' });
  }

  try {
    const secService = new SECDataService();
    const quarters = await secService.getQuarterlyData(cik);
    
    return res.status(200).json({
      ticker,
      quarters: quarters.slice(0, 4).map(q => ({
        quarter: `${q.fiscal_period} ${q.fiscal_year}`,
        endDate: q.end_date,
        filed: q.filed
      })),
      source: 'sec_edgar'
    });
  } catch (error) {
    console.warn(`SEC API failed for ${ticker}, using static data:`, error);
    
    return res.status(200).json({
      ticker,
      quarters: STATIC_QUARTERS,
      source: 'static_fallback'
    });
  }
}
