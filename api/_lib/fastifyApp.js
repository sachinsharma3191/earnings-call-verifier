import Fastify from "fastify";
import swagger from "@fastify/swagger";

import { fileCache } from "./cache/FileCache.js";
import { aggregateCache } from "./cache/AggregateCache.js";
import { cacheRefresher } from "./cache/CacheRefresher.js";
import { TICKER_TO_CIK, COMPANIES_LIST } from "./constants/index.js";
import { verifySingleClaim, calculateSummary } from "./services/VerificationService.js";

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

  // ─── POST /api/verification/verify ─── Verify claims against cached data (fast filter)
  app.post("/api/verification/verify", async (req, reply) => {
    try {
      const { ticker, quarter, claims } = req.body;

      if (!ticker || !quarter || !claims || !Array.isArray(claims)) {
        reply.code(400);
        return { error: "Missing required fields: ticker, quarter, claims[]" };
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
      const verifiedClaims = claims.map(claim => verifySingleClaim(claim, metrics));
      const summary = calculateSummary(verifiedClaims);

      return {
        ticker: upperTicker,
        quarter,
        total_claims: verifiedClaims.length,
        summary,
        claims: verifiedClaims,
        sec_data: {
          end_date: qData.endDate,
          filed: qData.filed,
          dataSource: qData.dataSource
        }
      };
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
