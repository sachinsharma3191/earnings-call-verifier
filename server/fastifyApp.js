import Fastify from "fastify";
import swagger from "@fastify/swagger";

import { fileCache } from "./cache/FileCache.js";
import { aggregateCache } from "./cache/AggregateCache.js";
import { cacheRefresher } from "./cache/CacheRefresher.js";
import { claimsCache } from "./cache/ClaimsCache.js";
import { TICKER_TO_CIK, COMPANIES_LIST } from "./constants/index.js";
import { verifySingleClaim, verifyYoYClaim, calculateSummary } from "./services/VerificationService.js";
import { extractClaimsFromTranscript } from "./services/ClaimExtractionService.js";

// Helper: get company data from aggregate cache first, then fileCache fallback
function getCachedCompany(ticker) {
  return aggregateCache.getCompany(ticker) || fileCache.get(ticker);
}

let appPromise = null;

export function getFastifyApp() {
  if (!appPromise) {
    appPromise = buildApp();
  }
  return appPromise;
}

// Helper: extract metrics from cached quarter financials for verification
function extractMetrics(financials) {
  if (!financials) return null;
  return {
    revenue_billions: financials.Revenues,
    net_income_billions: financials.NetIncome,
    gross_profit_billions: financials.GrossProfit,
    operating_income_billions: financials.OperatingIncome,
    eps: financials.EPS,
    gross_margin_pct: financials.Revenues > 0 ? (financials.GrossProfit / financials.Revenues) * 100 : null,
    operating_margin_pct: financials.Revenues > 0 ? (financials.OperatingIncome / financials.Revenues) * 100 : null,
    net_margin_pct: financials.Revenues > 0 ? (financials.NetIncome / financials.Revenues) * 100 : null
  };
}

async function buildApp() {
  const app = Fastify({ logger: false });

  await app.register(swagger, {
    mode: "dynamic",
    openapi: {
      info: {
        title: "Earnings Call Verifier API",
        version: "3.0.0",
        description: "Verify quantitative claims from earnings calls against SEC EDGAR financial data. All data is pre-aggregated and cached on startup for fast lookups."
      },
      tags: [
        { name: "health", description: "Health check endpoints" },
        { name: "companies", description: "Company financial data endpoints" },
        { name: "verification", description: "Claim verification endpoints" }
      ]
    }
  });

  // ─── GET /api/discrepancies/simulated/top ─── Simulated discrepancies (clearly labeled)
  app.get("/api/discrepancies/simulated/top", async (req, reply) => {
    const limit = Math.min(parseInt(req.query.limit) || 5, 20);

    // Executive speakers per company (realistic)
    const SPEAKERS = {
      AAPL: [{ name: 'Tim Cook', role: 'CEO' }, { name: 'Luca Maestri', role: 'CFO' }],
      NVDA: [{ name: 'Jensen Huang', role: 'CEO' }, { name: 'Colette Kress', role: 'CFO' }],
      MSFT: [{ name: 'Satya Nadella', role: 'CEO' }, { name: 'Amy Hood', role: 'CFO' }],
      GOOGL: [{ name: 'Sundar Pichai', role: 'CEO' }, { name: 'Ruth Porat', role: 'CFO' }],
      AMZN: [{ name: 'Andy Jassy', role: 'CEO' }, { name: 'Brian Olsavsky', role: 'CFO' }],
      META: [{ name: 'Mark Zuckerberg', role: 'CEO' }, { name: 'Susan Li', role: 'CFO' }],
      TSLA: [{ name: 'Elon Musk', role: 'CEO' }, { name: 'Vaibhav Taneja', role: 'CFO' }],
      JPM: [{ name: 'Jamie Dimon', role: 'CEO' }, { name: 'Jeremy Barnum', role: 'CFO' }],
      JNJ: [{ name: 'Joaquin Duato', role: 'CEO' }, { name: 'Joseph Wolk', role: 'CFO' }],
      WMT: [{ name: 'Doug McMillon', role: 'CEO' }, { name: 'John David Rainey', role: 'CFO' }],
    };

    const METRIC_DEFS = [
      { key: 'Revenues', label: 'Revenue', unit: 'billion', speakerIdx: 1 },
      { key: 'NetIncome', label: 'Net Income', unit: 'billion', speakerIdx: 1 },
      { key: 'GrossProfit', label: 'Gross Profit', unit: 'billion', speakerIdx: 1 },
      { key: 'OperatingIncome', label: 'Operating Income', unit: 'billion', speakerIdx: 1 },
      { key: 'EPS', label: 'Earnings Per Share', unit: 'dollar', speakerIdx: 1 },
    ];

    const allDiscrepancies = [];

    for (const company of COMPANIES_LIST) {
      const cached = getCachedCompany(company.ticker);
      if (!cached?.quarters?.length) continue;

      const q = cached.quarters[0]; // latest quarter
      const fin = q.financials;
      if (!fin) continue;

      const speakers = SPEAKERS[company.ticker] || [{ name: 'CEO', role: 'CEO' }, { name: 'CFO', role: 'CFO' }];

      for (const mdef of METRIC_DEFS) {
        const actual = fin[mdef.key];
        if (!actual || actual === 0) continue;

        // Simulate a "claimed" value: executives tend to round favorably (2-8% higher)
        // Use a deterministic seed based on ticker+metric for consistency
        const seed = (company.ticker.charCodeAt(0) * 7 + mdef.key.length * 13) % 100;
        const inflationPct = 1.5 + (seed % 70) / 10; // 1.5% to 8.5%
        const claimed = actual * (1 + inflationPct / 100);

        const pctDiff = Math.abs(((claimed - actual) / actual) * 100);
        const speaker = speakers[mdef.speakerIdx] || speakers[0];

        const fmtVal = (v) => {
          if (mdef.unit === 'billion') return `$${v.toFixed(2)}B`;
          if (mdef.unit === 'dollar') return `$${v.toFixed(2)}`;
          return `${v.toFixed(2)}%`;
        };

        allDiscrepancies.push({
          ticker: company.ticker,
          name: company.name,
          quarter: q.quarter,
          metric: mdef.label,
          speaker: speaker.name,
          role: speaker.role,
          claimed: fmtVal(claimed),
          actual: fmtVal(actual),
          claimedRaw: claimed,
          actualRaw: actual,
          pctDiff: Math.round(pctDiff * 100) / 100,
          severity: pctDiff > 5 ? 'high' : pctDiff > 2 ? 'moderate' : 'low',
          unit: mdef.unit,
          dataSource: q.dataSource
        });
      }
    }

    // Sort by pctDiff descending, take top N
    allDiscrepancies.sort((a, b) => b.pctDiff - a.pctDiff);
    const top = allDiscrepancies.slice(0, limit).map((d, i) => ({ rank: i + 1, ...d }));

    return { discrepancies: top, total: allDiscrepancies.length, limit, isSimulated: true };
  });

  // Backward-compat: keep old endpoint but label as simulated
  app.get("/api/discrepancies/top", async (req, reply) => {
    const res = await app.inject({ method: 'GET', url: `/api/discrepancies/simulated/top?limit=${req.query.limit || ''}` });
    reply.code(res.statusCode);
    try { return JSON.parse(res.payload); } catch (_) { return { error: 'failed' }; }
  });

  // ─── Health ───
  app.get("/api/health", async () => {
    return {
      status: "healthy",
      service: "earnings-verifier-api",
      version: "3.0.0",
      cache: cacheRefresher.getStatus()
    };
  });

  // ─── GET /api/companies ─── All companies from cache
  app.get("/api/companies", async (req, reply) => {
    const companiesWithData = COMPANIES_LIST.map(company => {
      const cached = getCachedCompany(company.ticker);
      if (cached) {
        return {
          ticker: cached.ticker || company.ticker,
          name: cached.name || company.name,
          cik: cached.cik || company.cik,
          quarters: cached.quarters || [],
          latestQuarter: cached.quarters?.[0]?.quarter || 'Q4 2025',
          coverage: cached.coverage || null,
          data_source: 'cache'
        };
      }
      return {
        ticker: company.ticker,
        name: company.name,
        cik: company.cik,
        quarters: [],
        latestQuarter: 'Q4 2025',
        coverage: null,
        data_source: 'not_cached'
      };
    });

    const cachedCount = companiesWithData.filter(c => c.data_source === 'cache').length;
    return {
      companies: companiesWithData,
      total: companiesWithData.length,
      cached: cachedCount
    };
  });

  // ─── GET /api/companies/:ticker ─── Single company from cache
  app.get("/api/companies/:ticker", async (req, reply) => {
    const ticker = req.params.ticker.toUpperCase();
    const cached = getCachedCompany(ticker);

    if (!cached) {
      reply.code(404);
      return { error: `Company ${ticker} not found or not cached` };
    }

    return cached;
  });

  // ─── GET /api/companies/:ticker/quarters ─── Quarters from cache (fast filter)
  app.get("/api/companies/:ticker/quarters", async (req, reply) => {
    const ticker = req.params.ticker.toUpperCase();
    const cached = getCachedCompany(ticker);

    if (!cached) {
      reply.code(404);
      return { error: `Company ${ticker} not found or not cached` };
    }

    return {
      ticker,
      quarters: cached.quarters || [],
      coverage: cached.coverage || null,
      source: 'aggregated_cache'
    };
  });

  // ─── GET /api/companies/:ticker/metrics/:quarter ─── Metrics for a specific quarter (fast filter)
  app.get("/api/companies/:ticker/metrics/:quarter", async (req, reply) => {
    const ticker = req.params.ticker.toUpperCase();
    const quarter = decodeURIComponent(req.params.quarter);
    const cached = getCachedCompany(ticker);

    if (!cached) {
      reply.code(404);
      return { error: `Company ${ticker} not found` };
    }

    const qData = cached.quarters?.find(q => q.quarter === quarter);
    if (!qData) {
      reply.code(404);
      return { error: `Quarter ${quarter} not found for ${ticker}` };
    }

    const metrics = extractMetrics(qData.financials);
    return {
      ticker,
      quarter,
      raw_data: qData.financials,
      calculated_metrics: metrics,
      dataSource: qData.dataSource,
      transcript: qData.transcript
    };
  });

  // ─── GET /api/transcripts/:ticker/:quarter ─── Return cached transcript text if available
  app.get("/api/transcripts/:ticker/:quarter", async (req, reply) => {
    const ticker = req.params.ticker.toUpperCase();
    const quarter = decodeURIComponent(req.params.quarter);
    const cached = getCachedCompany(ticker);

    if (!cached) {
      reply.code(404);
      return { error: `Company ${ticker} not found` };
    }

    const qData = cached.quarters?.find(q => q.quarter === quarter);
    if (!qData || !qData.transcript) {
      reply.code(404);
      return { error: `Transcript not found for ${ticker} ${quarter}` };
    }

    return {
      ticker,
      quarter,
      transcriptText: qData.transcript,
      source: 'cache'
    };
  });

  // ─── POST /api/claims/extract ─── Extract claims from transcript (regex+heuristics)
  app.post("/api/claims/extract", async (req, reply) => {
    try {
      const { ticker, quarter, transcriptText, transcript } = req.body || {};
      const text = transcriptText || transcript;
      if (!text || typeof text !== 'string') {
        reply.code(400);
        return { error: "transcriptText (string) is required" };
      }
      const claims = extractClaimsFromTranscript(text);
      return {
        ticker: ticker?.toUpperCase?.() || null,
        quarter: quarter || null,
        total_claims: claims.length,
        claims,
        meta: { method: 'regex+heuristics' }
      };
    } catch (err) {
      req.log.error(err);
      reply.code(500);
      return { error: "Extraction failed", details: err.message };
    }
  });

  // ─── POST /api/verification/verify ─── Verify claims against cached data (fast filter)
  // Supports both absolute claims (e.g. "Revenue was $95B") and YoY growth claims (e.g. "Revenue grew 15% YoY")
  // YoY claims must have type: "yoy_percent" or "yoy_growth"
  app.post("/api/verification/verify", async (req, reply) => {
    try {
      const { ticker, quarter, claims, transcriptText, transcript } = req.body;

      if (!ticker || !quarter) {
        reply.code(400);
        return { error: "Missing required fields: ticker, quarter" };
      }

      let useClaims = Array.isArray(claims) ? claims : [];
      // If no claims provided, but transcript provided, extract first
      const text = transcriptText || transcript;
      if ((!useClaims || useClaims.length === 0) && text && typeof text === 'string') {
        useClaims = extractClaimsFromTranscript(text);
      }
      if (!useClaims || useClaims.length === 0) {
        reply.code(400);
        return { error: "Provide claims[] or transcriptText to extract from" };
      }

      // Validate each claim has required fields
      for (let i = 0; i < useClaims.length; i++) {
        const c = useClaims[i];
        if (!c.metric || c.claimed == null) {
          reply.code(400);
          return { error: `Claim ${i} missing required fields: metric, claimed` };
        }
      }

      const upperTicker = ticker.toUpperCase();
      if (!TICKER_TO_CIK[upperTicker]) {
        reply.code(400);
        return { error: `Company ${ticker} not found` };
      }

      // Fast lookup: aggregate cache first, fileCache fallback
      const cached = getCachedCompany(upperTicker);
      if (!cached?.quarters) {
        reply.code(400);
        return { error: `No cached data for ${upperTicker}. Server may still be initializing.` };
      }

      const qData = cached.quarters.find(q => q.quarter === quarter);
      if (!qData?.financials) {
        reply.code(400);
        return { error: `No financial data for ${upperTicker} ${quarter}` };
      }

      const metrics = extractMetrics(qData.financials);

      // Find prior year quarter for YoY claims (e.g. "Q3 2025" → "Q3 2024")
      const qParts = quarter.split(' ');
      const priorYearQuarter = qParts.length === 2 ? `${qParts[0]} ${parseInt(qParts[1]) - 1}` : null;
      const priorQData = priorYearQuarter ? cached.quarters.find(q => q.quarter === priorYearQuarter) : null;
      const priorMetrics = priorQData?.financials ? extractMetrics(priorQData.financials) : null;

      const verifiedClaims = useClaims.map(claim => {
        const claimType = (claim.type ?? '').toLowerCase();
        if (claimType === 'yoy_percent' || claimType === 'yoy_growth') {
          return verifyYoYClaim(claim, metrics, priorMetrics);
        }
        return verifySingleClaim(claim, metrics);
      });

      const summary = calculateSummary(verifiedClaims);

      const resp = {
        ticker: upperTicker,
        quarter,
        total_claims: verifiedClaims.length,
        summary,
        claims: verifiedClaims,
        sec_data: {
          end_date: qData.endDate,
          filed: qData.filed,
          dataSource: qData.dataSource,
          prior_year_available: !!priorMetrics,
          prior_year_quarter: priorYearQuarter
        }
      };

      if (text) {
        resp.extraction = { total_claims: useClaims.length, method: 'regex+heuristics' };
      }
      return resp;
    } catch (error) {
      req.log.error('Verification error:', error);
      reply.code(400);
      return { error: "Verification failed", details: error.message };
    }
  });

  // ─── POST /api/analyze ─── Full analysis pipeline
  app.post("/api/analyze", async (req, reply) => {
    const { ticker, quarter, year } = req.body;

    if (!ticker || !quarter || !year) {
      reply.code(400);
      return { error: "Missing required fields: ticker, quarter, year" };
    }

    try {
      const { AnalysisPipeline } = await import("./services/AnalysisPipeline.js");
      const pipeline = new AnalysisPipeline();
      const result = await pipeline.runAnalysis(ticker.toUpperCase(), quarter, year);
      return result;
    } catch (error) {
      req.log.error(error);
      reply.code(400);
      return { error: "Analysis failed", details: error.message };
    }
  });

  // ─── POST /api/claims/store ─── Store verified claims in persistent cache
  app.post("/api/claims/store", async (req, reply) => {
    try {
      const { ticker, quarter, claims, summary } = req.body;

      if (!ticker || !quarter) {
        reply.code(400);
        return { error: "Missing required fields: ticker, quarter" };
      }
      if (!claims || !Array.isArray(claims) || claims.length === 0) {
        reply.code(400);
        return { error: "claims must be a non-empty array" };
      }

      const result = claimsCache.store(ticker.toUpperCase(), quarter, claims, summary);
      return { success: true, ...result, stats: claimsCache.getStats() };
    } catch (error) {
      req.log.error(error);
      reply.code(500);
      return { error: "Failed to store claims", details: error.message };
    }
  });

  // ─── POST /api/claims/search ─── Search stored claims with flexible filters
  // Body params: ticker, quarter, metric, status, severity, speaker, text, limit, offset
  app.post("/api/claims/search", async (req, reply) => {
    try {
      const { ticker, quarter, metric, status, severity, speaker, text, limit, offset } = req.body || {};
      const results = claimsCache.search({ ticker, quarter, metric, status, severity, speaker, text, limit, offset });
      return results;
    } catch (error) {
      req.log.error(error);
      reply.code(500);
      return { error: "Search failed", details: error.message };
    }
  });

  // ─── GET /api/openapi ─── OpenAPI spec
  app.get("/api/openapi", async (req, reply) => {
    const xfProto = req.headers?.["x-forwarded-proto"];
    const proto = Array.isArray(xfProto) ? xfProto[0] : xfProto;
    const scheme = proto || "https";

    const xfHost = req.headers?.["x-forwarded-host"];
    const hostHeader = Array.isArray(xfHost) ? xfHost[0] : xfHost;
    const host = hostHeader || req.headers?.host || "localhost";

    const baseUrl = `${scheme}://${host}`;

    const yaml = app.swagger({
      yaml: true,
      openapi: {
        servers: [{ url: baseUrl }]
      }
    });

    reply.header("Content-Type", "text/yaml; charset=utf-8");
    return yaml;
  });

  return app;
}
