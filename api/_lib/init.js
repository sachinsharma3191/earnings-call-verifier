// Auto-prefetch companies data when server starts
import { fileCache } from './cache/FileCache.js';

let prefetchStarted = false;

export async function initializeCache() {
  // Only run once
  if (prefetchStarted) return;
  prefetchStarted = true;

  console.log('🔄 Initializing company cache...');

  try {
    // Check if cache already has data
    const cached = fileCache.getAll();
    const cachedCount = Object.keys(cached).length;

    if (cachedCount >= 10) {
      console.log(`✅ Cache already populated with ${cachedCount} companies`);
      return;
    }

    console.log('📡 Fetching company data in background...');
    
    // Call prefetch endpoint in background (don't wait)
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    fetch(`${baseUrl}/api/companies/prefetch`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'completed') {
          console.log(`✅ Cache populated: ${data.results.success.length} companies`);
        }
      })
      .catch(err => {
        console.log('⚠️  Background prefetch failed (will retry on demand):', err.message);
      });

  } catch (error) {
    console.error('❌ Cache initialization error:', error.message);
  }
}
