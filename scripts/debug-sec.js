
import { SECDataService } from '../lib/services/SECDataService.js';

async function debugSEC() {
    const service = new SECDataService();
    try {
        console.log('Fetching SEC data for AAPL...');
        // CIK for Apple is 0000320193
        const data = await service.getQuarterlyData('0000320193');
        console.log('Available Quarters:');
        data.forEach(q => {
            console.log(`- ${q.fiscal_period} ${q.fiscal_year} (End: ${q.end_date}, Filed: ${q.filed})`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

debugSEC();
