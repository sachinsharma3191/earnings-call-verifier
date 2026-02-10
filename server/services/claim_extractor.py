"""
Claim Extraction Service
Extracts quantitative claims from earnings call transcripts
"""

import re
from typing import List, Dict, Optional
import os

class ClaimExtractor:
    """Service for extracting claims from transcripts"""
    
    def __init__(self):
        """Initialize claim extractor"""
        self.anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
        self.use_llm = bool(self.anthropic_api_key)
    
    def extract_claims(self, transcript: str, ticker: str, quarter: str) -> List[Dict]:
        """
        Extract claims from transcript
        
        Args:
            transcript: Full earnings call transcript text
            ticker: Company ticker
            quarter: Quarter identifier (e.g., 'Q4 2024')
            
        Returns:
            List of extracted claims
        """
        if self.use_llm:
            return self._extract_with_llm(transcript, ticker, quarter)
        else:
            return self._extract_with_regex(transcript, ticker, quarter)
    
    def _extract_with_regex(self, transcript: str, ticker: str, quarter: str) -> List[Dict]:
        """
        Extract claims using pattern matching
        
        Args:
            transcript: Transcript text
            ticker: Company ticker
            quarter: Quarter
            
        Returns:
            List of claims
        """
        claims = []
        claim_id = 1
        
        # Pattern: revenue claims
        revenue_patterns = [
            r'revenue (?:came in at|was|reached|of) \$?([\d.,]+)\s*(billion|million)',
            r'Q\d revenue (?:of|was) \$?([\d.,]+)\s*(billion|million)',
            r'total revenue (?:was|came in at) \$?([\d.,]+)\s*(billion|million)'
        ]
        
        for pattern in revenue_patterns:
            for match in re.finditer(pattern, transcript, re.IGNORECASE):
                speaker = self._find_speaker(transcript, match.start())
                value_str = match.group(1).replace(',', '')
                unit = match.group(2).lower()
                
                value = float(value_str)
                if unit == 'million':
                    value = value / 1000  # Convert to billions
                
                claims.append({
                    'id': f"{ticker}_{quarter.replace(' ', '_')}_{claim_id:03d}",
                    'speaker': speaker['name'],
                    'role': speaker['role'],
                    'text': match.group(0),
                    'metric': 'Revenue',
                    'claimed': value,
                    'unit': 'billion',
                    'context': self._get_context(transcript, match.start(), match.end())
                })
                claim_id += 1
        
        # Pattern: margin claims
        margin_patterns = [
            r'(?:gross |operating |net )?margin (?:was|expanded to|improved to|of) ([\d.]+)%',
            r'(?:gross |operating |net )?margin (?:was|of) approximately ([\d.]+)%'
        ]
        
        for pattern in margin_patterns:
            for match in re.finditer(pattern, transcript, re.IGNORECASE):
                speaker = self._find_speaker(transcript, match.start())
                
                # Determine margin type
                text_lower = match.group(0).lower()
                if 'gross' in text_lower:
                    metric_type = 'Gross Margin'
                elif 'operating' in text_lower:
                    metric_type = 'Operating Margin'
                elif 'net' in text_lower:
                    metric_type = 'Net Margin'
                else:
                    metric_type = 'Margin'
                
                claims.append({
                    'id': f"{ticker}_{quarter.replace(' ', '_')}_{claim_id:03d}",
                    'speaker': speaker['name'],
                    'role': speaker['role'],
                    'text': match.group(0),
                    'metric': metric_type,
                    'claimed': float(match.group(1)),
                    'unit': 'percent',
                    'context': self._get_context(transcript, match.start(), match.end())
                })
                claim_id += 1
        
        # Pattern: net income claims
        income_patterns = [
            r'net income (?:was|of|came in at) \$?([\d.,]+)\s*(billion|million)',
            r'earnings (?:were|of) \$?([\d.,]+)\s*(billion|million)'
        ]
        
        for pattern in income_patterns:
            for match in re.finditer(pattern, transcript, re.IGNORECASE):
                speaker = self._find_speaker(transcript, match.start())
                value_str = match.group(1).replace(',', '')
                unit = match.group(2).lower()
                
                value = float(value_str)
                if unit == 'million':
                    value = value / 1000
                
                claims.append({
                    'id': f"{ticker}_{quarter.replace(' ', '_')}_{claim_id:03d}",
                    'speaker': speaker['name'],
                    'role': speaker['role'],
                    'text': match.group(0),
                    'metric': 'Net Income',
                    'claimed': value,
                    'unit': 'billion',
                    'context': self._get_context(transcript, match.start(), match.end())
                })
                claim_id += 1
        
        # Pattern: operating income claims
        op_income_patterns = [
            r'operating income (?:was|reached|came in at) \$?([\d.,]+)\s*(billion|million)'
        ]
        
        for pattern in op_income_patterns:
            for match in re.finditer(pattern, transcript, re.IGNORECASE):
                speaker = self._find_speaker(transcript, match.start())
                value_str = match.group(1).replace(',', '')
                unit = match.group(2).lower()
                
                value = float(value_str)
                if unit == 'million':
                    value = value / 1000
                
                claims.append({
                    'id': f"{ticker}_{quarter.replace(' ', '_')}_{claim_id:03d}",
                    'speaker': speaker['name'],
                    'role': speaker['role'],
                    'text': match.group(0),
                    'metric': 'Operating Income',
                    'claimed': value,
                    'unit': 'billion',
                    'context': self._get_context(transcript, match.start(), match.end())
                })
                claim_id += 1
        
        return claims
    
    def _extract_with_llm(self, transcript: str, ticker: str, quarter: str) -> List[Dict]:
        """
        Extract claims using Claude API (future enhancement)
        
        Args:
            transcript: Transcript text
            ticker: Company ticker
            quarter: Quarter
            
        Returns:
            List of claims
        """
        try:
            from anthropic import Anthropic
            
            client = Anthropic(api_key=self.anthropic_api_key)
            
            prompt = f"""Extract all quantitative financial claims from this earnings call transcript.

For each claim, provide:
- Speaker name and role (CEO, CFO, etc.)
- The exact metric being claimed (Revenue, Net Income, Gross Margin, etc.)
- The claimed value and unit
- The full quote

Transcript:
{transcript[:10000]}  # Limit to first 10k chars

Return as JSON array."""
            
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=4000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            # Parse response and structure claims
            # This would need proper JSON parsing
            return self._extract_with_regex(transcript, ticker, quarter)
            
        except Exception as e:
            print(f"LLM extraction failed: {e}")
            return self._extract_with_regex(transcript, ticker, quarter)
    
    def _find_speaker(self, transcript: str, position: int) -> Dict:
        """
        Find the speaker before a given position in transcript
        
        Args:
            transcript: Full transcript
            position: Character position
            
        Returns:
            Dictionary with speaker name and role
        """
        # Look backwards for speaker pattern
        text_before = transcript[:position]
        
        # Pattern: "NAME (ROLE):" or "NAME, ROLE:"
        speaker_patterns = [
            r'([A-Z][a-z]+ [A-Z][a-z]+)\s*\(([^)]+)\):',
            r'([A-Z][A-Z\s]+)\s*\(([^)]+)\):'
        ]
        
        for pattern in speaker_patterns:
            matches = list(re.finditer(pattern, text_before))
            if matches:
                last_match = matches[-1]
                return {
                    'name': last_match.group(1).strip(),
                    'role': last_match.group(2).strip()
                }
        
        return {'name': 'Unknown', 'role': 'Unknown'}
    
    def _get_context(self, transcript: str, start: int, end: int, context_chars: int = 200) -> str:
        """
        Get context around a match
        
        Args:
            transcript: Full transcript
            start: Match start position
            end: Match end position
            context_chars: Characters of context on each side
            
        Returns:
            Context string
        """
        context_start = max(0, start - context_chars)
        context_end = min(len(transcript), end + context_chars)
        return transcript[context_start:context_end].strip()


# Singleton instance
_claim_extractor = None

def get_claim_extractor() -> ClaimExtractor:
    """Get or create claim extractor singleton"""
    global _claim_extractor
    if _claim_extractor is None:
        _claim_extractor = ClaimExtractor()
    return _claim_extractor
