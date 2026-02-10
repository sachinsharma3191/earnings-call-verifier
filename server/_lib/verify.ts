import type { QuarterData } from "./sec";

export type Claim = {
  id?: string;
  speaker?: string;
  role?: string;
  text?: string;
  metric?: string;
  claimed: number;
  unit: "billion" | "percent" | string;
  context?: string;
};

export const DOLLAR_TOLERANCE_PCT = 5.0;
export const PERCENTAGE_TOLERANCE_POINTS = 2.0;

export function findQuarterData(quarters: QuarterData[], quarterStr: string): QuarterData | null {
  const parts = quarterStr.split(" ").filter(Boolean);
  if (parts.length !== 2) return null;
  const qNum = parts[0].replace("Q", "");
  const year = parts[1];

  for (const q of quarters) {
    if (q.fiscal_period === `Q${qNum}` && String(q.fiscal_year) === year) return q;
  }
  return null;
}

export function verifySingleClaim(claim: Claim, metrics: Record<string, number>): any {
  const verified: any = { ...claim };

  const metricType = (claim.metric ?? "").toLowerCase();
  const claimedValue = Number(claim.claimed);
  const unit = claim.unit ?? "";

  let actualValue: number | undefined;

  if (metricType.includes("revenue")) actualValue = metrics.revenue_billions;
  else if (metricType.includes("net income")) actualValue = metrics.net_income_billions;
  else if (metricType.includes("operating income")) actualValue = metrics.operating_income_billions;
  else if (metricType.includes("gross profit")) actualValue = metrics.gross_profit_billions;
  else if (metricType.includes("gross margin")) actualValue = metrics.gross_margin_pct;
  else if (metricType.includes("operating margin")) actualValue = metrics.operating_margin_pct;
  else if (metricType.includes("net margin")) actualValue = metrics.net_margin_pct;

  if (actualValue === undefined || actualValue === null) {
    verified.status = "unverifiable";
    verified.reason = "Metric not available in SEC data";
    return verified;
  }

  const difference = claimedValue - actualValue;
  const percentDiff = actualValue !== 0 ? (difference / actualValue) * 100 : 0;

  let isAccurate = false;
  if (unit === "billion") isAccurate = Math.abs(percentDiff) <= DOLLAR_TOLERANCE_PCT;
  else if (unit === "percent") isAccurate = Math.abs(difference) <= PERCENTAGE_TOLERANCE_POINTS;
  else isAccurate = Math.abs(percentDiff) <= DOLLAR_TOLERANCE_PCT;

  verified.actual = round2(actualValue);
  verified.difference = round2(difference);
  verified.percentDiff = round2(percentDiff);
  verified.status = isAccurate ? "accurate" : "discrepant";

  if (!isAccurate) {
    if (Math.abs(percentDiff) > 10) {
      verified.flag = "high_discrepancy";
      verified.severity = "high";
    } else if (difference > 0) {
      verified.flag = "optimistic";
      verified.severity = Math.abs(percentDiff) > 5 ? "moderate" : "low";
    } else {
      verified.flag = "conservative";
      verified.severity = Math.abs(percentDiff) > 5 ? "moderate" : "low";
    }
  } else {
    verified.flag = null;
    verified.severity = "low";
  }

  return verified;
}

export function calculateSummary(verifiedClaims: any[]): any {
  const total = verifiedClaims.length;
  const accurate = verifiedClaims.filter((c) => c.status === "accurate").length;
  const discrepant = verifiedClaims.filter((c) => c.status === "discrepant").length;
  const unverifiable = verifiedClaims.filter((c) => c.status === "unverifiable").length;

  const verifiable = accurate + discrepant;
  const accuracyScore = verifiable > 0 ? (accurate / verifiable) * 100 : 0;

  return {
    accurate,
    discrepant,
    unverifiable,
    accuracyScore: Math.round(accuracyScore * 10) / 10
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
