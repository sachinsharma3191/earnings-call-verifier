// Interface Segregation Principle - Define contract for transcript providers
export interface ITranscriptProvider {
  getTranscript(symbol: string, year: number, quarter: number): Promise<string | null>;
  listAvailableTranscripts(symbol: string): Promise<TranscriptMetadata[]>;
}

export interface TranscriptMetadata {
  symbol: string;
  year: number;
  quarter: number;
  date?: string;
}
