import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SECDataService } from '../../_lib/services/SECDataService';
import { createApiHandler } from '../../_lib/middleware/apiHandler';

const TICKER_TO_CIK: Record<string, string> = {
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

export default createApiHandler(async (req: VercelRequest, res: VercelResponse) => {
  const { ticker } = req.query;
  if (!ticker) throw new Error('Missing required parameter: ticker');
  
  const cik = TICKER_TO_CIK[ticker as string] || ticker as string;
  const secService = new SECDataService();
  const quarters = await secService.getQuarterlyData(cik);
  
  return {
    ticker,
    quarters: quarters.map(q => ({
      quarter: `${q.fiscal_period} ${q.fiscal_year}`,
      endDate: q.end_date,
      filed: q.filed
    }))
  };
}, { allowedMethods: ['GET'] });
