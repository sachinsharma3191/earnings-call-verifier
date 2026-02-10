// Interface for verification services
export interface IVerificationService {
  verifyClaims(ticker: string, quarter: string, claims: Claim[]): Promise<VerificationResult>;
}

export interface Claim {
  id?: string;
  speaker?: string;
  role?: string;
  text?: string;
  metric?: string;
  claimed: number;
  unit: string;
  context?: string;
}

export interface VerifiedClaim extends Claim {
  actual: number | null;
  difference: number | null;
  percentDiff: number | null;
  status: 'accurate' | 'discrepant' | 'unverifiable';
  flag: string | null;
  severity: 'low' | 'moderate' | 'high';
  verificationTimestamp: string;
}

export interface VerificationResult {
  claims: VerifiedClaim[];
  summary: {
    accurate: number;
    discrepant: number;
    unverifiable: number;
    accuracyScore: number;
    byExecutive: ExecutiveStats[];
  };
}

export interface ExecutiveStats {
  speaker: string;
  role: string;
  totalClaims: number;
  accurate: number;
  discrepant: number;
  unverifiable: number;
  accuracyScore: number;
}
