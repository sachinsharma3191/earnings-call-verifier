import { getTranscriptSource } from '../../../_lib/data/transcriptSources.js';

/**
 * GET /api/transcripts/sources/[ticker]/[quarter]
 * Returns transcript source for a specific company/quarter
 */
export default async function handler(req, res) {
  try {
    const { ticker, quarter } = req.query;
    
    if (!ticker || !quarter) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['ticker', 'quarter']
      });
    }

    const source = getTranscriptSource(ticker.toUpperCase(), quarter.toUpperCase());
    
    if (!source) {
      return res.status(404).json({ 
        error: 'Transcript source not found',
        ticker: ticker.toUpperCase(),
        quarter: quarter.toUpperCase()
      });
    }

    return res.status(200).json({
      ticker: ticker.toUpperCase(),
      quarter: quarter.toUpperCase(),
      source
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to retrieve transcript source',
      message: error.message 
    });
  }
}
