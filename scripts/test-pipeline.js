
import { AnalysisPipeline } from '../lib/services/AnalysisPipeline.js';

async function testPipeline() {
    console.log('🚀 Starting Full Pipeline Test...');
    const pipeline = new AnalysisPipeline();

    // Test Case: AAPL Q4 2025
    // This should:
    // 1. Fetch transcript from Motley Fool
    // 2. Extract claims (Mock mode)
    // 3. Fetch SEC data (Real API)
    // 4. Verify claims

    try {
        const result = await pipeline.runAnalysis('AAPL', '3', '2025');

        console.log('\n📊 Analysis Result:');
        console.log(`Ticker: ${result.ticker}`);
        console.log(`Quarter: ${result.quarter} ${result.year}`);
        console.log(`Source: ${result.source?.source} (${result.source?.url})`);
        console.log(`Accuracy Score: ${result.summary?.accuracyScore}%`);
        console.log(`Total Claims: ${result.claims?.length}`);

        console.log('\n📝 Claims Verification:');
        result.claims?.forEach(c => {
            console.log(`[${c.status.toUpperCase()}] ${c.metric}: Claimed ${c.claimed} vs Actual ${c.actual}`);
        });

        if (result.claims?.length > 0 && result.summary) {
            console.log('\n✅ Test Passed: Pipeline returned valid structured data.');
        } else {
            console.log('\n❌ Test Failed: No claims or summary returned.');
        }

    } catch (error) {
        console.error('\n❌ Test Failed with Error:', error);
    }
}

testPipeline();
