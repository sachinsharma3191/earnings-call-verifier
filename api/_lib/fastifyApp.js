import Fastify from "fastify";
import swagger from "@fastify/swagger";

import { getAvailableTickers, COMPANY_CIKS, calculateMetrics } from "./sec.js";
import { SECDataService } from "./services/SECDataService.js";
import { findQuarterData, verifySingleClaim, calculateSummary } from "./verify.js";

let appPromise = null;
const secService = new SECDataService();

export function getFastifyApp() {
  if (!appPromise) {
    appPromise = buildApp();
  }
  return appPromise;
}

async function buildApp() {
  const app = Fastify({ logger: false });

  await app.register(swagger, {
    mode: "dynamic",
    openapi: {
      info: {
        title: "Earnings Call Verifier API",
        version: "2.0.0",
        description: "Verify quantitative claims from earnings calls against SEC EDGAR financial data. Includes transcript source management with fallback policies for comprehensive coverage across 10 companies × 4 quarters."
      },
      tags: [
        { name: "health", description: "Health check endpoints" },
        { name: "companies", description: "Company financial data endpoints" },
        { name: "transcripts", description: "Transcript source management and attribution" },
        { name: "verification", description: "Claim verification endpoints" }
      ]
    }
  });

  app.get("/api/health", async () => {
    return {
      status: "healthy",
      service: "earnings-verifier-api",
      version: "2.0.0-node-fastify"
    };
  });

  // Import the new endpoint handlers
  app.get("/api/companies", async (req, reply) => {
    const companiesHandler = await import('../companies/index.js');
    return companiesHandler.default({ query: {} }, { 
      status: (code) => ({ 
        json: (data) => { 
          reply.code(code); 
          return data; 
        } 
      }) 
    });
  });

  app.get("/api/companies/:ticker", async (req, reply) => {
    const tickerHandler = await import('../companies/[ticker].js');
    return tickerHandler.default(
      { query: { ticker: req.params.ticker } }, 
      { 
        status: (code) => ({ 
          json: (data) => { 
            reply.code(code); 
            return data; 
          } 
        }) 
      }
    );
  });

  app.get("/api/companies/:ticker/quarters", async (req, reply) => {
    const quartersHandler = await import('../companies/[ticker]/quarters.js');
    return quartersHandler.default(
      { query: { ticker: req.params.ticker } }, 
      { 
        status: (code) => ({ 
          json: (data) => { 
            reply.code(code); 
            return data; 
          } 
        }) 
      }
    );
  });

  app.get("/api/companies/:ticker/metrics/:quarter", async (req, reply) => {
    const ticker = String(req.params.ticker).toUpperCase();
    const quarter = decodeURIComponent(String(req.params.quarter));
    const cik = COMPANY_CIKS[ticker];

    if (!cik) {
      reply.code(404);
      return { error: `Company ${ticker} not found` };
    }

    const financials = await secService.getCompanyFinancials(cik);
    if (!financials) {
      reply.code(404);
      return { error: `Company ${ticker} not found` };
    }

    const target = financials.quarters.find((q) => `${q.fiscal_period} ${q.fiscal_year}` === quarter);
    if (!target) {
      reply.code(404);
      return { error: `Quarter ${quarter} not found` };
    }

    const metrics = calculateMetrics(target);

    return {
      ticker,
      quarter,
      raw_data: target,
      calculated_metrics: metrics
    };
  });

  app.post("/api/verification/verify", async (req, reply) => {
    const { ticker, quarter, claims } = req.body;

    if (!ticker || !quarter || !claims || !Array.isArray(claims)) {
      reply.code(400);
      return { error: "Missing required fields: ticker, quarter, claims[]" };
    }

    const cik = COMPANY_CIKS[ticker.toUpperCase()];
    if (!cik) {
      reply.code(404);
      return { error: `Company ${ticker} not found` };
    }
    const financials = await secService.getCompanyFinancials(cik);
    if (!financials) {
      reply.code(404);
      return { error: `Company ${ticker} not found` };
    }

    const quarterData = findQuarterData(financials.quarters, quarter);
    if (!quarterData) {
      reply.code(404);
      return { error: `Quarter ${quarter} not found for ${ticker}` };
    }

    const verifiedClaims = claims.map((claim) => verifySingleClaim(claim, quarterData));
    const summary = calculateSummary(verifiedClaims);

    return {
      ticker: ticker.toUpperCase(),
      quarter,
      total_claims: verifiedClaims.length,
      summary,
      claims: verifiedClaims,
      sec_data: {
        end_date: qData.end_date,
        filed: qData.filed,
        form: qData.form
      }
    };
  });

  app.post("/api/analyze", async (req, reply) => {
    const { ticker, quarter, year } = req.body;

    if (!ticker || !quarter || !year) {
      reply.code(400);
      return { error: "Missing required fields: ticker, quarter, year" };
    }

    try {
      // Lazy load pipeline to avoid circular dependencies or init issues
      const { AnalysisPipeline } = await import("./services/AnalysisPipeline.js");
      const pipeline = new AnalysisPipeline();
      const result = await pipeline.runAnalysis(ticker.toUpperCase(), quarter, year);
      return result;
    } catch (error) {
      req.log.error(error);
      reply.code(500);
      return { error: "Analysis failed", details: error.message };
    }
  });

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
