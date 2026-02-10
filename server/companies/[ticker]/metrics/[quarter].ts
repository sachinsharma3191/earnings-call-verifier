import { getCompanyFinancials, calculateMetrics } from "../../../_lib/sec";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { ticker, quarter } = req.query;

  const financials = await getCompanyFinancials(String(ticker).toUpperCase(), 8);
  if (!financials) {
    res.status(404).json({ error: `Company ${ticker} not found` });
    return;
  }

  const decodedQuarter = decodeURIComponent(String(quarter));

  const target = financials.quarters.find((q) => `${q.fiscal_period} ${q.fiscal_year}` === decodedQuarter);

  if (!target) {
    res.status(404).json({ error: `Quarter ${decodedQuarter} not found` });
    return;
  }

  const metrics = calculateMetrics(target);

  res.status(200).json({
    ticker: String(ticker).toUpperCase(),
    quarter: decodedQuarter,
    raw_data: target,
    calculated_metrics: metrics
  });
}
