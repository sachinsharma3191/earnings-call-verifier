# Running as a Claude Artifact

## What is a Claude Artifact?

A **Claude Artifact** is an interactive React application that runs directly inside Claude.ai. No installation, no deployment, no API keys required.

**Live Demo:** [https://claude.ai/public/artifacts/9fd3ad3b-1ae1-4ebe-b944-dca89c5ae66c](https://claude.ai/public/artifacts/9fd3ad3b-1ae1-4ebe-b944-dca89c5ae66c)

---

## How to Run

### Option 1: Use the Existing Artifact (Recommended)

Simply open the link above in your browser. You'll need a free Claude.ai account to interact with it.

### Option 2: Create Your Own Copy

1. Go to [claude.ai](https://claude.ai) and start a new conversation
2. Copy and paste this prompt:

```
Create a React artifact for an Earnings Call Claim Verifier with:

1. Dashboard showing 10 S&P 500 companies (AAPL, NVDA, MSFT, GOOGL, AMZN, META, TSLA, JPM, JNJ, WMT)
2. Quarterly financial data (Q1-Q4 2025) from SEC EDGAR
3. Company detail views with QoQ comparisons
4. Claims Explorer with AI-powered verification
5. Modern dark theme UI with Tailwind CSS and Lucide icons

Include embedded sample data for all companies and quarters.
```

3. Claude will generate the complete application instantly

---

## Features

- **Dashboard** — 10 companies with quarterly metrics
- **Company Details** — Revenue, net income, margins, QoQ trends
- **Claims Explorer** — AI-powered claim extraction and verification
- **SEC Data** — Pre-loaded XBRL data from official filings

---

## Sharing

Click the **Share** button in Claude.ai to get a link. Anyone with a free Claude.ai account can access it.

---

## Alternative: Self-Hosted Version

For production use with live API integration, see the main [README.md](./README.md) for deployment instructions.
