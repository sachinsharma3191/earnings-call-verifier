"""
Verification API Routes
Endpoints for verifying claims against SEC data
"""

from flask import Blueprint, jsonify, request
from services.verification_service import get_verification_service
from services.claim_extractor import get_claim_extractor

verification_bp = Blueprint('verification', __name__)

@verification_bp.route('/verify', methods=['POST'])
def verify_claims():
    """
    Verify claims against SEC data
    
    Request body:
    {
        "claims": [...],
        "ticker": "AAPL",
        "quarter": "Q4 2024"
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    claims = data.get('claims', [])
    ticker = data.get('ticker')
    quarter = data.get('quarter')
    
    if not claims or not ticker or not quarter:
        return jsonify({
            'error': 'Missing required fields: claims, ticker, quarter'
        }), 400
    
    verification_service = get_verification_service()
    results = verification_service.verify_claims(claims, ticker, quarter)
    
    if 'error' in results:
        return jsonify(results), 404
    
    return jsonify(results)

@verification_bp.route('/verify-transcript', methods=['POST'])
def verify_transcript():
    """
    Complete workflow: extract claims from transcript and verify
    
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
    
    # Step 1: Extract claims
    extractor = get_claim_extractor()
    claims = extractor.extract_claims(transcript, ticker, quarter)
    
    if not claims:
        return jsonify({
            'message': 'No claims extracted from transcript',
            'ticker': ticker,
            'quarter': quarter
        }), 200
    
    # Step 2: Verify claims
    verification_service = get_verification_service()
    results = verification_service.verify_claims(claims, ticker, quarter)
    
    if 'error' in results:
        return jsonify(results), 404
    
    # Add extraction info
    results['extraction'] = {
        'total_claims_extracted': len(claims),
        'method': 'llm' if extractor.use_llm else 'regex'
    }
    
    return jsonify(results)

@verification_bp.route('/company/<ticker>/full-analysis', methods=['GET'])
def full_company_analysis(ticker):
    """
    Get full analysis for a company (all quarters with available transcripts)
    """
    # This would iterate through all quarters with transcripts
    # For now, return a message
    return jsonify({
        'message': 'Full analysis endpoint',
        'ticker': ticker.upper(),
        'note': 'This endpoint would analyze all available quarters for the company'
    })

@verification_bp.route('/statistics', methods=['GET'])
def get_statistics():
    """Get overall verification statistics"""
    
    # This would aggregate statistics from database
    # For now, return sample stats
    return jsonify({
        'overall': {
            'total_claims': 0,
            'accurate': 0,
            'discrepant': 0,
            'accuracy_rate': 0.0
        },
        'by_company': [],
        'by_metric_type': [],
        'note': 'Statistics would be aggregated from database'
    })
