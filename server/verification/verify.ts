import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SECDataService } from '../_lib/services/SECDataService';
import { ClaimVerificationService } from '../_lib/services/ClaimVerificationService';
import { createApiHandler } from '../_lib/middleware/apiHandler';

export default createApiHandler(async (req: VercelRequest, res: VercelResponse) => {
  const { ticker, quarter, claims } = req.body;
  
  const secService = new SECDataService();
  const verificationService = new ClaimVerificationService(secService);
  
  return await verificationService.verifyClaims(ticker, quarter, claims);
}, { allowedMethods: ['POST'], requireBody: true });
