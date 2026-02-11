#!/usr/bin/env node
// Build-time cache generation for Vercel deployment
// Runs during build to create static cache files that get deployed with the app

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Create .cache directory in project root
const cacheDir = join(rootDir, '.cache');
if (!existsSync(cacheDir)) {
  mkdirSync(cacheDir, { recursive: true });
}

console.log('[Build Cache] Generating static cache files for Vercel deployment...');

// Static company data with sample quarters
const companies = {
  'AAPL': {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    cik: '0000320193',
    quarters: [
      {
        quarter: 'Q4 2025',
        endDate: '2025-12-31',
        filed: '2026-01-31',
        financials: {
          Revenues: 124.3,
          NetIncome: 35.2,
          GrossProfit: 57.1,
          OperatingIncome: 42.8,
          CostOfRevenue: 67.2,
          OperatingExpenses: 14.9,
          EPS: 2.3
        },
        dataSource: 'static_fallback'
      },
      {
        quarter: 'Q3 2025',
        endDate: '2025-09-30',
        filed: '2025-10-31',
        financials: {
          Revenues: 118.5,
          NetIncome: 33.8,
          GrossProfit: 54.2,
          OperatingIncome: 40.1,
          CostOfRevenue: 64.3,
          OperatingExpenses: 14.1,
          EPS: 2.2
        },
        dataSource: 'static_fallback'
      },
      {
        quarter: 'Q2 2025',
        endDate: '2025-06-30',
        filed: '2025-07-31',
        financials: {
          Revenues: 115.2,
          NetIncome: 32.1,
          GrossProfit: 52.8,
          OperatingIncome: 38.5,
          CostOfRevenue: 62.4,
          OperatingExpenses: 14.3,
          EPS: 2.1
        },
        dataSource: 'static_fallback'
      },
      {
        quarter: 'Q1 2025',
        endDate: '2025-03-31',
        filed: '2025-04-30',
        financials: {
          Revenues: 112.8,
          NetIncome: 30.5,
          GrossProfit: 51.2,
          OperatingIncome: 37.2,
          CostOfRevenue: 61.6,
          OperatingExpenses: 14.0,
          EPS: 2.0
        },
        dataSource: 'static_fallback'
      }
    ]
  }
};

// Add other companies with similar structure
const tickers = ['NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'JPM', 'JNJ', 'WMT'];
const companyNames = {
  'NVDA': 'NVIDIA Corporation',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'META': 'Meta Platforms Inc.',
  'TSLA': 'Tesla Inc.',
  'JPM': 'JPMorgan Chase & Co.',
  'JNJ': 'Johnson & Johnson',
  'WMT': 'Walmart Inc.'
};

const ciks = {
  'NVDA': '0001045810',
  'MSFT': '0000789019',
  'GOOGL': '0001652044',
  'AMZN': '0001018724',
  'META': '0001326801',
  'TSLA': '0001318605',
  'JPM': '0000019617',
  'JNJ': '0000200406',
  'WMT': '0000104169'
};

tickers.forEach(ticker => {
  companies[ticker] = {
    ticker,
    name: companyNames[ticker],
    cik: ciks[ticker],
    quarters: companies.AAPL.quarters.map(q => ({
      ...q,
      financials: {
        ...q.financials,
        Revenues: q.financials.Revenues * (0.8 + Math.random() * 0.4),
        NetIncome: q.financials.NetIncome * (0.8 + Math.random() * 0.4),
        GrossProfit: q.financials.GrossProfit * (0.8 + Math.random() * 0.4),
        OperatingIncome: q.financials.OperatingIncome * (0.8 + Math.random() * 0.4)
      }
    }))
  };
});

// Write individual company cache files
Object.values(companies).forEach(company => {
  const companyFile = join(cacheDir, `${company.ticker}.json`);
  writeFileSync(companyFile, JSON.stringify({
    data: company,
    timestamp: Date.now(),
    lastUpdated: new Date().toISOString()
  }, null, 2));
  console.log(`[Build Cache] ✓ ${company.ticker}.json`);
});

// Write aggregate cache
const aggregateData = {
  data: companies,
  timestamp: Date.now(),
  lastUpdated: new Date().toISOString()
};

writeFileSync(
  join(cacheDir, 'aggregate.json'),
  JSON.stringify(aggregateData, null, 2)
);
console.log('[Build Cache] ✓ aggregate.json');

// Write companies cache (for FileCache)
const companiesCache = {
  cache: companies,
  metadata: {
    lastUpdated: new Date().toISOString(),
    count: Object.keys(companies).length
  }
};

writeFileSync(
  join(cacheDir, 'companies.json'),
  JSON.stringify(companiesCache, null, 2)
);
console.log('[Build Cache] ✓ companies.json');

// Write empty claims cache
writeFileSync(
  join(cacheDir, 'claims.json'),
  JSON.stringify({ claims: [], lastUpdated: new Date().toISOString() }, null, 2)
);
console.log('[Build Cache] ✓ claims.json');

console.log(`[Build Cache] ✅ Generated ${Object.keys(companies).length} company cache files`);
console.log('[Build Cache] Cache files will be deployed with the app');
