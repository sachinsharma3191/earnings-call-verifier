// Single Responsibility: Verify claims against SEC data
import { IVerificationService, Claim, VerifiedClaim, VerificationResult, ExecutiveStats } from '../interfaces/IVerificationService';
import { ISECDataProvider, QuarterData } from '../interfaces/ISECDataProvider';

export class ClaimVerificationService implements IVerificationService {
  private readonly DOLLAR_TOLERANCE_PCT = 5.0;
  private readonly PERCENTAGE_TOLERANCE_POINTS = 2.0;

  constructor(private readonly secDataProvider: ISECDataProvider) {}

  async verifyClaims(ticker: string, quarter: string, claims: Claim[]): Promise<VerificationResult> {
    // Get SEC data for the company
    const cik = this.getCIKForTicker(ticker);
    const quarters = await this.secDataProvider.getQuarterlyData(cik);
    
    // Find the specific quarter
    const quarterData = this.findQuarterData(quarters, quarter);
    if (!quarterData) {
      throw new Error(`Quarter data not found for ${ticker} ${quarter}`);
    }

    // Calculate metrics from SEC data
    const metrics = this.calculateMetrics(quarterData);

    // Verify each claim
    const verifiedClaims = claims.map(claim => this.verifySingleClaim(claim, metrics));

    // Calculate summary statistics
    const summary = this.calculateSummary(verifiedClaims);

    return {
      claims: verifiedClaims,
      summary
    };
  }

  private verifySingleClaim(claim: Claim, metrics: Record<string, number>): VerifiedClaim {
    const verified: VerifiedClaim = {
      ...claim,
      speaker: claim.speaker || 'Unknown',
      role: claim.role || 'Unknown',
      verificationTimestamp: new Date().toISOString(),
      actual: null,
      difference: null,
      percentDiff: null,
      status: 'unverifiable',
      flag: null,
      severity: 'low'
    };

    const metricType = (claim.metric ?? '').toLowerCase();
    const claimedValue = Number(claim.claimed);
    const unit = claim.unit ?? '';

    // Map claim metric to SEC metric
    let actualValue = this.getActualValue(metricType, metrics);

    if (actualValue === undefined || actualValue === null) {
      verified.status = 'unverifiable';
      verified.flag = 'metric_not_available';
      return verified;
    }

    // Calculate differences
    const difference = claimedValue - actualValue;
    const percentDiff = actualValue !== 0 ? (difference / actualValue) * 100 : 0;

    // Determine accuracy
    let isAccurate = false;
    if (unit === 'billion') {
      isAccurate = Math.abs(percentDiff) <= this.DOLLAR_TOLERANCE_PCT;
    } else if (unit === 'percent') {
      isAccurate = Math.abs(difference) <= this.PERCENTAGE_TOLERANCE_POINTS;
    } else {
      isAccurate = Math.abs(percentDiff) <= this.DOLLAR_TOLERANCE_PCT;
    }

    verified.actual = this.round2(actualValue);
    verified.difference = this.round2(difference);
    verified.percentDiff = this.round2(percentDiff);
    verified.status = isAccurate ? 'accurate' : 'discrepant';

    // Set flags and severity
    if (!isAccurate) {
      if (Math.abs(percentDiff) > 10) {
        verified.flag = 'high_discrepancy';
        verified.severity = 'high';
      } else if (difference > 0) {
        verified.flag = 'optimistic';
        verified.severity = Math.abs(percentDiff) > 5 ? 'moderate' : 'low';
      } else {
        verified.flag = 'conservative';
        verified.severity = Math.abs(percentDiff) > 5 ? 'moderate' : 'low';
      }
    }

    return verified;
  }

  private getActualValue(metricType: string, metrics: Record<string, number>): number | undefined {
    if (metricType.includes('revenue')) return metrics.revenue_billions;
    if (metricType.includes('net income')) return metrics.net_income_billions;
    if (metricType.includes('operating income')) return metrics.operating_income_billions;
    if (metricType.includes('gross profit')) return metrics.gross_profit_billions;
    if (metricType.includes('gross margin')) return metrics.gross_margin_pct;
    if (metricType.includes('operating margin')) return metrics.operating_margin_pct;
    if (metricType.includes('net margin')) return metrics.net_margin_pct;
    return undefined;
  }

  private calculateMetrics(quarterData: QuarterData): Record<string, number> {
    const revenue = quarterData.Revenues || 0;
    const netIncome = quarterData.NetIncome || 0;
    const grossProfit = quarterData.GrossProfit || 0;
    const operatingIncome = quarterData.OperatingIncome || 0;

    return {
      revenue_billions: revenue,
      net_income_billions: netIncome,
      operating_income_billions: operatingIncome,
      gross_profit_billions: grossProfit,
      gross_margin_pct: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      operating_margin_pct: revenue > 0 ? (operatingIncome / revenue) * 100 : 0,
      net_margin_pct: revenue > 0 ? (netIncome / revenue) * 100 : 0
    };
  }

  private calculateSummary(verifiedClaims: VerifiedClaim[]) {
    const total = verifiedClaims.length;
    const accurate = verifiedClaims.filter(c => c.status === 'accurate').length;
    const discrepant = verifiedClaims.filter(c => c.status === 'discrepant').length;
    const unverifiable = verifiedClaims.filter(c => c.status === 'unverifiable').length;

    const verifiable = accurate + discrepant;
    const accuracyScore = verifiable > 0 ? (accurate / verifiable) * 100 : 0;

    // Executive-specific analysis
    const executiveStats: Record<string, any> = {};
    verifiedClaims.forEach(claim => {
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

    const byExecutive: ExecutiveStats[] = Object.values(executiveStats).map((stat: any) => {
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

  private findQuarterData(quarters: QuarterData[], quarterStr: string): QuarterData | null {
    const parts = quarterStr.split(' ').filter(Boolean);
    if (parts.length !== 2) return null;
    const qNum = parts[0].replace('Q', '');
    const year = parts[1];

    for (const q of quarters) {
      if (q.fiscal_period === `Q${qNum}` && String(q.fiscal_year) === year) {
        return q;
      }
    }
    return null;
  }

  private getCIKForTicker(ticker: string): string {
    // Map of tickers to CIKs
    const tickerToCIK: Record<string, string> = {
      'AAPL': '0000320193',
      'NVDA': '0001045810',
      'MSFT': '0000789019',
      'GOOGL': '0001652044',
      'AMZN': '0001018724',
      'META': '0001326801',
      'TSLA': '0001318605',
      'JPM': '0000019617',
      'JNJ': '0000200406',
      'WMT': '0000104169'
    };
    return tickerToCIK[ticker] || ticker;
  }

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }
}
