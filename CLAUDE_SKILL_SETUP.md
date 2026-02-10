# Claude Skill Setup for Claim Extraction

## Step 1: Register the Skill

1. Go to Claude.ai
2. Navigate to Skills
3. Click "Create Skill"
4. Use your deployed OpenAPI endpoint:
   ```
   https://your-vercel-url.vercel.app/api/openapi
   ```

## Step 2: Extraction Prompt Template

Use this prompt with Claude after registering the skill:

```
I have an earnings call transcript. Please extract all quantitative financial claims made by executives.

For each claim, extract:
- speaker: Executive name
- role: Their title (CEO, CFO, etc.)
- text: The exact quote containing the claim
- metric: What metric they're discussing (Revenue, Net Income, Gross Margin, etc.)
- claimed: The numeric value they stated
- unit: The unit (billion, million, percent, etc.)

Return as a JSON array. Example:

[
  {
    "speaker": "Tim Cook",
    "role": "CEO",
    "text": "Our Q4 revenue came in at $95.3 billion, representing growth of 6% year over year",
    "metric": "Revenue",
    "claimed": 95.3,
    "unit": "billion"
  },
  {
    "speaker": "Luca Maestri",
    "role": "CFO",
    "text": "Operating income came in at $31.5 billion",
    "metric": "Operating Income",
    "claimed": 31.5,
    "unit": "billion"
  }
]

Focus on:
- Revenue figures
- Income metrics (Net Income, Operating Income, Gross Profit)
- Margin percentages (Gross Margin, Operating Margin, Net Margin)
- Growth rates
- Segment-specific metrics

Ignore:
- Forward-looking statements
- Non-quantitative claims
- Qualitative descriptions

Here is the transcript:

[PASTE TRANSCRIPT HERE]
```

## Step 3: Save Extracted Claims

After Claude extracts the claims:

1. Copy the JSON array output
2. Save to the appropriate path from `transcript_manifest.json`
3. Example: `claims/AAPL/Q4_2024.claims.json`

## Step 4: Run Batch Verification

```bash
# Make sure your local server is running
npx vercel dev

# In another terminal, run verification
node scripts/batch-verify.mjs --baseUrl http://localhost:3000
```

## Alternative: Manual Verification via UI

1. Go to your deployed app
2. Switch to "Live" mode
3. Navigate to "Claims Explorer"
4. Select company and quarter
5. Paste the extracted claims JSON
6. Click "Verify Claims"
7. View results with executive analysis

## Expected Output

The verification will produce:
- Individual claim verification (accurate/discrepant/unverifiable)
- Overall accuracy score
- Executive-specific accuracy breakdown
- Discrepancy details with severity levels
- Results saved to `results/{ticker}/{quarter}.verified.json`

## Metrics Supported

The system can verify these metrics against SEC filings:
- **Revenue** (total revenue)
- **Net Income** (bottom line)
- **Operating Income** (EBIT)
- **Gross Profit** (revenue - COGS)
- **Gross Margin** (gross profit / revenue %)
- **Operating Margin** (operating income / revenue %)
- **Net Margin** (net income / revenue %)

## Tolerance Thresholds

- **Dollar amounts**: ±5% tolerance
- **Percentages**: ±2 percentage points tolerance

Claims within tolerance are marked "accurate", outside are "discrepant".
