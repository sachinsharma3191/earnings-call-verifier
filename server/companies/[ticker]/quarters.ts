import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { ticker } = req.query;
  
  if (!ticker) {
    return res.status(400).json({ error: 'Missing ticker parameter' });
  }

  // Return static quarters for now to avoid SEC API timeout
  // TODO: Implement caching or async processing for SEC data
  const quarters = [
    { quarter: 'Q1 2025', endDate: '2025-03-31', filed: '2025-04-30' },
    { quarter: 'Q2 2025', endDate: '2025-06-30', filed: '2025-07-30' },
    { quarter: 'Q3 2025', endDate: '2025-09-30', filed: '2025-10-30' },
    { quarter: 'Q4 2024', endDate: '2024-12-31', filed: '2025-01-30' }
  ];

  return res.status(200).json({
    ticker,
    quarters
  });
}
