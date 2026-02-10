#!/usr/bin/env node
// Worker Process: Runs data aggregation separately from the API server
// - Fetches SEC data, scrapes transcripts, builds aggregate cache
// - Writes to shared .cache/ files that the server reads from
// - Can be run standalone or spawned by the server as a child process
// - Exits when done (one-shot) or runs continuously with --watch flag

import { fileCache } from '../api/_lib/cache/FileCache.js';
import { aggregateCache } from '../api/_lib/cache/AggregateCache.js';
import { DataAggregator } from '../api/_lib/services/DataAggregator.js';
import { TICKER_TO_CIK } from '../api/_lib/constants/index.js';

const WATCH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const isWatch = process.argv.includes('--watch');

async function runAggregation() {
  const startTime = Date.now();
  console.log('[Worker] 🔄 Starting data aggregation...');

  const aggregator = new DataAggregator({ scrapeTranscripts: true });
  const aggregateData = {};
  let successCount = 0;
  let failedCount = 0;

  const tickers = Object.keys(TICKER_TO_CIK);

  for (const ticker of tickers) {
    try {
      const data = await aggregator.getCompanyData(ticker);
      if (data) {
        aggregateData[ticker] = data;
        fileCache.set(ticker, data);
        const secQ = data.coverage?.financial?.sec || 0;
        const staticQ = data.coverage?.financial?.static || 0;
        const scraped = data.coverage?.transcript?.scraped || 0;
        const sysDefault = data.coverage?.transcript?.systemDefault || 0;
        console.log(`[Worker]   ✓ ${ticker} (${secQ} SEC + ${staticQ} static | ${scraped} scraped, ${sysDefault} default)`);
        successCount++;
      } else {
        failedCount++;
        console.error(`[Worker]   ✗ ${ticker} - no data returned`);
      }
    } catch (err) {
      failedCount++;
      console.error(`[Worker]   ✗ ${ticker} failed: ${err.message}`);
    }
  }

  // Write aggregate cache
  aggregateCache.set(aggregateData);

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`[Worker] ✅ Aggregation complete: ${successCount}/${tickers.length} success (${duration}s)`);

  // Signal parent process if spawned as child
  if (process.send) {
    process.send({ type: 'refresh_complete', successCount, failedCount, duration });
  }

  return { successCount, failedCount, duration };
}

async function main() {
  console.log(`[Worker] Started (pid: ${process.pid}, mode: ${isWatch ? 'watch' : 'one-shot'})`);

  // Run once immediately
  await runAggregation();

  if (isWatch) {
    // Continuous mode: re-run every 30 min
    console.log(`[Worker] 🔁 Watch mode: will re-aggregate every ${WATCH_INTERVAL_MS / 60000} min`);
    setInterval(async () => {
      if (aggregateCache.isExpired()) {
        console.log('[Worker] Cache expired, re-aggregating...');
        await runAggregation();
      } else {
        console.log(`[Worker] Cache still valid (age: ${aggregateCache.getAgeMinutes()}min), skipping`);
      }
    }, WATCH_INTERVAL_MS);
  } else {
    // One-shot mode: exit after completion
    console.log('[Worker] One-shot mode complete, exiting.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('[Worker] Fatal error:', err);
  process.exit(1);
});
