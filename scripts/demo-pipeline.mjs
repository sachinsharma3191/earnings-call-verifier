#!/usr/bin/env node
// Demonstration of the complete 10x4 pipeline workflow

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Earnings Call Verifier - Complete Pipeline Demo\n');
console.log('=' .repeat(80));

// Step 1: Check manifest
console.log('\n📋 Step 1: Checking Transcript Manifest\n');
const manifestPath = path.join(rootDir, 'data', 'transcript_manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

console.log(`✅ Manifest loaded: ${manifest.calls.length} earnings calls configured`);
console.log(`   Companies: ${manifest.companies.join(', ')}`);
console.log(`   Quarters: ${manifest.quarters.join(', ')}`);

const withUrls = manifest.calls.filter(c => c.transcript_url && c.transcript_url.trim());
console.log(`\n📊 Transcript URLs: ${withUrls.length}/${manifest.calls.length} configured`);

if (withUrls.length === 0) {
  console.log('\n⚠️  No transcript URLs configured yet.');
  console.log('\n💡 Next Steps:');
  console.log('   1. Add transcript URLs to data/transcript_manifest.json');
  console.log('   2. Follow source hierarchy: IR pages → Public publishers → MD&A fallback');
  console.log('   3. Run: node scripts/fetch-transcripts.mjs');
} else {
  console.log(`\n✅ Ready to fetch ${withUrls.length} transcripts`);
  console.log('   Run: node scripts/fetch-transcripts.mjs');
}

// Step 2: Check transcripts
console.log('\n\n📄 Step 2: Checking Downloaded Transcripts\n');
let transcriptCount = 0;
manifest.calls.forEach(call => {
  const transcriptPath = path.join(rootDir, call.transcript_output_path);
  if (fs.existsSync(transcriptPath)) {
    transcriptCount++;
  }
});

console.log(`📊 Transcripts downloaded: ${transcriptCount}/${manifest.calls.length}`);

if (transcriptCount === 0) {
  console.log('\n⚠️  No transcripts downloaded yet.');
  console.log('\n💡 After adding URLs to manifest, run:');
  console.log('   node scripts/fetch-transcripts.mjs');
} else {
  console.log(`\n✅ ${transcriptCount} transcripts ready for claim extraction`);
}

// Step 3: Check claims
console.log('\n\n🤖 Step 3: Checking Extracted Claims\n');
let claimsCount = 0;
let totalClaims = 0;
manifest.calls.forEach(call => {
  const claimsPath = path.join(rootDir, call.claims_output_path);
  if (fs.existsSync(claimsPath)) {
    try {
      const claims = JSON.parse(fs.readFileSync(claimsPath, 'utf-8'));
      const claimArray = Array.isArray(claims) ? claims : (claims.claims || []);
      totalClaims += claimArray.length;
      claimsCount++;
    } catch (e) {
      // Invalid JSON
    }
  }
});

console.log(`📊 Claims extracted: ${claimsCount}/${manifest.calls.length} calls`);
console.log(`📊 Total claims: ${totalClaims}`);

if (claimsCount === 0) {
  console.log('\n⚠️  No claims extracted yet.');
  console.log('\n💡 Use Claude Skill to extract claims:');
  console.log('   1. Register skill using your deployed /api/openapi endpoint');
  console.log('   2. Use the prompt template in CLAUDE_SKILL_SETUP.md');
  console.log('   3. Save extracted JSON to paths in manifest');
  console.log('   4. Or use the Live UI Claims Explorer for interactive extraction');
} else {
  console.log(`\n✅ ${totalClaims} claims ready for verification`);
}

// Step 4: Check verifications
console.log('\n\n✅ Step 4: Checking Verifications\n');
const resultsDir = path.join(rootDir, 'results');
let verifiedCount = 0;

if (fs.existsSync(resultsDir)) {
  manifest.companies.forEach(ticker => {
    const companyDir = path.join(resultsDir, ticker);
    if (fs.existsSync(companyDir)) {
      const files = fs.readdirSync(companyDir).filter(f => f.endsWith('.verified.json'));
      verifiedCount += files.length;
    }
  });
}

console.log(`📊 Verifications complete: ${verifiedCount}/${manifest.calls.length}`);

if (verifiedCount === 0) {
  console.log('\n⚠️  No verifications run yet.');
  console.log('\n💡 Run batch verification:');
  console.log('   1. Start local server: npx vercel dev');
  console.log('   2. In another terminal: node scripts/batch-verify.mjs');
  console.log('   3. Or use Live UI for interactive verification');
} else {
  console.log(`\n✅ ${verifiedCount} calls verified`);
  
  // Load results index if it exists
  const indexPath = path.join(resultsDir, 'index.json');
  if (fs.existsSync(indexPath)) {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    console.log('\n📈 Verification Summary:');
    console.log(`   Generated: ${new Date(index.generated_at).toLocaleString()}`);
    console.log(`   Success: ${index.ok}`);
    console.log(`   Skipped: ${index.skipped}`);
    console.log(`   Failed: ${index.failed}`);
  }
}

// Overall status
console.log('\n\n' + '='.repeat(80));
console.log('\n📊 Pipeline Status Summary\n');

const pipelineSteps = [
  { name: 'Transcript URLs configured', count: withUrls.length, total: manifest.calls.length },
  { name: 'Transcripts downloaded', count: transcriptCount, total: manifest.calls.length },
  { name: 'Claims extracted', count: claimsCount, total: manifest.calls.length },
  { name: 'Verifications complete', count: verifiedCount, total: manifest.calls.length }
];

pipelineSteps.forEach((step, idx) => {
  const percentage = ((step.count / step.total) * 100).toFixed(1);
  const status = step.count === step.total ? '✅' : step.count > 0 ? '🔄' : '⏳';
  console.log(`${idx + 1}. ${status} ${step.name}: ${step.count}/${step.total} (${percentage}%)`);
});

const overallProgress = ((verifiedCount / manifest.calls.length) * 100).toFixed(1);
console.log(`\n🎯 Overall Progress: ${overallProgress}% complete`);

// Next action
console.log('\n\n💡 Next Action:\n');
if (withUrls.length < manifest.calls.length) {
  console.log('→ Add transcript URLs to data/transcript_manifest.json');
  console.log('  Follow the source hierarchy documented in the manifest');
} else if (transcriptCount < withUrls.length) {
  console.log('→ Run: node scripts/fetch-transcripts.mjs');
  console.log('  This will download all configured transcripts');
} else if (claimsCount < transcriptCount) {
  console.log('→ Extract claims using Claude Skill');
  console.log('  See CLAUDE_SKILL_SETUP.md for instructions');
  console.log('  Or use the Live UI Claims Explorer');
} else if (verifiedCount < claimsCount) {
  console.log('→ Run: node scripts/batch-verify.mjs');
  console.log('  Make sure local server is running: npx vercel dev');
} else {
  console.log('🎉 Pipeline complete! All 40 earnings calls processed.');
  console.log('\n📊 View results:');
  console.log('   - Web UI: Switch to Static mode to see pre-verified claims');
  console.log('   - Files: Check results/ directory for detailed JSON');
  console.log('   - Report: Run node scripts/generate-coverage-report.mjs');
}

console.log('\n' + '='.repeat(80) + '\n');
