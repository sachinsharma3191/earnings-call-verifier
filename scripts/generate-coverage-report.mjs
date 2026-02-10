#!/usr/bin/env node
// Generate coverage report for 10x4 transcript and verification pipeline

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Load manifest
const manifestPath = path.join(rootDir, 'data', 'transcript_manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

console.log('📊 Earnings Call Verifier - Coverage Report\n');
console.log('=' .repeat(80));
console.log('\n## 10 Companies × 4 Quarters Coverage\n');

// Track coverage
const coverage = {
  totalCalls: manifest.calls.length,
  transcriptsAvailable: 0,
  claimsExtracted: 0,
  verificationsComplete: 0,
  byCompany: {}
};

// Initialize company tracking
manifest.companies.forEach(ticker => {
  coverage.byCompany[ticker] = {
    total: 4,
    transcripts: 0,
    claims: 0,
    verifications: 0
  };
});

// Check each call
manifest.calls.forEach(call => {
  const { ticker, quarter, transcript_url, transcript_output_path, claims_output_path } = call;
  
  // Check transcript availability
  const hasUrl = transcript_url && transcript_url.trim() !== '';
  const transcriptExists = fs.existsSync(path.join(rootDir, transcript_output_path));
  
  if (hasUrl || transcriptExists) {
    coverage.transcriptsAvailable++;
    coverage.byCompany[ticker].transcripts++;
  }
  
  // Check claims extraction
  const claimsPath = path.join(rootDir, claims_output_path);
  if (fs.existsSync(claimsPath)) {
    coverage.claimsExtracted++;
    coverage.byCompany[ticker].claims++;
    
    // Check if verification was run (claims file has verification results)
    try {
      const claims = JSON.parse(fs.readFileSync(claimsPath, 'utf-8'));
      if (Array.isArray(claims) && claims.length > 0 && claims[0].status) {
        coverage.verificationsComplete++;
        coverage.byCompany[ticker].verifications++;
      }
    } catch (e) {
      // Invalid JSON or no verification results
    }
  }
});

// Print summary
console.log('### Overall Coverage\n');
console.log(`| Metric | Count | Percentage |`);
console.log(`|--------|-------|------------|`);
console.log(`| Total Earnings Calls | ${coverage.totalCalls} | 100% |`);
console.log(`| Transcripts Available | ${coverage.transcriptsAvailable} | ${((coverage.transcriptsAvailable / coverage.totalCalls) * 100).toFixed(1)}% |`);
console.log(`| Claims Extracted | ${coverage.claimsExtracted} | ${((coverage.claimsExtracted / coverage.totalCalls) * 100).toFixed(1)}% |`);
console.log(`| Verifications Complete | ${coverage.verificationsComplete} | ${((coverage.verificationsComplete / coverage.totalCalls) * 100).toFixed(1)}% |`);

console.log('\n### Coverage by Company\n');
console.log(`| Ticker | Company | Transcripts | Claims | Verifications |`);
console.log(`|--------|---------|-------------|--------|---------------|`);

const companyNames = {
  AAPL: 'Apple Inc.',
  MSFT: 'Microsoft Corporation',
  NVDA: 'NVIDIA Corporation',
  GOOGL: 'Alphabet Inc.',
  AMZN: 'Amazon.com Inc.',
  META: 'Meta Platforms Inc.',
  TSLA: 'Tesla Inc.',
  JPM: 'JPMorgan Chase & Co.',
  JNJ: 'Johnson & Johnson',
  WMT: 'Walmart Inc.'
};

manifest.companies.forEach(ticker => {
  const stats = coverage.byCompany[ticker];
  const name = companyNames[ticker] || ticker;
  console.log(`| ${ticker} | ${name} | ${stats.transcripts}/4 | ${stats.claims}/4 | ${stats.verifications}/4 |`);
});

// Missing transcripts
console.log('\n### Missing Transcripts\n');
const missing = manifest.calls.filter(call => {
  const hasUrl = call.transcript_url && call.transcript_url.trim() !== '';
  const exists = fs.existsSync(path.join(rootDir, call.transcript_output_path));
  return !hasUrl && !exists;
});

if (missing.length === 0) {
  console.log('✅ All transcripts are available or have URLs specified!\n');
} else {
  console.log(`⚠️  ${missing.length} transcripts are missing:\n`);
  missing.forEach(call => {
    console.log(`- ${call.ticker} ${call.quarter}`);
  });
  console.log();
}

// Next steps
console.log('### Next Steps\n');
if (coverage.transcriptsAvailable < coverage.totalCalls) {
  console.log('1. ⬇️  Add missing transcript URLs to `data/transcript_manifest.json`');
  console.log('2. 🔄 Run `node scripts/fetch-transcripts.mjs` to download transcripts');
}
if (coverage.claimsExtracted < coverage.transcriptsAvailable) {
  console.log('3. 🤖 Use Claude Skill to extract claims from transcripts');
  console.log('4. 💾 Save extracted claims JSON to the paths specified in manifest');
}
if (coverage.verificationsComplete < coverage.claimsExtracted) {
  console.log('5. ✅ Run `node scripts/batch-verify.mjs` to verify all claims');
}
if (coverage.verificationsComplete === coverage.totalCalls) {
  console.log('🎉 All 40 earnings calls have been processed and verified!');
}

console.log('\n' + '='.repeat(80));
console.log('\n📄 Report generated: ' + new Date().toISOString());

// Save report to file
const reportPath = path.join(rootDir, 'data', 'coverage-report.md');
const reportContent = `# Coverage Report

Generated: ${new Date().toISOString()}

## Summary

- Total Earnings Calls: ${coverage.totalCalls}
- Transcripts Available: ${coverage.transcriptsAvailable} (${((coverage.transcriptsAvailable / coverage.totalCalls) * 100).toFixed(1)}%)
- Claims Extracted: ${coverage.claimsExtracted} (${((coverage.claimsExtracted / coverage.totalCalls) * 100).toFixed(1)}%)
- Verifications Complete: ${coverage.verificationsComplete} (${((coverage.verificationsComplete / coverage.totalCalls) * 100).toFixed(1)}%)

## By Company

${manifest.companies.map(ticker => {
  const stats = coverage.byCompany[ticker];
  const name = companyNames[ticker] || ticker;
  return `- **${ticker}** (${name}): ${stats.transcripts}/4 transcripts, ${stats.claims}/4 claims, ${stats.verifications}/4 verifications`;
}).join('\n')}

## Missing Transcripts

${missing.length === 0 ? '✅ All transcripts available!' : missing.map(c => `- ${c.ticker} ${c.quarter}`).join('\n')}
`;

fs.writeFileSync(reportPath, reportContent, 'utf-8');
console.log(`\n💾 Detailed report saved to: ${reportPath}\n`);
