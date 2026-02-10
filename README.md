# Earnings Call Claim Verifier

> **Full-stack application that verifies executive claims from earnings calls against official SEC EDGAR filings**

**Stack**: React + Vite frontend, Fastify API (Node.js), SEC EDGAR XBRL integration, multi-layer caching

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Local Development

```bash
# Install dependencies (root + UI)
npm install

# Start API server (port 3000)
npm run api

# In another terminal — start UI dev server (port 5173, proxies /api to 3000)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Background Worker (optional)

The cache worker fetches live SEC data and scrapes transcripts. It runs automatically on server start, but you can trigger it manually:

```bash
npm run worker          # One-shot: fetch all companies
npm run worker:watch    # Continuous: re-fetch every 30 min
```

### Build for Production

```bash
npm run build
```

---

## Features

### Dashboard
- **Key stats grid** — clickable cards that scroll to relevant sections or open external links
- **Top Discrepancies** — fetched from `/api/discrepancies/top`, computed from real cached SEC data; searchable and sortable by ticker, metric, speaker, severity, % difference
- **Companies list** — searchable by ticker/name/CIK, sortable by ticker/name/quarter
- **Refresh button** — reload discrepancies when cache is still warming up

### Company Detail
- SEC filing metrics per quarter: Revenue, Net Income, Gross Profit, Operating Income, Cost of Revenue, Operating Expenses, EPS
- Quarter selector with data source attribution
- Transcript source info with visual indicators

### Claims Explorer (Two Tabs)
- **Verify Claims** — select company & quarter, paste Claude-extracted claims JSON, verify against SEC data
- **Search Claims** — filter verified results by text/speaker/metric/status/severity; auto-switches after verification

---

## Companies Covered

| Ticker | Company | Sector |
|--------|---------|--------|
| AAPL | Apple Inc. | Technology |
| NVDA | NVIDIA Corporation | Semiconductors |
| MSFT | Microsoft Corporation | Technology |
| GOOGL | Alphabet Inc. | Technology |
| AMZN | Amazon.com Inc. | E-commerce |
| META | Meta Platforms Inc. | Social Media |
| TSLA | Tesla Inc. | Automotive |
| JPM | JPMorgan Chase & Co. | Banking |
| JNJ | Johnson & Johnson | Healthcare |
| WMT | Walmart Inc. | Retail |

**Coverage**: 10 companies x 4 quarters (Q1-Q4 2025) = 40 data points

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  React Frontend (Vite)                     │
│  Dashboard · Company Detail · Claims Explorer · About     │
└──────────────────┬───────────────────────────────────────┘
                   │  /api/* (Vite proxy → localhost:3000)
                   ▼
┌──────────────────────────────────────────────────────────┐
│              Fastify API Server (Node.js)                  │
│  Routes: companies, verification, discrepancies, health   │
│  Services: SECDataService, TranscriptService              │
│  Cache: AggregateCache + FileCache (disk-backed)          │
└──────────────────┬───────────────────────────────────────┘
                   │  HTTPS
                   ▼
┌──────────────────────────────────────────────────────────┐
│                   SEC EDGAR API                            │
│  XBRL structured data · 10-Q/10-K filings · Free/public  │
└──────────────────────────────────────────────────────────┘
```

### Cache System

- **`init.js`** — synchronous startup, loads existing `.cache/` files from disk
- **`CacheRefresher`** — spawns `worker.js` as child process if cache is empty/expired; periodic 30-min checks
- **`worker.js`** — separate process that fetches SEC API data + scrapes transcripts, writes to `.cache/aggregate.json` and `.cache/companies.json`
- **Zero API calls during request handling** — all endpoints read from in-memory cache

---

## Project Structure

```
earnings-call-verifier/
├── api/
│   ├── server.js                  # Fastify server entry point
│   ├── worker.js                  # Background cache worker
│   ├── _lib/
│   │   ├── fastifyApp.js          # Route definitions
│   │   ├── init.js                # Synchronous cache bootstrap
│   │   ├── cache/
│   │   │   ├── AggregateCache.js  # In-memory + disk cache
│   │   │   ├── CacheRefresher.js  # Worker orchestrator
│   │   │   └── FileCache.js       # Per-company file cache
│   │   ├── constants/
│   │   │   ├── companies.js       # 10 company tickers/CIKs
│   │   │   └── quarters.js        # Static fallback data
│   │   ├── services/
│   │   │   ├── SECDataService.js  # SEC EDGAR XBRL extraction
│   │   │   └── TranscriptService.js
│   │   └── controllers/
│   ├── companies/                 # Vercel-compatible route handlers
│   ├── verification/
│   └── transcripts/
│
├── ui/
│   ├── src/
│   │   ├── App.jsx                # Main app with navigation
│   │   ├── main.jsx               # Entry point with CompaniesProvider
│   │   ├── context/
│   │   │   └── CompaniesContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Stats, discrepancies, companies list
│   │   │   ├── CompanyDetail.jsx  # Per-company financials & metrics
│   │   │   ├── ClaimExplorer.jsx  # Two-tab verify + search
│   │   │   └── About.jsx
│   │   ├── utils/
│   │   │   └── apiClient.js       # API client (all endpoints)
│   │   ├── data/                   # Mock/sample data fallbacks
│   │   └── index.css               # Tailwind styles
│   ├── package.json
│   └── vite.config.js              # Dev server + proxy config
│
├── scripts/                        # Prefetch & utility scripts
├── vercel.json                     # Vercel deployment config
├── package.json                    # Root: dependencies + npm scripts
└── README.md
```

---

## API Endpoints

### Health
```
GET /api/health                              # Server status + cache info
```

### Companies
```
GET /api/companies                           # All companies with latest data
GET /api/companies/{ticker}                  # Company detail + quarters
GET /api/companies/{ticker}/quarters         # Available quarters
GET /api/companies/{ticker}/metrics/{quarter} # Calculated metrics for quarter
```

### Discrepancies
```
GET /api/discrepancies/top?limit=5           # Top N discrepancies from cached data
```

### Verification
```
POST /api/verification/verify                # Verify claims JSON against SEC data
```

### Transcripts
```
GET /api/transcripts/sources                 # Full transcript manifest
GET /api/transcripts/sources/{ticker}        # Company transcript sources
```

### OpenAPI
```
GET /api/openapi                             # OpenAPI spec for Claude Skill
```

---

## End-to-End Workflow

### 1. Extract Claims (Claude Skill)

Register the Claude Skill using the `/api/openapi` endpoint, then paste an earnings call transcript. Claude extracts structured claims:

```json
{
  "speaker": "Tim Cook",
  "role": "CEO",
  "text": "Our Q4 revenue came in at $95.3 billion",
  "metric": "Revenue",
  "claimed": 95.3,
  "unit": "billion"
}
```

### 2. Verify Claims

In the **Claims Explorer → Verify tab**, select a company and quarter, paste the claims JSON, and click Verify. The API cross-references each claim against SEC EDGAR XBRL data.

### 3. Search & Analyze

Switch to the **Search tab** to filter results by status (accurate/discrepant/unverifiable), severity, speaker, or metric. The Dashboard shows top discrepancies across all companies.

---

## Financial Metrics Extracted

From SEC EDGAR XBRL filings (multiple concept name variants tried per metric):

| Metric | XBRL Concepts |
|--------|--------------|
| Revenue | `Revenues`, `RevenueFromContractWithCustomerExcludingAssessedTax` |
| Net Income | `NetIncomeLoss` |
| Gross Profit | `GrossProfit` |
| Operating Income | `OperatingIncomeLoss` |
| Cost of Revenue | `CostOfRevenue`, `CostOfGoodsAndServicesSold`, `CostOfGoodsSold` |
| Operating Expenses | `OperatingExpenses`, `OperatingCostsAndExpenses`, `CostsAndExpenses` |
| EPS | `EarningsPerShareDiluted`, `EarningsPerShareBasic` |

---

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite UI dev server (port 5173) |
| `npm run api` | Start Fastify API server (port 3000) |
| `npm run build` | Build UI for production |
| `npm run worker` | Run cache worker (one-shot) |
| `npm run worker:watch` | Run cache worker (continuous, 30-min interval) |
| `npm run prefetch` | Prefetch cache on startup |

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons
- **Backend**: Fastify (Node.js), SEC EDGAR XBRL API
- **Caching**: Multi-layer (in-memory + disk), background worker process
- **Scraping**: Cheerio (transcript extraction from Motley Fool, Yahoo Finance, Investing.com)
- **Deployment**: Vercel-compatible (serverless functions + static frontend)

---

## License

MIT License

---
