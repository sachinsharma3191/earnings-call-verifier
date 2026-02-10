import { getAvailableTickers, COMPANY_CIKS } from "../_lib/sec";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const tickers = getAvailableTickers();
  const companies = tickers.map((ticker) => ({
    ticker,
    cik: COMPANY_CIKS[ticker]
  }));

  res.status(200).json({
    companies,
    total: companies.length
  });
}
