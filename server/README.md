# Backend API - Earnings Call Verifier

Flask REST API for verifying earnings call claims against SEC filings.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip

### Installation

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your configuration
```

### Run Development Server

```bash
python app.py
```

Server will start at `http://localhost:5000`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns API health status

### Companies

#### List All Companies
```
GET /api/companies/
```
Returns list of all available companies

#### Get Company Details
```
GET /api/companies/{ticker}?quarters=4
```
Get financial data for a company

#### Get Available Quarters
```
GET /api/companies/{ticker}/quarters
```
List all available quarters for a company

#### Get Quarter Metrics
```
GET /api/companies/{ticker}/metrics/{quarter}
```
Example: `GET /api/companies/AAPL/metrics/Q4%202024`

### Claims

#### Extract Claims from Transcript
```
POST /api/claims/extract
Content-Type: application/json

{
  "transcript": "earnings call text...",
  "ticker": "AAPL",
  "quarter": "Q4 2024"
}
```

#### Get Sample Claims
```
GET /api/claims/sample/{ticker}/{quarter}
```
Example: `GET /api/claims/sample/AAPL/Q4%202024`

### Verification

#### Verify Claims
```
POST /api/verification/verify
Content-Type: application/json

{
  "claims": [
    {
      "metric": "Revenue",
      "claimed": 95.3,
      "unit": "billion",
      ...
    }
  ],
  "ticker": "AAPL",
  "quarter": "Q4 2024"
}
```

#### Verify Transcript (End-to-End)
```
POST /api/verification/verify-transcript
Content-Type: application/json

{
  "transcript": "earnings call text...",
  "ticker": "AAPL",
  "quarter": "Q4 2024"
}
```

This endpoint:
1. Extracts claims from transcript
2. Verifies against SEC data
3. Returns full analysis

#### Get Full Company Analysis
```
GET /api/verification/company/{ticker}/full-analysis
```

#### Get Statistics
```
GET /api/verification/statistics
```

## 🏗️ Architecture

```
backend/
├── app.py                      # Flask application entry point
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
│
├── api/                       # API route handlers
│   ├── companies.py          # Company endpoints
│   ├── claims.py             # Claim extraction endpoints
│   └── verification.py       # Verification endpoints
│
├── services/                  # Business logic
│   ├── sec_service.py        # SEC EDGAR API integration
│   ├── claim_extractor.py    # Claim extraction (regex/LLM)
│   └── verification_service.py # Verification logic
│
├── models/                    # Data models (future)
│   └── __init__.py
│
└── utils/                     # Utility functions
    └── __init__.py
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# Flask
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key

# Optional: Claude API for LLM extraction
ANTHROPIC_API_KEY=your-api-key

# Server
PORT=5000
```

### Rate Limiting

The SEC service automatically rate limits requests to comply with SEC guidelines (10 requests/second).

## 📊 Data Sources

### SEC EDGAR API
- **Base URL**: `https://data.sec.gov/api/xbrl/companyfacts`
- **Format**: JSON (XBRL structured data)
- **Authentication**: None required
- **Rate Limit**: 10 requests/second recommended
- **User Agent**: Required (configured in `sec_service.py`)

### Supported Companies

Current CIK mappings:
- AAPL - Apple Inc.
- MSFT - Microsoft Corporation
- NVDA - NVIDIA Corporation
- GOOGL - Alphabet Inc.
- AMZN - Amazon.com Inc.
- META - Meta Platforms Inc.
- TSLA - Tesla Inc.
- JPM - JPMorgan Chase & Co.
- JNJ - Johnson & Johnson
- WMT - Walmart Inc.
- KO - The Coca-Cola Company

## 🧪 Testing

### Manual Testing with curl

```bash
# Health check
curl http://localhost:5000/api/health

# List companies
curl http://localhost:5000/api/companies/

# Get Apple financials
curl http://localhost:5000/api/companies/AAPL

# Get quarters
curl http://localhost:5000/api/companies/AAPL/quarters

# Verify claims (sample)
curl -X POST http://localhost:5000/api/verification/verify \
  -H "Content-Type: application/json" \
  -d '{
    "claims": [{
      "metric": "Revenue",
      "claimed": 95.3,
      "unit": "billion"
    }],
    "ticker": "AAPL",
    "quarter": "Q4 2024"
  }'
```

## 🚀 Production Deployment

### Using Gunicorn

```bash
# Install gunicorn (already in requirements.txt)
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker

Create `Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

Build and run:
```bash
docker build -t earnings-verifier-api .
docker run -p 5000:5000 earnings-verifier-api
```

### Environment Variables in Production

```env
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=strong-random-secret-key
PORT=5000
```

## 🔒 Security Considerations

1. **API Keys**: Never commit `.env` file to git
2. **CORS**: Configure allowed origins in production
3. **Rate Limiting**: Implement rate limiting for production
4. **Input Validation**: All user inputs are validated
5. **Error Handling**: Sensitive errors are not exposed to clients

## 📈 Performance

- **Caching**: Consider adding Redis for SEC data caching
- **Database**: For production, use PostgreSQL to store:
  - Verified claims
  - Company data
  - Verification history
- **Background Jobs**: Use Celery for long-running verifications

## 🐛 Troubleshooting

### SEC API Not Responding
```python
# Check if SEC is accessible
curl https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json

# Verify User-Agent header is set
```

### Import Errors
```bash
# Make sure you're in virtual environment
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### CORS Errors
Update CORS configuration in `app.py`:
```python
CORS(app, resources={r"/api/*": {"origins": "your-frontend-url"}})
```

## 📚 API Response Examples

### Successful Verification
```json
{
  "ticker": "AAPL",
  "quarter": "Q4 2024",
  "company_name": "Apple Inc.",
  "total_claims": 4,
  "summary": {
    "accurate": 3,
    "discrepant": 1,
    "unverifiable": 0,
    "accuracyScore": 75.0
  },
  "claims": [
    {
      "id": "AAPL_Q4_2024_001",
      "speaker": "Tim Cook",
      "metric": "Revenue",
      "claimed": 95.3,
      "actual": 94.93,
      "difference": 0.37,
      "percentDiff": 0.39,
      "status": "accurate",
      "flag": null,
      "severity": "low"
    }
  ]
}
```

### Error Response
```json
{
  "error": "Company not found",
  "ticker": "INVALID",
  "details": "CIK mapping not available"
}
```

## 🤝 Contributing

1. Follow PEP 8 style guide
2. Add docstrings to all functions
3. Update tests for new features
4. Update API documentation

## 📄 License

MIT License
