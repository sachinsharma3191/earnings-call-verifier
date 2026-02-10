import { getCompanyFinancials } from "../_lib/sec";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { ticker } = req.query;
  const quarters = req.query?.quarters ? Number(req.query.quarters) : 4;

  const financials = await getCompanyFinancials(String(ticker).toUpperCase(), quarters);

  if (!financials) {
    res.status(404).json({ error: `Company ${ticker} not found or data unavailable` });
    return;
  }

  res.status(200).json(financials);
}
