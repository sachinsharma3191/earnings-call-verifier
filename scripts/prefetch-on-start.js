#!/usr/bin/env node
import { setTimeout } from 'timers/promises';

const API_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

async function prefetchCompanies() {
  console.log('🔄 Prefetching company data...');
  
  try {
    const response = await fetch(`${API_URL}/api/companies/prefetch`);
    const data = await response.json();
    
    if (data.status === 'completed') {
      console.log('✅ Company data cached successfully!');
      console.log(`   - Success: ${data.results.success.length}`);
      console.log(`   - Cached: ${data.results.cached}`);
      console.log(`   - Failed: ${data.results.failed.length}`);
    } else {
      console.log('⚠️  Prefetch status:', data.status);
    }
  } catch (error) {
    console.error('❌ Failed to prefetch companies:', error.message);
  }
}

// Wait for server to be ready, then prefetch
async function waitAndPrefetch() {
  console.log('⏳ Waiting for server to start...');
  await setTimeout(3000); // Wait 3 seconds for server to be ready
  await prefetchCompanies();
}

waitAndPrefetch();
