import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function parseArgs(argv) {
  const args = {
    baseUrl: "http://localhost:3001",
    quarters: 4,
    tickers: ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "JPM", "JNJ", "WMT"]
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--baseUrl" && argv[i + 1]) {
      args.baseUrl = argv[i + 1];
      i++;
    } else if (a === "--quarters" && argv[i + 1]) {
      args.quarters = Number(argv[i + 1]);
      i++;
    } else if (a === "--tickers" && argv[i + 1]) {
      args.tickers = argv[i + 1].split(",").map((t) => t.trim().toUpperCase()).filter(Boolean);
      i++;
    }
  }

  return args;
}

async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

function safeNum(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : null;
}

function pctChange(current, prev) {
  const c = safeNum(current);
  const p = safeNum(prev);
  if (c === null || p === null || p === 0) return null;
  return ((c - p) / p) * 100;
}

function pointChange(current, prev) {
  const c = safeNum(current);
  const p = safeNum(prev);
  if (c === null || p === null) return null;
  return c - p;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error ? String(data.error) : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

async function main() {
  const args = parseArgs(process.argv);

  const outPath = path.join(ROOT, "results", "sec_10x4.json");
  await ensureDir(outPath);

  const results = [];

  for (const ticker of args.tickers) {
    process.stdout.write(`Fetching ${ticker}...\n`);

    // Raw quarters
    const company = await fetchJson(`${args.baseUrl}/api/companies/${ticker}?quarters=${args.quarters}`);
    const quarters = company?.quarters ?? [];

    // Build per-quarter metrics by calling metrics endpoint for each quarter label
    const quartersWithMetrics = [];
    for (const q of quarters) {
      const quarterLabel = `${q.fiscal_period} ${q.fiscal_year}`;
      const encoded = encodeURIComponent(quarterLabel);
      const metricsResp = await fetchJson(`${args.baseUrl}/api/companies/${ticker}/metrics/${encoded}`);
      quartersWithMetrics.push({
        quarter: quarterLabel,
        end_date: q.end_date,
        filed: q.filed,
        form: q.form,
        raw: metricsResp?.raw_data ?? q,
        metrics: metricsResp?.calculated_metrics ?? {}
      });
    }

    // Sort quarters newest -> oldest (already is, but be safe)
    quartersWithMetrics.sort((a, b) => (a.end_date < b.end_date ? 1 : -1));

    // Compute QoQ changes (compare each quarter to next older quarter)
    const enriched = quartersWithMetrics.map((cur, idx) => {
      const prev = quartersWithMetrics[idx + 1];
      const m = cur.metrics;
      const pm = prev?.metrics ?? null;

      const qoq = pm
        ? {
            revenue_qoq_pct: pctChange(m.revenue_billions, pm.revenue_billions),
            net_income_qoq_pct: pctChange(m.net_income_billions, pm.net_income_billions),
            gross_margin_qoq_points: pointChange(m.gross_margin_pct, pm.gross_margin_pct),
            operating_margin_qoq_points: pointChange(m.operating_margin_pct, pm.operating_margin_pct),
            net_margin_qoq_points: pointChange(m.net_margin_pct, pm.net_margin_pct)
          }
        : null;

      return {
        ...cur,
        qoq
      };
    });

    results.push({
      ticker,
      company_name: company?.company_name,
      cik: company?.cik,
      data_source: company?.data_source,
      last_updated: company?.last_updated,
      quarters: enriched
    });
  }

  const payload = {
    generated_at: new Date().toISOString(),
    baseUrl: args.baseUrl,
    tickers: args.tickers,
    quarters: args.quarters,
    companies: results
  };

  await writeFile(outPath, JSON.stringify(payload, null, 2), "utf-8");
  process.stdout.write(`\nWrote: ${path.relative(ROOT, outPath)}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
