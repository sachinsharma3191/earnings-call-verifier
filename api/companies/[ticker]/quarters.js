import { fileCache } from '../../_lib/cache/FileCache.js';
import { DataAggregator } from '../../_lib/services/DataAggregator.js';
import { TICKER_TO_CIK } from '../../_lib/constants/index.js';

export default async function handler(req, res) {
  const { ticker } = req.query;
  const startTime = Date.now();
  
  console.log(`[API] GET /api/companies/${ticker}/quarters - Request received`);
  
  if (!ticker) {
    return res.status(400).json({ error: 'Missing ticker parameter' });
  }

  const upperTicker = ticker.toUpperCase();
  const cik = TICKER_TO_CIK[upperTicker];
  if (!cik) {
    return res.status(400).json({ error: `Company ${ticker} not found` });
  }

  try {
    // Try cache first
    let data = fileCache.get(upperTicker);
    
    // If not cached, aggregate fresh
    if (!data) {
      const aggregator = new DataAggregator();
      data = await aggregator.getCompanyData(upperTicker);
      if (data) {
        fileCache.set(upperTicker, data);
      }
    }

    if (!data || !data.quarters) {
      return res.status(400).json({ error: `No data available for ${upperTicker}` });
    }

    const duration = Date.now() - startTime;
    const secCount = data.coverage?.financial?.sec || 0;
    const staticCount = data.coverage?.financial?.static || 0;
    console.log(`[API] GET /api/companies/${upperTicker}/quarters - Success (${duration}ms) - ${data.quarters.length} quarters (${secCount} SEC + ${staticCount} static)`);

    return res.status(200).json({
      ticker: upperTicker,
      quarters: data.quarters,
      coverage: data.coverage,
      source: 'aggregated'
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API] GET /api/companies/${upperTicker}/quarters - Error (${duration}ms):`, error.message);
    return res.status(400).json({ error: `Failed to get quarters for ${upperTicker}`, details: error.message });
  }
}
