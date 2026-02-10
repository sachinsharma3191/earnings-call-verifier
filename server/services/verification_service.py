"""
Verification Service
Verifies claims against SEC financial data
"""

from typing import Dict, List, Optional
from services.sec_service import get_sec_service

class VerificationService:
    """Service for verifying claims against SEC data"""
    
    # Tolerance thresholds
    DOLLAR_TOLERANCE_PCT = 5.0  # 5% for dollar amounts
    PERCENTAGE_TOLERANCE_POINTS = 2.0  # 2 percentage points for percentages
    
    def __init__(self):
        """Initialize verification service"""
        self.sec_service = get_sec_service()
    
    def verify_claims(self, claims: List[Dict], ticker: str, quarter: str) -> Dict:
        """
        Verify a list of claims against SEC data
        
        Args:
            claims: List of claim dictionaries
            ticker: Company ticker
            quarter: Quarter identifier
            
        Returns:
            Verification results dictionary
        """
        # Get SEC financial data
        financials = self.sec_service.get_company_financials(ticker, quarters=4)
        if not financials:
            return {
                'error': 'Unable to fetch SEC data',
                'ticker': ticker,
                'quarter': quarter
            }
        
        # Find the specific quarter
        quarter_data = self._find_quarter_data(financials['quarters'], quarter)
        if not quarter_data:
            return {
                'error': f'Quarter {quarter} not found in SEC data',
                'ticker': ticker,
                'quarter': quarter,
                'available_quarters': [q.get('fiscal_period', 'Unknown') for q in financials['quarters']]
            }
        
        # Calculate metrics
        metrics = self.sec_service.calculate_metrics(quarter_data)
        
        # Verify each claim
        verified_claims = []
        for claim in claims:
            verified = self._verify_single_claim(claim, quarter_data, metrics)
            verified_claims.append(verified)
        
        # Calculate summary statistics
        summary = self._calculate_summary(verified_claims)
        
        return {
            'ticker': ticker,
            'quarter': quarter,
            'company_name': financials['company_name'],
            'total_claims': len(verified_claims),
            'summary': summary,
            'claims': verified_claims,
            'sec_data': {
                'end_date': quarter_data.get('end_date'),
                'filed': quarter_data.get('filed'),
                'form': quarter_data.get('form')
            }
        }
    
    def _find_quarter_data(self, quarters: List[Dict], quarter_str: str) -> Optional[Dict]:
        """
        Find quarter data matching the quarter string
        
        Args:
            quarters: List of quarter dictionaries
            quarter_str: Quarter identifier (e.g., 'Q4 2024')
            
        Returns:
            Quarter data dictionary or None
        """
        # Parse quarter string
        parts = quarter_str.split()
        if len(parts) != 2:
            return None
        
        q_num = parts[0].replace('Q', '')
        year = parts[1]
        
        for q in quarters:
            if q.get('fiscal_period') == f'Q{q_num}' and str(q.get('fiscal_year')) == year:
                return q
        
        return None
    
    def _verify_single_claim(self, claim: Dict, quarter_data: Dict, metrics: Dict) -> Dict:
        """
        Verify a single claim
        
        Args:
            claim: Claim dictionary
            quarter_data: SEC quarter data
            metrics: Calculated metrics
            
        Returns:
            Verified claim dictionary
        """
        verified = claim.copy()
        
        metric_type = claim.get('metric', '').lower()
        claimed_value = claim.get('claimed')
        unit = claim.get('unit', '')
        
        # Map to SEC data fields
        actual_value = None
        
        if 'revenue' in metric_type:
            actual_value = metrics.get('revenue_billions')
        elif 'net income' in metric_type:
            actual_value = metrics.get('net_income_billions')
        elif 'operating income' in metric_type:
            actual_value = metrics.get('operating_income_billions')
        elif 'gross profit' in metric_type:
            actual_value = metrics.get('gross_profit_billions')
        elif 'gross margin' in metric_type:
            actual_value = metrics.get('gross_margin_pct')
        elif 'operating margin' in metric_type:
            actual_value = metrics.get('operating_margin_pct')
        elif 'net margin' in metric_type:
            actual_value = metrics.get('net_margin_pct')
        
        if actual_value is None:
            verified['status'] = 'unverifiable'
            verified['reason'] = 'Metric not available in SEC data'
            return verified
        
        # Calculate discrepancy
        difference = claimed_value - actual_value
        
        if actual_value != 0:
            percent_diff = (difference / actual_value) * 100
        else:
            percent_diff = 0
        
        # Determine if within tolerance
        is_accurate = False
        
        if unit == 'billion':
            # Dollar amount - use percentage tolerance
            is_accurate = abs(percent_diff) <= self.DOLLAR_TOLERANCE_PCT
        elif unit == 'percent':
            # Percentage - use point tolerance
            is_accurate = abs(difference) <= self.PERCENTAGE_TOLERANCE_POINTS
        
        # Add verification results
        verified['actual'] = round(actual_value, 2)
        verified['difference'] = round(difference, 2)
        verified['percentDiff'] = round(percent_diff, 2)
        verified['status'] = 'accurate' if is_accurate else 'discrepant'
        
        # Flag type
        if not is_accurate:
            if abs(percent_diff) > 10:
                verified['flag'] = 'high_discrepancy'
                verified['severity'] = 'high'
            elif difference > 0:
                verified['flag'] = 'optimistic'
                verified['severity'] = 'moderate' if abs(percent_diff) > 5 else 'low'
            else:
                verified['flag'] = 'conservative'
                verified['severity'] = 'moderate' if abs(percent_diff) > 5 else 'low'
        else:
            verified['flag'] = None
            verified['severity'] = 'low'
        
        return verified
    
    def _calculate_summary(self, verified_claims: List[Dict]) -> Dict:
        """
        Calculate summary statistics
        
        Args:
            verified_claims: List of verified claims
            
        Returns:
            Summary dictionary
        """
        total = len(verified_claims)
        accurate = sum(1 for c in verified_claims if c.get('status') == 'accurate')
        discrepant = sum(1 for c in verified_claims if c.get('status') == 'discrepant')
        unverifiable = sum(1 for c in verified_claims if c.get('status') == 'unverifiable')
        
        verifiable = accurate + discrepant
        accuracy_score = (accurate / verifiable * 100) if verifiable > 0 else 0
        
        return {
            'accurate': accurate,
            'discrepant': discrepant,
            'unverifiable': unverifiable,
            'accuracyScore': round(accuracy_score, 1)
        }


# Singleton instance
_verification_service = None

def get_verification_service() -> VerificationService:
    """Get or create verification service singleton"""
    global _verification_service
    if _verification_service is None:
        _verification_service = VerificationService()
    return _verification_service
