
import { TranscriptScraper } from './TranscriptScraper.js';
import { ClaimExtractionService } from './ClaimExtractionService.js';
import { SECDataService } from './SECDataService.js';
import { ClaimVerificationService } from './ClaimVerificationService.js';
import { getTranscriptSource } from '../data/transcriptSources.js'; // Ensure correct path

/**
 * Orchestrates the full analysis pipeline:
 * 1. Fetch Transcript
 * 2. Extract Claims
 * 3. Fetch SEC Data
 * 4. Verify Claims
 */
export class AnalysisPipeline {
    constructor() {
        this.scraper = new TranscriptScraper();
        this.extractor = new ClaimExtractionService(process.env.OPENAI_API_KEY || ''); // Mock mode if no key
        this.secService = new SECDataService();
        // ClaimVerificationService needs an SEC provider, but in this architecture
        // it seems designed to take raw data. We might need to adjust based on usage.
        // For now, let's use the static verifySingleClaim logic or the service if it fits.
        // Actually, looking at ClaimVerificationService, it takes a secDataProvider.
        // Let's instantiate it with our secService.
        this.verifier = new ClaimVerificationService(this.secService);
    }

    async runAnalysis(ticker, quarter, year) {
        const quarterKey = `Q${quarter}-${year}`;

        console.log(`Starting analysis for ${ticker} ${quarterKey}...`);

        // 1. Fetch Transcript
        let transcriptText = null;
        let sourceMeta = null;

        const sourceConfig = getTranscriptSource(ticker, quarterKey);
        if (sourceConfig && sourceConfig.available && sourceConfig.type === 'transcript') {
            transcriptText = await this.scraper.fetchTranscript(sourceConfig.url, sourceConfig.source);
            sourceMeta = { source: sourceConfig.source, url: sourceConfig.url };
        } else {
            console.warn('Transcript not available or proxy mode. Using mock text for demo if needed.');
            // For the assignment, we might want to allow "Mocking" the transcript text too 
            // if the scraper blocks or fails, to ensure the UI has something to show.
            // But adhering to strict "Real Data" policy:
            if (!transcriptText) {
                return { error: 'Transcript unavailable for analysis', type: 'MISSING_TRANSCRIPT' };
            }
        }

        // 2. Extract Claims
        const claims = await this.extractor.extractClaims(transcriptText, ticker, quarterKey);

        // 3. Verify Claims
        // The ClaimVerificationService.verifyClaims method fetches SEC data internally.
        const verificationResult = await this.verifier.verifyClaims(ticker, `Q${quarter} ${year}`, claims);

        return {
            ticker,
            quarter,
            year,
            source: sourceMeta,
            ...verificationResult
        };
    }
}
