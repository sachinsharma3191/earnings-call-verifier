// Finnhub API integration for earnings call transcripts
import { config } from 'dotenv';
config();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';
const BASE_URL = 'https://finnhub.io/api/v1';

export async function getEarningsTranscript(
  symbol,
  year,
  quarter
) {
  if (!FINNHUB_API_KEY) {
    throw new Error('FINNHUB_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/stock/earnings-call-transcripts?symbol=${symbol}`,
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
    
    const transcript = data.find((t) => 
      t.year === year && t.quarter === quarter
    );

    return transcript?.transcript || null;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
}

export async function listAvailableTranscripts(symbol) {
  if (!FINNHUB_API_KEY) {
    throw new Error('FINNHUB_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/stock/earnings-call-transcripts?symbol=${symbol}`,
      {
        headers: {
          'X-Finnhub-Token': FINNHUB_API_KEY
        }
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.map((t) => ({
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
