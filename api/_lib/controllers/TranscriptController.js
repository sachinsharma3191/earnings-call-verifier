// Thin controller - delegates to service layer
import { ServiceContainer } from '../container/ServiceContainer';

export class TranscriptController {
  constructor() {
    const container = ServiceContainer.getInstance();
    this.transcriptService = container.getTranscriptService();
  }

  async getTranscript(ticker, year, quarter) {
    if (!ticker || !year || !quarter) {
      throw new Error('Missing required parameters: ticker, year, quarter');
    }

    const transcript = await this.transcriptService.getTranscript(ticker, year, quarter);

    if (!transcript) {
      throw new Error('Transcript not found');
    }

    return {
      ticker,
      year,
      quarter,
      transcript
    };
  }

  async listTranscripts(ticker) {
    if (!ticker) {
      throw new Error('Missing required parameter: ticker');
    }

    return await this.transcriptService.listAvailableTranscripts(ticker);
  }
}
