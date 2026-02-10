"""
SEC EDGAR API Service
Fetches financial data from official SEC filings
"""

import requests
import time
from typing import Dict, Optional, List
import json

class SECService:
    """Service for interacting with SEC EDGAR API"""
    
    BASE_URL = "https://data.sec.gov/api/xbrl/companyfacts"
    
    # Company CIK mappings
    COMPANY_CIKS = {
        'AAPL': '0000320193',
        'MSFT': '0000789019',
        'NVDA': '0001045810',
        'GOOGL': '0001652044',
        'AMZN': '0001018724',
        'META': '0001326801',
        'TSLA': '0001318605',
        'JPM': '0000019617',
        'JNJ': '0000200406',
        'WMT': '0000104169',
        'KO': '0000021344'
    }
    
    def __init__(self):
        """Initialize SEC service with rate limiting"""
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'EarningsVerifier/1.0 (educational-project@example.com)',
            'Accept-Encoding': 'gzip, deflate',
            'Host': 'data.sec.gov'
        })
        self.last_request_time = 0
        self.rate_limit_delay = 0.1  # SEC requests 10 requests per second max
    
    def _rate_limit(self):
        """Enforce rate limiting"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.rate_limit_delay:
            time.sleep(self.rate_limit_delay - time_since_last)
        self.last_request_time = time.time()
    
    def get_company_facts(self, ticker: str) -> Optional[Dict]:
        """
        Fetch all financial facts for a company from SEC
        
        Args:
            ticker: Stock ticker symbol (e.g., 'AAPL')
            
        Returns:
            Dictionary of company financial facts or None
        """
        cik = self.COMPANY_CIKS.get(ticker.upper())
        if not cik:
            return None
        
        self._rate_limit()
        
        url = f"{self.BASE_URL}/CIK{cik}.json"
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error fetching SEC data for {ticker}: {e}")
            return None
    
    def extract_quarterly_data(self, facts_data: Dict, quarters: int = 4) -> List[Dict]:
        """
        Extract quarterly financial data from SEC facts
        
        Args:
            facts_data: Raw SEC company facts data
            quarters: Number of recent quarters to extract
            
        Returns:
            List of quarterly financial dictionaries
        """
        if not facts_data:
            return []
        
        quarterly_data = []
        
        try:
            # Extract US-GAAP facts
            us_gaap = facts_data.get('facts', {}).get('us-gaap', {})
            
            # Key metrics to extract
            metrics = {
                'Revenues': 'Revenues',
                'RevenueFromContractWithCustomerExcludingAssessedTax': 'Revenues',
                'NetIncomeLoss': 'NetIncome',
                'GrossProfit': 'GrossProfit',
                'OperatingIncomeLoss': 'OperatingIncome',
                'CostOfRevenue': 'CostOfRevenue',
                'OperatingExpenses': 'OperatingExpenses',
                'EarningsPerShareDiluted': 'EPS'
            }
            
            # Get 10-Q filings (quarterly)
            quarters_found = {}
            
            for sec_metric, our_metric in metrics.items():
                if sec_metric not in us_gaap:
                    continue
                
                metric_data = us_gaap[sec_metric]
                units = metric_data.get('units', {})
                
                # Try USD first, then shares for EPS
                values = units.get('USD', units.get('USD/shares', []))
                
                # Filter for 10-Q filings only
                for item in values:
                    if item.get('form') == '10-Q':
                        period_key = item.get('end')
                        fiscal_period = item.get('fp', 'Q0')
                        
                        if period_key not in quarters_found:
                            quarters_found[period_key] = {
                                'end_date': period_key,
                                'fiscal_year': item.get('fy'),
                                'fiscal_period': fiscal_period,
                                'filed': item.get('filed'),
                                'form': '10-Q'
                            }
                        
                        quarters_found[period_key][our_metric] = item.get('val')
            
            # Sort by date and take most recent quarters
            sorted_quarters = sorted(
                quarters_found.items(), 
                key=lambda x: x[0], 
                reverse=True
            )[:quarters]
            
            quarterly_data = [q[1] for q in sorted_quarters]
            
        except Exception as e:
            print(f"Error extracting quarterly data: {e}")
        
        return quarterly_data
    
    def get_company_financials(self, ticker: str, quarters: int = 4) -> Optional[Dict]:
        """
        Get structured financial data for a company
        
        Args:
            ticker: Stock ticker
            quarters: Number of quarters to retrieve
            
        Returns:
            Dictionary with company info and quarterly financials
        """
        facts = self.get_company_facts(ticker)
        if not facts:
            return None
        
        quarterly_data = self.extract_quarterly_data(facts, quarters)
        
        entity_name = facts.get('entityName', ticker)
        cik = facts.get('cik')
        
        return {
            'ticker': ticker.upper(),
            'company_name': entity_name,
            'cik': str(cik).zfill(10),
            'quarters': quarterly_data,
            'data_source': 'SEC EDGAR',
            'last_updated': time.strftime('%Y-%m-%d')
        }
    
    def calculate_metrics(self, quarter_data: Dict) -> Dict:
        """
        Calculate derived metrics from raw financial data
        
        Args:
            quarter_data: Dictionary of quarter financial data
            
        Returns:
            Dictionary with calculated metrics
        """
        metrics = {}
        
        try:
            revenue = quarter_data.get('Revenues', 0)
            net_income = quarter_data.get('NetIncome', 0)
            gross_profit = quarter_data.get('GrossProfit', 0)
            operating_income = quarter_data.get('OperatingIncome', 0)
            
            # Gross margin
            if revenue and gross_profit:
                metrics['gross_margin_pct'] = (gross_profit / revenue) * 100
            
            # Operating margin
            if revenue and operating_income:
                metrics['operating_margin_pct'] = (operating_income / revenue) * 100
            
            # Net margin
            if revenue and net_income:
                metrics['net_margin_pct'] = (net_income / revenue) * 100
            
            # Convert to billions for readability
            metrics['revenue_billions'] = revenue / 1_000_000_000 if revenue else 0
            metrics['net_income_billions'] = net_income / 1_000_000_000 if net_income else 0
            metrics['gross_profit_billions'] = gross_profit / 1_000_000_000 if gross_profit else 0
            metrics['operating_income_billions'] = operating_income / 1_000_000_000 if operating_income else 0
            
        except Exception as e:
            print(f"Error calculating metrics: {e}")
        
        return metrics
    
    @staticmethod
    def get_available_tickers() -> List[str]:
        """Get list of supported company tickers"""
        return list(SECService.COMPANY_CIKS.keys())


# Singleton instance
_sec_service = None

def get_sec_service() -> SECService:
    """Get or create SEC service singleton"""
    global _sec_service
    if _sec_service is None:
        _sec_service = SECService()
    return _sec_service
