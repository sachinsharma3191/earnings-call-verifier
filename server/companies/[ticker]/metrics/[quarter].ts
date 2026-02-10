import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CompanyController } from '../../../_lib/controllers/CompanyController';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ticker, quarter } = req.query;

  try {
    const controller = new CompanyController();
    const financials = await controller.getCompanyFinancials(ticker as string);
    
    // Find specific quarter metrics
    const quarterData = financials.quarters.find(q => 
      `${q.fiscal_period} ${q.fiscal_year}` === quarter
    );

    if (!quarterData) {
      return res.status(404).json({ error: 'Quarter not found' });
    }

    return res.status(200).json({
      ticker,
      quarter,
      metrics: quarterData
    });
  } catch (error: any) {
    console.error('Error fetching metrics:', error);
    const statusCode = error.message.includes('Missing') ? 400 : 500;
    return res.status(statusCode).json({ error: error.message || 'Internal server error' });
  }
}
