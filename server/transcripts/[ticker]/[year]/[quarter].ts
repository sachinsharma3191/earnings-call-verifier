import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TranscriptController } from '../../../_lib/controllers/TranscriptController';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ticker, year, quarter } = req.query;

  try {
    const controller = new TranscriptController();
    const result = await controller.getTranscript(
      ticker as string,
      parseInt(year as string),
      parseInt(quarter as string)
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching transcript:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                       error.message.includes('Missing') ? 400 : 500;
    return res.status(statusCode).json({ error: error.message || 'Internal server error' });
  }
}
