import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CompanyController } from '../_lib/controllers/CompanyController';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const controller = new CompanyController();
    const companies = await controller.getCompaniesList();
    return res.status(200).json(companies);
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
