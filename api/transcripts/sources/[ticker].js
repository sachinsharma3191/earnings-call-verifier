import { getTranscriptSource, TRANSCRIPT_SOURCES } from '../../_lib/data/transcriptSources.js';

/**
 * GET /api/transcripts/sources/[ticker]
 * Returns transcript sources for a specific company
 */
export default async function handler(req, res) {
  try {
    const { ticker } = req.query;
    
    if (!ticker) {
      return res.status(400).json({ error: 'Missing ticker parameter' });
    }

    const companyData = TRANSCRIPT_SOURCES[ticker.toUpperCase()];
    
    if (!companyData) {
      return res.status(404).json({ 
        error: 'Company not found',
        ticker: ticker.toUpperCase()
      });
    }

    // Calculate company-specific stats
    const quarters = Object.entries(companyData).map(([quarter, data]) => ({
      quarter,
      ...data
    }));

    const stats = {
      total: quarters.length,
      available: quarters.filter(q => q.available && q.type === 'transcript').length,
      proxy: quarters.filter(q => q.type === 'proxy').length,
      missing: quarters.filter(q => !q.available && q.type !== 'proxy').length
    };

    return res.status(200).json({
      ticker: ticker.toUpperCase(),
      quarters,
      stats,
      coverage: ((stats.available + stats.proxy) / stats.total * 100).toFixed(1) + '%'
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to retrieve transcript sources',
      message: error.message 
    });
  }
}
