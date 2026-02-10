// Transcript source configuration and manifest
// Tracks all 40 data points (10 companies × 4 quarters) with source attribution
// Updated with full 2025 coverage - Now reads from JSON file for easier modification

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load transcript sources from JSON file
const transcriptSourcesPath = join(__dirname, 'transcriptSources.json');
export const TRANSCRIPT_SOURCES = JSON.parse(readFileSync(transcriptSourcesPath, 'utf-8'));

export const FALLBACK_POLICY = {
  MISSING_TRANSCRIPT: 'proxy',
  FALLBACK_SOURCES: [
    'The Motley Fool',
    'Yahoo Finance',
    'Investing.com',
    'Seeking Alpha',
    'SEC EDGAR (10-Q/10-K MD&A)'
  ],
  PROXY_POLICY: {
    enabled: true,
    type: '10-Q/10-K MD&A',
    label: 'SEC Filing Proxy',
    requiresDisclosure: true
  }
};

export function getTranscriptSource(ticker, quarter) {
  const companyData = TRANSCRIPT_SOURCES[ticker];
  if (!companyData) return null;
  return companyData[quarter] || null;
}

export function getCoverageStats() {
  let total = 0;
  let available = 0;
  let proxy = 0;
  let missing = 0;

  Object.values(TRANSCRIPT_SOURCES).forEach(company => {
    Object.values(company).forEach(quarter => {
      total++;
      if (quarter.available && quarter.type === 'transcript') {
        available++;
      } else if (quarter.type === 'proxy') {
        proxy++;
      } else {
        missing++;
      }
    });
  });

  return {
    total,
    available,
    proxy,
    missing,
    coverage: ((available + proxy) / total * 100).toFixed(1)
  };
}
