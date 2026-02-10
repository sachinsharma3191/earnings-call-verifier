import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CompanyController } from '../_lib/controllers/CompanyController';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ticker } = req.query;

  try {
    const controller = new CompanyController();
    const result = await controller.getCompanyFinancials(ticker as string);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching company financials:', error);
    const statusCode = error.message.includes('Missing') ? 400 : 500;
    return res.status(statusCode).json({ error: error.message || 'Internal server error' });
  }
}
