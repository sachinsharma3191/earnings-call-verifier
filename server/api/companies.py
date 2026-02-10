"""
Companies API Routes
Endpoints for company data and financial information
"""

from flask import Blueprint, jsonify, request
from services.sec_service import get_sec_service

companies_bp = Blueprint('companies', __name__)

@companies_bp.route('/', methods=['GET'])
def list_companies():
    """List all available companies"""
    sec_service = get_sec_service()
    tickers = sec_service.get_available_tickers()
    
    companies = []
    for ticker in tickers:
        companies.append({
            'ticker': ticker,
            'cik': sec_service.COMPANY_CIKS[ticker]
        })
    
    return jsonify({
        'companies': companies,
        'total': len(companies)
    })

@companies_bp.route('/<ticker>', methods=['GET'])
def get_company(ticker):
    """Get detailed company information"""
    sec_service = get_sec_service()
    
    # Get number of quarters (default 4)
    quarters = request.args.get('quarters', 4, type=int)
    
    financials = sec_service.get_company_financials(ticker.upper(), quarters)
    
    if not financials:
        return jsonify({'error': f'Company {ticker} not found or data unavailable'}), 404
    
    return jsonify(financials)

@companies_bp.route('/<ticker>/quarters', methods=['GET'])
def get_company_quarters(ticker):
    """Get available quarters for a company"""
    sec_service = get_sec_service()
    
    financials = sec_service.get_company_financials(ticker.upper(), quarters=8)
    
    if not financials:
        return jsonify({'error': f'Company {ticker} not found'}), 404
    
    quarters = []
    for q in financials['quarters']:
        period = q.get('fiscal_period', 'Unknown')
        year = q.get('fiscal_year', 'Unknown')
        
        quarters.append({
            'quarter': f"{period} {year}",
            'end_date': q.get('end_date'),
            'filed': q.get('filed')
        })
    
    return jsonify({
        'ticker': ticker.upper(),
        'quarters': quarters,
        'total': len(quarters)
    })

@companies_bp.route('/<ticker>/metrics/<quarter>', methods=['GET'])
def get_quarter_metrics(ticker, quarter):
    """Get calculated metrics for a specific quarter"""
    sec_service = get_sec_service()
    
    financials = sec_service.get_company_financials(ticker.upper(), quarters=8)
    
    if not financials:
        return jsonify({'error': f'Company {ticker} not found'}), 404
    
    # Find the quarter
    target_quarter = None
    for q in financials['quarters']:
        period = q.get('fiscal_period', '')
        year = str(q.get('fiscal_year', ''))
        if f"{period} {year}" == quarter:
            target_quarter = q
            break
    
    if not target_quarter:
        return jsonify({'error': f'Quarter {quarter} not found'}), 404
    
    # Calculate metrics
    metrics = sec_service.calculate_metrics(target_quarter)
    
    return jsonify({
        'ticker': ticker.upper(),
        'quarter': quarter,
        'raw_data': target_quarter,
        'calculated_metrics': metrics
    })
