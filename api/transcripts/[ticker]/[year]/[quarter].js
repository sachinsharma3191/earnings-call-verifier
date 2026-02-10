import { FinnhubTranscriptService } from '../../../_lib/services/FinnhubTranscriptService.js';

export default async function handler(req, res) {
  const { ticker, year, quarter } = req.query;

  if (!ticker || !year || !quarter) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const apiKey = process.env.FINNHUB_API_KEY || '';
  
  if (apiKey) {
    try {
      const finnhubService = new FinnhubTranscriptService(apiKey);
      const transcript = await finnhubService.getTranscript(
        ticker,
        parseInt(year),
        parseInt(quarter)
      );

      if (transcript) {
        return res.status(200).json({
          ticker,
          year: parseInt(year),
          quarter: parseInt(quarter),
          transcript,
          source: 'finnhub'
        });
      }
    } catch (error) {
      console.warn(`Finnhub API failed for ${ticker}, using mock transcript:`, error);
    }
  }

  const mockTranscript = `
Earnings Call Transcript - ${ticker} Q${quarter} ${year}

CEO: Thank you for joining us today. We're pleased to report strong results for Q${quarter} ${year}.

Our revenue came in at $95.3 billion, representing growth of 6% year over year. Operating income reached $31.5 billion, and our gross margin expanded to 46.2%.

CFO: Adding to that, our net income for the quarter came in at $24.2 billion. We continue to see strong demand across all our product categories.

Our operating margin improved to 33.1%, reflecting our operational efficiency and scale advantages.

Q&A Session will follow...
  `.trim();

  return res.status(200).json({
    ticker,
    year: parseInt(year),
    quarter: parseInt(quarter),
    transcript: mockTranscript,
    source: 'mock_fallback'
  });
}
