// Single Responsibility: Handle Finnhub transcript fetching
import { ITranscriptProvider, TranscriptMetadata } from '../interfaces/ITranscriptProvider';

export class FinnhubTranscriptService implements ITranscriptProvider {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://finnhub.io/api/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Finnhub API key is required');
    }
    this.apiKey = apiKey;
  }

  async getTranscript(symbol: string, year: number, quarter: number): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/stock/earnings-call-transcripts?symbol=${symbol}&token=${this.apiKey}`,
        {
          headers: {
            'X-Finnhub-Token': this.apiKey
          }
        }
      );

      if (!response.ok) {
        console.error(`Finnhub API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      const transcript = data.find((t: any) => 
        t.year === year && t.quarter === quarter
      );

      return transcript?.transcript || null;
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return null;
    }
  }

  async listAvailableTranscripts(symbol: string): Promise<TranscriptMetadata[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/stock/earnings-call-transcripts?symbol=${symbol}&token=${this.apiKey}`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.map((t: any) => ({
        symbol: t.symbol,
        year: t.year,
        quarter: t.quarter,
        date: t.date
      }));
    } catch (error) {
      console.error('Error listing transcripts:', error);
      return [];
    }
  }
}
