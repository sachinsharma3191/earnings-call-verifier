import type { VercelRequest, VercelResponse } from '@vercel/node';
import { VerificationController } from '../_lib/controllers/VerificationController';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ticker, quarter, claims } = req.body;

  try {
    const controller = new VerificationController();
    const result = await controller.verifyClaims(ticker, quarter, claims);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error verifying claims:', error);
    const statusCode = error.message.includes('Missing') || error.message.includes('cannot be empty') ? 400 : 
                       error.message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({ error: error.message || 'Internal server error' });
  }
}
