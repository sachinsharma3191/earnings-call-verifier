import Fastify from "fastify";
import swagger from "@fastify/swagger";

import { getAvailableTickers, COMPANY_CIKS, getCompanyFinancials, calculateMetrics } from "./sec.js";
import { findQuarterData, verifySingleClaim, calculateSummary } from "./verify.js";

let appPromise = null;

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
        description: "Verify quantitative claims from earnings calls against SEC EDGAR financial data."
      }
    }
  });

  app.get("/api/health", async () => {
    return {
      status: "healthy",
      service: "earnings-verifier-api",
      version: "2.0.0-node-fastify"
    };
  });

  app.get("/api/companies", async () => {
    const tickers = getAvailableTickers();
    const companies = tickers.map((ticker) => ({ ticker, cik: COMPANY_CIKS[ticker] }));
    return { companies, total: companies.length };
  });

  app.get("/api/companies/:ticker", async (req, reply) => {
    const ticker = String(req.params.ticker).toUpperCase();
    const quarters = req.query?.quarters ? Number(req.query.quarters) : 4;

    const financials = await getCompanyFinancials(ticker, quarters);
    if (!financials) {
      reply.code(404);
      return { error: `Company ${ticker} not found or data unavailable` };
    }

    return financials;
  });

  app.get("/api/companies/:ticker/quarters", async (req, reply) => {
    const ticker = String(req.params.ticker).toUpperCase();
    const financials = await getCompanyFinancials(ticker, 8);

    if (!financials) {
      reply.code(404);
      return { error: `Company ${ticker} not found` };
    }

    const quarters = financials.quarters.map((q) => ({
      quarter: `${q.fiscal_period} ${q.fiscal_year}`,
      end_date: q.end_date,
      filed: q.filed
    }));

    return { ticker, quarters, total: quarters.length };
  });

  app.get("/api/companies/:ticker/metrics/:quarter", async (req, reply) => {
    const ticker = String(req.params.ticker).toUpperCase();
    const quarter = decodeURIComponent(String(req.params.quarter));

    const financials = await getCompanyFinancials(ticker, 8);
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
    const data = req.body ?? {};
    const claims = data.claims ?? [];
    const ticker = data.ticker;
    const quarter = data.quarter;

    if (!claims?.length || !ticker || !quarter) {
      reply.code(400);
      return { error: "Missing required fields: claims, ticker, quarter" };
    }

    const financials = await getCompanyFinancials(ticker.toUpperCase(), 4);
    if (!financials) {
      reply.code(404);
      return { error: "Unable to fetch SEC data", ticker, quarter };
    }

    const qData = findQuarterData(financials.quarters, quarter);
    if (!qData) {
      reply.code(404);
      return {
        error: `Quarter ${quarter} not found in SEC data`,
        ticker,
        quarter,
        available_quarters: financials.quarters.map((q) => q.fiscal_period ?? "Unknown")
      };
    }

    const metrics = calculateMetrics(qData);
    const verifiedClaims = claims.map((c) => verifySingleClaim(c, metrics));
    const summary = calculateSummary(verifiedClaims);

    return {
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
    };
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
