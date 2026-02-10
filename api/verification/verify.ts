import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SECDataService } from '../_lib/services/SECDataService';
import { ClaimVerificationService } from '../_lib/services/ClaimVerificationService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ticker, quarter, claims } = req.body;
    
    if (!ticker || !quarter || !claims) {
      return res.status(400).json({ error: 'Missing required parameters: ticker, quarter, claims' });
    }

    if (!Array.isArray(claims) || claims.length === 0) {
      return res.status(400).json({ error: 'Claims must be a non-empty array' });
    }

    const secService = new SECDataService();
    const verificationService = new ClaimVerificationService(secService);
    
    const result = await verificationService.verifyClaims(ticker, quarter, claims);
    
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error verifying claims:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
