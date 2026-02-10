# Claude Skill Usage (LLM Extraction via Claude Credits)

This project is designed so that **Claude** does the LLM-heavy work (claim extraction + narrative analysis) using **Claude credits**, while the deployed app provides deterministic verification against SEC EDGAR data.

## What gets deployed

A single Vercel deployment serves:

- **UI**: Vite/React app from `ui/` (served from `ui/dist`)
- **API**: Vercel serverless functions under `/api/*`

## Key idea

- The **website** does **not** call Anthropic.
- Instead, you configure a **Claude Skill** that points to your deployed Vercel API.
- Claude extracts claims from transcripts, then calls your API to verify.

## Deployed endpoints (Vercel)

- `GET /api/health`
- `GET /api/companies`
- `GET /api/companies/{ticker}?quarters=4`
- `GET /api/companies/{ticker}/quarters`
- `GET /api/companies/{ticker}/metrics/{quarter}`
- `POST /api/verification/verify`
- `GET /api/openapi` (YAML OpenAPI spec)

## Step 1: Deploy to Vercel

1. Push to GitHub
2. Import the repo into Vercel
3. Deploy

After deploy, note your Vercel domain, e.g.:

- `https://earnings-call-verifier.vercel.app`

## Step 2: Configure the Claude Skill

1. In Claude, create a new Skill / Tool based on an OpenAPI spec.
2. Use the OpenAPI URL:

- `https://YOUR_VERCEL_DOMAIN/api/openapi`

3. Save/enable the Skill.

> Note: The OpenAPI spec contains a placeholder `servers:` URL. Claude usually uses the tool’s configured base URL. If your Claude UI requires the server URL inside the spec to match, replace `https://YOUR_VERCEL_DOMAIN` in the spec with your real Vercel URL.

## Claim JSON schema (what Claude should output)

Claude should produce an array of claim objects like:

```json
[
  {
    "id": "NVDA_Q4_2024_001",
    "speaker": "Jensen Huang",
    "role": "CEO",
    "text": "Q4 revenue came in at $29.1 billion",
    "metric": "Revenue",
    "claimed": 29.1,
    "unit": "billion",
    "context": "...optional surrounding quote/context..."
  }
]
```

Required fields for verification:

- `metric`
- `claimed` (number)
- `unit` (`billion` or `percent`)

Recommended fields:

- `text`, `speaker`, `role`, `context`

## Step 3: How to use it in Claude (example prompt)

Paste an earnings call transcript into Claude and ask:

- Extract all **quantitative claims** (revenue, net income, margins, YoY growth, etc.)
- Convert them to structured JSON claims
- Verify each claim using the Skill endpoint `POST /api/verification/verify`

### Example prompt

```text
You have access to the Earnings Call Verifier tool.

Company: NVDA
Quarter: Q4 2024

Task:
1) Extract quantitative claims from the transcript below.
2) Convert them into an array of JSON claims with fields: metric, claimed, unit, text, speaker, role, context.
3) Call POST /api/verification/verify with { ticker, quarter, claims }.
4) Return:
   - a markdown table of: claim text, claimed value, actual value, discrepancy, severity
   - plus a short bullet list explaining any misleading framing (optimistic bias / cherry-picking / percent vs absolute framing).

Transcript:
<PASTE TRANSCRIPT>
```

## Step 4: Visualize results in the UI

- Open the deployed website.
- Paste the **structured claims JSON** returned by Claude (or the verification response) into your UI workflow (depending on the page flow you use).

## Notes / Constraints

- SEC endpoints are rate limited.
- Vercel functions have execution time limits; SEC fetch should be kept efficient.
- This design intentionally avoids calling Anthropic from the backend so LLM usage is covered by Claude credits.
