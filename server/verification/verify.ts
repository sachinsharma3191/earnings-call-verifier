import type { VercelRequest, VercelResponse } from '@vercel/node';
import { VerificationController } from '../_lib/controllers/VerificationController';
import { createApiHandler } from '../_lib/middleware/apiHandler';

export default createApiHandler(async (req: VercelRequest, res: VercelResponse) => {
  const { ticker, quarter, claims } = req.body;
  const controller = new VerificationController();
  return await controller.verifyClaims(ticker, quarter, claims);
}, { allowedMethods: ['POST'], requireBody: true });
