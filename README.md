# Earnings Call Claim Verifier

> **Verifies executive claims from earnings calls against official SEC EDGAR filings**

### Two UI Versions

| Version | Link | Description |
|---------|------|-------------|
| **Claude Artifact** (Lite) | [https://claude.ai/public/artifacts/9fd3ad3b-1ae1-4ebe-b944-dca89c5ae66c](https://claude.ai/public/artifacts/9fd3ad3b-1ae1-4ebe-b944-dca89c5ae66c) · [📖 Guide](./CLAUDE_ARTIFACT.md) | Self-contained single-file React app built by Claude. Runs entirely in-browser with embedded SEC data. See the guide for sharing, publishing, and access info. |
| **Full App** (Detailed) | [earnings-call-verifier.vercel.app](https://earnings-call-verifier.vercel.app) | Production deployment with live SEC EDGAR XBRL integration, background cache worker, transcript scraping, real-time claim verification API, and full dashboard. |

**Video Walkthrough**: [Loom link]

**Stack**: React + Vite frontend, Fastify API (Node.js), SEC EDGAR XBRL integration, multi-layer caching  
**Coverage**: 10 companies × 4 quarters = 40 data points

---

## What This Does

Executives make quantitative claims on earnings calls. Some are accurate, some have discrepancies, and some are technically true but framed in ways that create false impressions. This system:

1. **Acquires** structured financial data from SEC EDGAR's XBRL API and earnings call transcripts from Motley Fool / company IR pages
2. **Extracts** quantitative claims (dollar amounts, percentages, growth rates) from transcript text
3. **Verifies** each claim against the corresponding SEC XBRL value — mathematically, with no LLM in the verification step
4. **Classifies** claims as accurate, minor discrepancy, major discrepancy, misleading, or unverifiable
5. **Flags** quarter-over-quarter anomalies across all companies for cross-comparison

---

## Quick Start

```bash
npm install
npm run api          # Fastify server on :3000
npm run dev          # Vite UI on :5173 (proxies /api → :3000)
npm run worker       # Pre-fetch SEC data + transcripts into .cache/
```

Open [http://localhost:5173](http://localhost:5173)

---

## Data Acquisition Strategy

### Source of Truth: SEC EDGAR XBRL API

All financial data comes from `data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json`. This is the official, structured, machine-readable source — not scraped from third-party aggregators.

The API returns every XBRL fact a company has ever filed, organized by taxonomy concept and time period. For each metric, I try multiple XBRL concept names to handle variation across companies and filing years:

| Metric | Primary XBRL Concept | Fallbacks |
|--------|----------------------|-----------|
| Revenue | `RevenueFromContractWithCustomerExcludingAssessedTax` | `Revenues`, `SalesRevenueNet` |
| Net Income | `NetIncomeLoss` | `ProfitLoss` |
| Gross Profit | `GrossProfit` | — |
| Operating Income | `OperatingIncomeLoss` | — |
| EPS (Diluted) | `EarningsPerShareDiluted` | `EarningsPerShareBasic` |
| Cost of Revenue | `CostOfGoodsAndServicesSold` | `CostOfRevenue`, `CostOfGoodsSold` |
| Operating Expenses | `OperatingExpenses` | `OperatingCostsAndExpenses`, `CostsAndExpenses` |

**Filtering**: From each concept's `units.USD` array, I filter by form type (10-Q/10-K), match the `end` date to the target quarter, prefer entries with `frame` matching `CY2025Q1`–`CY2025Q4`, and select entries with ~91-day duration to avoid YTD cumulative values.

### Transcripts: Motley Fool + Fallbacks

Primary source is Motley Fool (`fool.com/earnings/call-transcripts/`), scraped with Cheerio. Transcripts are split into speaker segments using the `"Speaker Name -- Title"` pattern.

Fallback chain:
1. Company IR pages (many post full transcripts)
2. Yahoo Finance / Investing.com
3. 10-K/10-Q MD&A section as proxy — clearly labeled in the data source attribution

### Caching Architecture

A background worker (`api/worker.js`) pre-fetches all SEC data and transcripts into `.cache/`. The Fastify server reads from an in-memory + disk-backed cache. **Zero external API calls during request handling** — every endpoint reads from cache.

The cache refreshes every 30 minutes when running in watch mode. On cold start, the server loads from disk cache immediately and spawns the worker to refresh in the background.

---

## What "Misleading" Means to This System

This is the most important design decision. "Misleading" is **not** the same as "inaccurate." A misleading claim may be entirely defensible numerically but uses framing that creates a false impression.

The system checks for five specific, programmatically detectable patterns:

### 1. Cherry-Picked Baseline
**What it is**: Comparing to an anomalously weak period instead of the standard YoY or QoQ baseline.

**Example**: "Revenue grew 40% compared to Q2 2024" — but Q2 2024 was an outlier low. Using standard YoY comparison, growth was 12%.

**Detection**: Compute growth using the standard baseline (same quarter prior year, or immediately prior quarter). If the claimed growth rate is >10 percentage points higher than the standard comparison, flag as cherry-picked.

### 2. Non-GAAP Without Clear Disclosure
**What it is**: Citing "adjusted" or "core" metrics without explicitly labeling them as non-GAAP, when the GAAP figure is materially lower.

**Example**: "EPS was $3.50" — but GAAP EPS from the 10-Q was $2.10. The executive is citing adjusted EPS without saying so.

**Detection**: If the claimed value exceeds the SEC XBRL (GAAP) value by >10% and the claim text doesn't contain "adjusted", "non-GAAP", "core", or "excluding", flag as misleading.

### 3. Metric Conflation
**What it is**: Using a broader or narrower definition of a metric than what's in the structured filing.

**Example**: "Revenue reached $95 billion" — but XBRL has `Revenues` at $95B and `RevenueFromContractWithCustomerExcludingAssessedTax` at $90B. They cited the higher figure.

**Detection**: When multiple XBRL concepts match a metric and the spread between them is >5%, check which value the claim is closest to. If it's the most favorable one, flag it.

### 4. Selective Highlighting
**What it is**: Emphasizing the one metric that improved while others declined significantly.

**Example**: "Revenue grew 5% this quarter" — but net income dropped 20% and operating margin contracted 300bp. The call spent 80% of prepared remarks on the revenue growth.

**Detection**: When a claim highlights positive movement in one metric, cross-check whether other key metrics (net income, operating income, margins) moved materially in the opposite direction during the same period.

### 5. Rounding Manipulation
**What it is**: Rounding to a convenient number that overstates performance.

**Example**: "Revenue was approximately $95 billion" — actual SEC value is $94.2 billion. Rounding up by $800M.

**Detection**: If the claimed value is a round number (divisible by $1B or $100M) and exceeds the actual value by >1%, flag as rounding manipulation — especially if the claim doesn't use hedging language like "approximately" or "roughly."

### Why This Matters
Each pattern is detected with specific rules, not LLM judgment. The verification is deterministic and reproducible — given the same claim and SEC data, the classification will always be the same. This is a deliberate choice: the extraction step uses AI (it's good at understanding natural language), but the verification step is pure math.

---

## Edge Cases Handled

| Edge Case | Problem | Solution |
|-----------|---------|----------|
| **YTD vs. Quarterly** | Some 10-Q filings report cumulative year-to-date figures, not standalone quarterly | Detect entries with duration >100 days; subtract prior quarter's cumulative value to isolate the standalone quarter |
| **Fiscal year ≠ Calendar year** | Apple's fiscal Q1 ends in December (calendar Q4) | Quarter mapping accounts for each company's fiscal calendar; dates are matched by `end` field, not quarter label |
| **Banks lack Gross Profit** | JPMorgan's chart of accounts doesn't include `GrossProfit` in XBRL | Missing metrics are marked as unavailable (not failed); claims referencing those metrics are classified as `unverifiable` |
| **XBRL tag variation** | Companies use different concept names for the same metric (e.g., `Revenues` vs `RevenueFromContractWithCustomerExcludingAssessedTax`) | Multiple fallback tags per metric, tried in priority order |
| **Non-GAAP claims** | Executives cite "adjusted" numbers; SEC XBRL only contains GAAP | Flag when claimed value exceeds GAAP by >10% and claim lacks "adjusted"/"non-GAAP" qualifier |
| **Missing transcripts** | Motley Fool doesn't cover every company-quarter | Fallback to Yahoo Finance, Investing.com, or 10-K MD&A as proxy; source is explicitly labeled |
| **Rounding ambiguity** | "$95 billion" could mean $94.7B or $95.3B | Use ±2% tolerance for absolute claims; flag only when rounding consistently favors the company |
| **Growth claim ambiguity** | "Grew 15%" — compared to what? | Default to YoY for annual context, QoQ for sequential context; flag when the comparison base is unclear or non-standard |

---

## Key Decisions

### 1. SEC EDGAR XBRL as sole source of truth
I considered third-party APIs (Financial Modeling Prep, Alpha Vantage, Polygon) but chose SEC EDGAR directly because it's the authoritative source that companies actually file to. Third-party data is derived from EDGAR anyway and introduces a potential mismatch layer.

### 2. Two-pass claim extraction (regex + LLM)
Pure regex misses claims with complex phrasing ("our top line came in just north of ninety-five billion"). Pure LLM extraction is expensive and slow for 40 transcripts. The hybrid approach pre-filters with regex patterns for dollar amounts/percentages, then uses Claude to structure the filtered sentences into verifiable objects.

### 3. Deterministic verification — no LLM
The verification logic is a pure function: `(claimed_value, sec_actual_value) → classification`. This was intentional. LLM-based verification would be harder to debug, non-reproducible, and impossible to explain to an auditor. The tradeoff is that edge cases like non-standard comparisons may be classified as `unverifiable` rather than getting a nuanced LLM judgment.

### 4. "Misleading" as a first-class category
Most fact-checkers use a binary accurate/inaccurate scale. Adding "misleading" as a distinct category required building the five-pattern framework described above. The tradeoff is complexity — each pattern needs its own detection logic — but it captures the most interesting class of executive behavior.

### 5. Pre-built cache over live API calls
The cache worker pre-fetches everything at startup. This means the API never blocks on SEC EDGAR or transcript scraping during user requests. The tradeoff is data staleness — if a company files a restatement, the cache won't reflect it until the next refresh cycle.

### 6. Claude Artifact as deployment option
Deploying as a Claude Artifact provides free LLM inference for the extraction step. Evaluators can interact with the full system without any API keys or infrastructure costs. The tradeoff is that the artifact version uses pre-embedded SEC data rather than live API calls (browser CORS restrictions prevent direct SEC EDGAR access).

---

## Companies Covered

| Ticker | Company | Sector | Q1 | Q2 | Q3 | Q4 | Transcript Source |
|--------|---------|--------|----|----|----|----|-------------------|
| AAPL | Apple Inc. | Technology | ✓ | ✓ | ✓ | ✓ | Motley Fool |
| NVDA | NVIDIA Corporation | Semiconductors | ✓ | ✓ | ✓ | ✓ | Motley Fool |
| MSFT | Microsoft Corporation | Technology | ✓ | ✓ | ✓ | ✓ | Motley Fool |
| GOOGL | Alphabet Inc. | Technology | ✓ | ✓ | ✓ | ✓ | Motley Fool |
| AMZN | Amazon.com Inc. | E-Commerce | ✓ | ✓ | ✓ | ✓ | Motley Fool |
| META | Meta Platforms Inc. | Social Media | ✓ | ✓ | ✓ | ✓ | Motley Fool |
| TSLA | Tesla Inc. | Automotive | ✓ | ✓ | ✓ | ✓ | Motley Fool |
| JPM | JPMorgan Chase & Co. | Banking | ✓ | ✓ | ✓ | ✓ | Motley Fool |
| JNJ | Johnson & Johnson | Healthcare | ✓ | ✓ | ✓ | ✓ | Motley Fool |
| WMT | Walmart Inc. | Retail | ✓ | ✓ | ✓ | ✓ | Motley Fool |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  React Frontend (Vite)                     │
│  Dashboard · Company Detail · Claims Explorer · About     │
└──────────────────┬───────────────────────────────────────┘
                   │  /api/*
                   ▼
┌──────────────────────────────────────────────────────────┐
│              Fastify API Server (Node.js)                  │
│  Routes: companies, verification, discrepancies, health   │
│  Services: SECDataService, TranscriptService              │
│  Cache: AggregateCache + FileCache + ClaimsCache (disk)    │
└──────────────────┬───────────────────────────────────────┘
                   │  Background Worker (child process)
                   │  Fetches SEC XBRL + scrapes transcripts
                   │  Writes to .cache/ (30-min refresh)
                   ▼
┌──────────────────────────────────────────────────────────┐
│                   External Sources                         │
│  SEC EDGAR XBRL API (data.sec.gov) · Motley Fool         │
│  Company IR pages · Yahoo Finance                         │
└──────────────────────────────────────────────────────────┘
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server status + cache info |
| `GET` | `/api/companies` | All companies with latest data |
| `GET` | `/api/companies/{ticker}` | Company detail + quarters |
| `GET` | `/api/companies/{ticker}/quarters` | Available quarters |
| `GET` | `/api/companies/{ticker}/metrics/{quarter}` | SEC metrics for quarter |
| `GET` | `/api/discrepancies/top?limit=5` | Top N QoQ discrepancies |
| `POST` | `/api/verification/verify` | Verify claims JSON against SEC data |
| `POST` | `/api/claims/store` | Store verified claims to persistent cache |
| `POST` | `/api/claims/search` | Search stored claims (filters: ticker, quarter, metric, status, severity, speaker, text) |
| `GET` | `/api/transcripts/sources` | Full transcript manifest |
| `GET` | `/api/transcripts/sources/{ticker}` | Company transcript sources |
| `GET` | `/api/openapi` | OpenAPI spec for Claude Skill |

---

## End-to-End Workflow

### 1. Extract Claims
Register the Claude Skill using `/api/openapi`, or use the Claude Artifact version. Paste an earnings call transcript — Claude extracts structured claims:

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
In **Claims Explorer → Verify tab**, select company and quarter, paste claims JSON, click Verify. The API cross-references each claim against SEC EDGAR XBRL data and classifies the result.

### 3. Store & Search
Verified claims are automatically stored to the backend cache (`POST /api/claims/store`). Switch to the **Search tab**, select filters (company, quarter, status, text), and click **Search** to query all stored claims via `POST /api/claims/search`. The Dashboard shows top discrepancies across all 10 companies.

---

## Project Structure

```
earnings-call-verifier/
├── api/
│   └── [[...path]].js             # Single Vercel catch-all serverless function
├── bin/
│   ├── server.js                  # Local dev server (imports from ../lib/)
│   └── worker.js                  # Background cache worker
├── lib/
│   ├── fastifyApp.js              # Route definitions
│   ├── init.js                    # Synchronous cache bootstrap
│   ├── cache/
│   │   ├── AggregateCache.js      # In-memory + disk
│   │   ├── CacheRefresher.js      # Worker orchestrator
│   │   ├── ClaimsCache.js         # Persistent verified claims store
│   │   └── FileCache.js           # Per-company file cache
│   ├── constants/
│   │   ├── companies.js           # 10 company tickers/CIKs
│   │   └── quarters.js            # Quarter definitions + fallback data
│   ├── services/
│   │   ├── SECDataService.js      # SEC EDGAR XBRL extraction
│   │   ├── TranscriptService.js   # Transcript scraping
│   │   ├── DataAggregator.js      # Combines SEC + transcript data
│   │   ├── VerificationService.js # Claim verification logic
│   │   └── ClaimVerificationService.js
│   └── controllers/
├── ui/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CompanyDetail.jsx
│   │   │   ├── ClaimExplorer.jsx
│   │   │   └── About.jsx
│   │   ├── data/companyMeta.js    # Company metadata (sector, color, severity)
│   │   ├── context/CompaniesContext.jsx
│   │   └── utils/apiClient.js
├── scripts/                       # Debug & utility scripts
├── .cache/                        # Pre-built data (gitignored)
├── vercel.json
└── package.json
```

---

## What I'd Improve With More Time

- **Live transcript ingestion** — real-time scraping pipeline with change detection and deduplication
- **Historical claim tracking** — track whether specific executives consistently overstate certain metrics quarter after quarter (pattern = repeated offender)
- **Segment-level verification** — verify claims about specific business segments (e.g., "AWS revenue grew 19%"), not just consolidated figures
- **Non-GAAP reconciliation** — automatically parse the company's own non-GAAP adjustment tables from their filings to verify adjusted metrics
- **Confidence scoring** — weight verification confidence based on data source quality, metric complexity, and whether the XBRL match is primary or fallback

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React
- **Backend**: Fastify (Node.js), SEC EDGAR XBRL API
- **Caching**: Multi-layer (in-memory + disk), background worker process
- **Scraping**: Cheerio (Motley Fool, Yahoo Finance, Investing.com)
- **Deployment**: Vercel (serverless functions + static frontend)

---

## License

**All Rights Reserved** © 2025 Sachin Sharma

This source code is proprietary and confidential. No part of this codebase may be reproduced, distributed, modified, or used in any form without explicit written permission from the author.
