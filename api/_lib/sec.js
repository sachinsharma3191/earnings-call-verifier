const BASE_URL = "https://data.sec.gov/api/xbrl/companyfacts";

export const COMPANY_CIKS = {
  AAPL: "0000320193",
  MSFT: "0000789019",
  NVDA: "0001045810",
  GOOGL: "0001652044",
  AMZN: "0001018724",
  META: "0001326801",
  TSLA: "0001318605",
  JPM: "0000019617",
  JNJ: "0000200406",
  WMT: "0000104169",
  KO: "0000021344"
};

export async function getCompanyFacts(ticker) {
  const cik = COMPANY_CIKS[ticker.toUpperCase()];
  if (!cik) return null;

  const url = `${BASE_URL}/CIK${cik}.json`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "EarningsVerifier/1.0 (educational-project@example.com)",
        "Accept-Encoding": "gzip, deflate",
        Host: "data.sec.gov"
      }
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function extractQuarterlyData(factsData, quarters = 4) {
  if (!factsData) return [];

  const quarterlyFound = {};

  try {
    const usGaap = factsData?.facts?.["us-gaap"] ?? {};

    const metrics = {
      Revenues: "Revenues",
      RevenueFromContractWithCustomerExcludingAssessedTax: "Revenues",
      NetIncomeLoss: "NetIncome",
      GrossProfit: "GrossProfit",
      OperatingIncomeLoss: "OperatingIncome",
      CostOfRevenue: "CostOfRevenue",
      OperatingExpenses: "OperatingExpenses",
      EarningsPerShareDiluted: "EPS"
    };

    for (const [secMetric, ourMetric] of Object.entries(metrics)) {
      if (!usGaap[secMetric]) continue;
      const units = usGaap[secMetric]?.units ?? {};
      const values = units["USD"] ?? units["USD/shares"] ?? [];

      for (const item of values) {
        if (item?.form !== "10-Q") continue;
        const end = item?.end;
        if (!end) continue;

        if (!quarterlyFound[end]) {
          quarterlyFound[end] = {
            end_date: end,
            fiscal_year: item?.fy,
            fiscal_period: item?.fp ?? "Q0",
            filed: item?.filed,
            form: "10-Q"
          };
        }

        quarterlyFound[end][ourMetric] = item?.val;
      }
    }

    return Object.entries(quarterlyFound)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, quarters)
      .map(([, v]) => v);
  } catch {
    return [];
  }
}

export async function getCompanyFinancials(ticker, quarters = 4) {
  const facts = await getCompanyFacts(ticker);
  if (!facts) return null;

  const qData = extractQuarterlyData(facts, quarters);

  const entityName = facts?.entityName ?? ticker.toUpperCase();
  const cik = String(facts?.cik ?? "").padStart(10, "0");
  const today = new Date().toISOString().slice(0, 10);

  return {
    ticker: ticker.toUpperCase(),
    company_name: entityName,
    cik,
    quarters: qData,
    data_source: "SEC EDGAR",
    last_updated: today
  };
}

export function calculateMetrics(quarterData) {
  const revenue = quarterData?.Revenues ?? 0;
  const netIncome = quarterData?.NetIncome ?? 0;
  const grossProfit = quarterData?.GrossProfit ?? 0;
  const operatingIncome = quarterData?.OperatingIncome ?? 0;

  const metrics = {};

  if (revenue && grossProfit) metrics.gross_margin_pct = (grossProfit / revenue) * 100;
  if (revenue && operatingIncome) metrics.operating_margin_pct = (operatingIncome / revenue) * 100;
  if (revenue && netIncome) metrics.net_margin_pct = (netIncome / revenue) * 100;

  metrics.revenue_billions = revenue ? revenue / 1_000_000_000 : 0;
  metrics.net_income_billions = netIncome ? netIncome / 1_000_000_000 : 0;
  metrics.gross_profit_billions = grossProfit ? grossProfit / 1_000_000_000 : 0;
  metrics.operating_income_billions = operatingIncome ? operatingIncome / 1_000_000_000 : 0;

  return metrics;
}

export function getAvailableTickers() {
  return Object.keys(COMPANY_CIKS);
}
