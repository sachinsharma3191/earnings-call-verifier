"""
Claims API Routes
Endpoints for extracting claims from transcripts
"""

from flask import Blueprint, jsonify, request
from services.claim_extractor import get_claim_extractor

claims_bp = Blueprint('claims', __name__)

@claims_bp.route('/extract', methods=['POST'])
def extract_claims():
    """
    Extract claims from a transcript
    
    Request body:
    {
        "transcript": "earnings call text...",
        "ticker": "AAPL",
        "quarter": "Q4 2024"
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    transcript = data.get('transcript')
    ticker = data.get('ticker')
    quarter = data.get('quarter')
    
    if not transcript or not ticker or not quarter:
        return jsonify({
            'error': 'Missing required fields: transcript, ticker, quarter'
        }), 400
    
    extractor = get_claim_extractor()
    claims = extractor.extract_claims(transcript, ticker, quarter)
    
    return jsonify({
        'ticker': ticker,
        'quarter': quarter,
        'claims': claims,
        'total_claims': len(claims),
        'extraction_method': 'llm' if extractor.use_llm else 'regex'
    })

@claims_bp.route('/sample/<ticker>/<quarter>', methods=['GET'])
def get_sample_claims(ticker, quarter):
    """Get sample claims for demo purposes"""
    
    # Sample claims for demonstration
    sample_claims = {
        'AAPL': {
            'Q4 2024': [
                {
                    'id': 'AAPL_Q4_2024_001',
                    'speaker': 'Tim Cook',
                    'role': 'CEO',
                    'text': 'Our Q4 revenue came in at $95.3 billion',
                    'metric': 'Revenue',
                    'claimed': 95.3,
                    'unit': 'billion',
                    'context': 'Q4 earnings announcement'
                }
            ]
        },
        'NVDA': {
            'Q4 2024': [
                {
                    'id': 'NVDA_Q4_2024_001',
                    'speaker': 'Jensen Huang',
                    'role': 'CEO',
                    'text': 'Q4 revenue came in at $29.1 billion',
                    'metric': 'Revenue',
                    'claimed': 29.1,
                    'unit': 'billion',
                    'context': 'Q4 earnings announcement'
                }
            ]
        }
    }
    
    company_claims = sample_claims.get(ticker.upper(), {})
    quarter_claims = company_claims.get(quarter, [])
    
    if not quarter_claims:
        return jsonify({
            'message': 'No sample claims available',
            'ticker': ticker,
            'quarter': quarter,
            'claims': []
        }), 200
    
    return jsonify({
        'ticker': ticker.upper(),
        'quarter': quarter,
        'claims': quarter_claims,
        'total_claims': len(quarter_claims),
        'note': 'Sample data for demonstration'
    })
