import { getCompanyFinancials } from "../../_lib/sec";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { ticker } = req.query;
  const financials = await getCompanyFinancials(String(ticker).toUpperCase(), 8);

  if (!financials) {
    res.status(404).json({ error: `Company ${ticker} not found` });
    return;
  }

  const quarters = financials.quarters.map((q) => ({
    quarter: `${q.fiscal_period} ${q.fiscal_year}`,
    end_date: q.end_date,
    filed: q.filed
  }));

  res.status(200).json({
    ticker: String(ticker).toUpperCase(),
    quarters,
    total: quarters.length
  });
}
