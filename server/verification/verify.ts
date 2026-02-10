import { getCompanyFinancials, calculateMetrics } from "../_lib/sec";
import { findQuarterData, verifySingleClaim, calculateSummary, type Claim } from "../_lib/verify";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const data = req.body ?? {};
  const claims: Claim[] = data.claims ?? [];
  const ticker: string | undefined = data.ticker;
  const quarter: string | undefined = data.quarter;

  if (!claims?.length || !ticker || !quarter) {
    res.status(400).json({ error: "Missing required fields: claims, ticker, quarter" });
    return;
  }

  const financials = await getCompanyFinancials(ticker.toUpperCase(), 4);
  if (!financials) {
    res.status(404).json({
      error: "Unable to fetch SEC data",
      ticker,
      quarter
    });
    return;
  }

  const qData = findQuarterData(financials.quarters, quarter);
  if (!qData) {
    res.status(404).json({
      error: `Quarter ${quarter} not found in SEC data`,
      ticker,
      quarter,
      available_quarters: financials.quarters.map((q) => q.fiscal_period ?? "Unknown")
    });
    return;
  }

  const metrics = calculateMetrics(qData);
  const verifiedClaims = claims.map((c) => verifySingleClaim(c, metrics));
  const summary = calculateSummary(verifiedClaims);

  res.status(200).json({
    ticker: ticker.toUpperCase(),
    quarter,
    company_name: financials.company_name,
    total_claims: verifiedClaims.length,
    summary,
    claims: verifiedClaims,
    sec_data: {
      end_date: qData.end_date,
      filed: qData.filed,
      form: qData.form
    }
  });
}
