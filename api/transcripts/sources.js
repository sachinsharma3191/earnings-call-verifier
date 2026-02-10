import { TRANSCRIPT_SOURCES, FALLBACK_POLICY, getCoverageStats } from '../_lib/data/transcriptSources.js';

/**
 * GET /api/transcripts/sources
 * Returns transcript source manifest with coverage statistics
 */
export default async function handler(req, res) {
  try {
    const stats = getCoverageStats();
    
    return res.status(200).json({
      coverage: stats,
      fallback_policy: FALLBACK_POLICY,
      sources: TRANSCRIPT_SOURCES,
      metadata: {
        total_companies: Object.keys(TRANSCRIPT_SOURCES).length,
        quarters_per_company: 4,
        total_data_points: stats.total,
        last_updated: new Date().toISOString().slice(0, 10)
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to retrieve transcript sources',
      message: error.message 
    });
  }
}
