
import { getAvailableTickers } from '../lib/sec.js';
import { AnalysisPipeline } from '../lib/services/AnalysisPipeline.js';

async function debugAPI() {
    console.log('--- Debugging /api/companies ---');
    try {
        const tickers = getAvailableTickers();
        console.log('Tickers:', tickers);
    } catch (err) {
        console.error('getAvailableTickers failed:', err);
    }

    console.log('\n--- Debugging /api/analyze ---');
    try {
        const pipeline = new AnalysisPipeline();
        // Test with a known good ticker/quarter
        const result = await pipeline.runAnalysis('AAPL', '3', '2025');
        console.log('Analysis result:', result ? 'Success' : 'Indeterminate');
    } catch (err) {
        console.error('AnalysisPipeline failed:', err);
    }
}

debugAPI();
