import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TranscriptController } from '../../../_lib/controllers/TranscriptController';
import { createApiHandler } from '../../../_lib/middleware/apiHandler';

export default createApiHandler(async (req: VercelRequest, res: VercelResponse) => {
  const { ticker, year, quarter } = req.query;
  const controller = new TranscriptController();
  return await controller.getTranscript(
    ticker as string,
    parseInt(year as string),
    parseInt(quarter as string)
  );
}, { allowedMethods: ['GET'] });
