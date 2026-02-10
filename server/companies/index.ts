import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CompanyController } from '../_lib/controllers/CompanyController';
import { createApiHandler } from '../_lib/middleware/apiHandler';

export default createApiHandler(async (req: VercelRequest, res: VercelResponse) => {
  const controller = new CompanyController();
  return await controller.getCompaniesList();
}, { allowedMethods: ['GET'] });
