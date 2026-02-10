import { SECDataService } from '../_lib/services/SECDataService.js';

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

export default async function handler(req, res) {
  try {
    const { ticker } = req.query;
    if (!ticker) {
      return res.status(400).json({ error: 'Missing ticker parameter' });
    }

    const cik = TICKER_TO_CIK[ticker];
    if (!cik) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const secService = new SECDataService();
    const data = await secService.getCompanyFinancials(cik);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching company:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
