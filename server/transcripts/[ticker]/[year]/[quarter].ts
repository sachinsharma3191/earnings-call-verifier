import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getEarningsTranscript } from '../../../_lib/finnhub';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ticker, year, quarter } = req.query;

  if (!ticker || !year || !quarter) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const transcript = await getEarningsTranscript(
      ticker as string,
      parseInt(year as string),
      parseInt(quarter as string)
    );

    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' });
    }

    return res.status(200).json({
      ticker,
      year: parseInt(year as string),
      quarter: parseInt(quarter as string),
      transcript
    });
  } catch (error: any) {
    console.error('Error fetching transcript:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
