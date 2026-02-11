// VerificationService: Claim verification logic (moved from verify.js)
import { DOLLAR_TOLERANCE_PCT, PERCENTAGE_TOLERANCE_POINTS } from '../constants/index.js';

export function findQuarterData(quarters, quarterStr) {
  const parts = quarterStr.split(" ").filter(Boolean);
  if (parts.length !== 2) return null;
  const qNum = parts[0].replace("Q", "");
  const year = parts[1];

  for (const q of quarters) {
    if (q.fiscal_period === `Q${qNum}` && String(q.fiscal_year) === year) return q;
  }
  return null;
}

/**
 * Verify a YoY growth claim by comparing current quarter vs same quarter prior year.
 * @param {Object} claim - { metric, claimed, unit, type, speaker, role, text }
 * @param {Object} currentMetrics - metrics for the claimed quarter
 * @param {Object|null} priorYearMetrics - metrics for the same quarter in the prior year
 * @returns {Object} verified claim with actual growth %, difference, status
 */
export function verifyYoYClaim(claim, currentMetrics, priorYearMetrics) {
  const verified = {
    ...claim,
    speaker: claim.speaker || 'Unknown',
    role: claim.role || 'Unknown',
    verificationTimestamp: new Date().toISOString()
  };

  if (!priorYearMetrics) {
    verified.status = 'unverifiable';
    verified.reason = 'Prior year data not available for YoY comparison';
    verified.actual = null;
    verified.difference = null;
    verified.percentDiff = null;
    verified.flag = null;
    verified.severity = 'low';
    return verified;
  }

  const metricType = (claim.metric ?? '').toLowerCase();
  const claimedGrowth = Number(claim.claimed); // e.g. 15 for "15% growth"

  // Get current and prior year values for the metric
  let currentValue = getMetricValue(metricType, currentMetrics);
  let priorValue = getMetricValue(metricType, priorYearMetrics);

  if (currentValue === undefined || currentValue === null || priorValue === undefined || priorValue === null || priorValue === 0) {
    verified.status = 'unverifiable';
    verified.reason = 'Metric not available in SEC data for both periods';
    verified.actual = null;
    verified.difference = null;
    verified.percentDiff = null;
    verified.flag = null;
    verified.severity = 'low';
    return verified;
  }

  // Compute actual YoY growth percentage
  const actualGrowth = ((currentValue - priorValue) / Math.abs(priorValue)) * 100;
  const difference = claimedGrowth - actualGrowth;

  // Tolerance: 2 percentage points for growth claims
  const isAccurate = Math.abs(difference) <= PERCENTAGE_TOLERANCE_POINTS;

  verified.actual = round2(actualGrowth);
  verified.currentValue = round2(currentValue);
  verified.priorValue = round2(priorValue);
  verified.difference = round2(difference);
  verified.percentDiff = round2(difference); // For growth claims, difference IS the percentage point diff
  verified.status = isAccurate ? 'accurate' : 'discrepant';

  if (!isAccurate) {
    if (Math.abs(difference) > 10) {
      verified.flag = 'high_discrepancy';
      verified.severity = 'high';
    } else if (difference > 0) {
      verified.flag = 'optimistic';
      verified.severity = Math.abs(difference) > 5 ? 'moderate' : 'low';
    } else {
      verified.flag = 'conservative';
      verified.severity = Math.abs(difference) > 5 ? 'moderate' : 'low';
    }
  } else {
    verified.flag = null;
    verified.severity = 'low';
  }

  return verified;
}

function getMetricValue(metricType, metrics) {
  if (metricType.includes('revenue')) return metrics.revenue_billions;
  if (metricType.includes('net income')) return metrics.net_income_billions;
  if (metricType.includes('operating income')) return metrics.operating_income_billions;
  if (metricType.includes('gross profit')) return metrics.gross_profit_billions;
  if (metricType.includes('gross margin')) return metrics.gross_margin_pct;
  if (metricType.includes('operating margin')) return metrics.operating_margin_pct;
  if (metricType.includes('net margin')) return metrics.net_margin_pct;
  if (metricType.includes('eps') || metricType.includes('earnings per share')) return metrics.eps;
  return undefined;
}

export function verifySingleClaim(claim, metrics) {
  const verified = { 
    ...claim,
    speaker: claim.speaker || 'Unknown',
    role: claim.role || 'Unknown',
    verificationTimestamp: new Date().toISOString()
  };

  const metricType = (claim.metric ?? "").toLowerCase();
  const claimedValue = Number(claim.claimed);
  const unit = claim.unit ?? "";

  let actualValue;

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
    verified.actual = null;
    verified.difference = null;
    verified.percentDiff = null;
    verified.flag = null;
    verified.severity = "low";
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

export function calculateSummary(verifiedClaims) {
  const total = verifiedClaims.length;
  const accurate = verifiedClaims.filter((c) => c.status === "accurate").length;
  const discrepant = verifiedClaims.filter((c) => c.status === "discrepant").length;
  const unverifiable = verifiedClaims.filter((c) => c.status === "unverifiable").length;

  const verifiable = accurate + discrepant;
  const accuracyScore = verifiable > 0 ? (accurate / verifiable) * 100 : 0;

  const executiveStats = {};
  verifiedClaims.forEach((claim) => {
    const exec = claim.speaker || 'Unknown';
    if (!executiveStats[exec]) {
      executiveStats[exec] = {
        speaker: exec,
        role: claim.role || 'Unknown',
        totalClaims: 0,
        accurate: 0,
        discrepant: 0,
        unverifiable: 0
      };
    }
    executiveStats[exec].totalClaims++;
    if (claim.status === 'accurate') executiveStats[exec].accurate++;
    else if (claim.status === 'discrepant') executiveStats[exec].discrepant++;
    else if (claim.status === 'unverifiable') executiveStats[exec].unverifiable++;
  });

  const byExecutive = Object.values(executiveStats).map((stat) => {
    const verifiableExec = stat.accurate + stat.discrepant;
    const accuracyExec = verifiableExec > 0 ? (stat.accurate / verifiableExec) * 100 : 0;
    return {
      ...stat,
      accuracyScore: Math.round(accuracyExec * 10) / 10
    };
  });

  return {
    accurate,
    discrepant,
    unverifiable,
    accuracyScore: Math.round(accuracyScore * 10) / 10,
    byExecutive
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
