// Finnhub API integration for earnings call transcripts
import { config } from 'dotenv';
config();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';
const BASE_URL = 'https://finnhub.io/api/v1';

export interface EarningsTranscript {
  symbol: string;
  quarter: number;
  year: number;
  transcript: string;
}

export async function getEarningsTranscript(
  symbol: string,
  year: number,
  quarter: number
): Promise<string | null> {
  if (!FINNHUB_API_KEY) {
    throw new Error('FINNHUB_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/stock/earnings-call-transcripts?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      {
        headers: {
          'X-Finnhub-Token': FINNHUB_API_KEY
        }
      }
    );

    if (!response.ok) {
      console.error(`Finnhub API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Find transcript for specific quarter/year
    const transcript = data.find((t: any) => 
      t.year === year && t.quarter === quarter
    );

    return transcript?.transcript || null;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
}

export async function listAvailableTranscripts(symbol: string) {
  if (!FINNHUB_API_KEY) {
    throw new Error('FINNHUB_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/stock/earnings-call-transcripts?symbol=${symbol}&token=${FINNHUB_API_KEY}`
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
