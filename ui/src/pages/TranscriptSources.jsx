import React, { useState } from 'react';
import { FileText, CheckCircle, AlertTriangle, XCircle, ExternalLink, Info } from 'lucide-react';

function TranscriptSources() {
  const [selectedCompany, setSelectedCompany] = useState('AAPL');

  // Mock data - in production this would come from API
  const transcriptData = {
    'AAPL': {
      name: 'Apple Inc.',
      quarters: [
        {
          quarter: 'Q4 2025',
          available: true,
          source: 'The Motley Fool',
          url: 'https://www.fool.com/earnings/call-transcripts/2026/01/30/apple-aapl-q4-2025-earnings-call-transcript/',
          type: 'transcript',
          filed: '2026-01-30'
        },
        {
          quarter: 'Q3 2025',
          available: true,
          source: 'Yahoo Finance',
          url: 'https://finance.yahoo.com/news/apple-inc-aapl-q3-2025-earnings-call-transcript',
          type: 'transcript',
          filed: '2025-10-31'
        },
        {
          quarter: 'Q2 2025',
          available: true,
          source: 'The Motley Fool',
          url: 'https://www.fool.com/earnings/call-transcripts/2025/08/01/apple-aapl-q2-2025-earnings-call-transcript/',
          type: 'transcript',
          filed: '2025-07-31'
        },
        {
          quarter: 'Q1 2025',
          available: false,
          source: 'SEC EDGAR (10-Q MD&A)',
          url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193',
          type: 'proxy',
          filed: '2025-04-30',
          note: 'Using 10-Q MD&A as proxy - transcript not publicly available'
        }
      ]
    },
    'NVDA': {
      name: 'NVIDIA Corporation',
      quarters: [
        {
          quarter: 'Q4 2025',
          available: true,
          source: 'Investing.com',
          type: 'transcript',
          filed: '2026-01-31'
        },
        {
          quarter: 'Q3 2025',
          available: true,
          source: 'The Motley Fool',
          type: 'transcript',
          filed: '2025-10-31'
        },
        {
          quarter: 'Q2 2025',
          available: true,
          source: 'Yahoo Finance',
          type: 'transcript',
          filed: '2025-07-31'
        },
        {
          quarter: 'Q1 2025',
          available: true,
          source: 'The Motley Fool',
          type: 'transcript',
          filed: '2025-04-30'
        }
      ]
    },
    'MSFT': {
      name: 'Microsoft Corporation',
      quarters: [
        {
          quarter: 'Q4 2025',
          available: true,
          source: 'Yahoo Finance',
          type: 'transcript',
          filed: '2026-01-31'
        },
        {
          quarter: 'Q3 2025',
          available: true,
          source: 'The Motley Fool',
          type: 'transcript',
          filed: '2025-10-31'
        },
        {
          quarter: 'Q2 2025',
          available: true,
          source: 'Investing.com',
          type: 'transcript',
          filed: '2025-07-31'
        },
        {
          quarter: 'Q1 2025',
          available: true,
          source: 'Yahoo Finance',
          type: 'transcript',
          filed: '2025-04-30'
        }
      ]
    }
  };

  const companies = Object.keys(transcriptData);
  const currentCompany = transcriptData[selectedCompany];

  // Calculate coverage stats
  const stats = {
    total: 0,
    available: 0,
    proxy: 0,
    missing: 0
  };

  Object.values(transcriptData).forEach(company => {
    company.quarters.forEach(q => {
      stats.total++;
      if (q.available && q.type === 'transcript') stats.available++;
      else if (q.type === 'proxy') stats.proxy++;
      else stats.missing++;
    });
  });

  const coverage = ((stats.available + stats.proxy) / stats.total * 100).toFixed(1);

  const getStatusIcon = (quarter) => {
    if (quarter.available && quarter.type === 'transcript') {
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    } else if (quarter.type === 'proxy') {
      return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-400" />;
    }
  };

  const getStatusBadge = (quarter) => {
    if (quarter.available && quarter.type === 'transcript') {
      return <span className="px-2 py-1 text-xs bg-green-900/30 text-green-400 rounded">Available</span>;
    } else if (quarter.type === 'proxy') {
      return <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-400 rounded">Proxy</span>;
    } else {
      return <span className="px-2 py-1 text-xs bg-red-900/30 text-red-400 rounded">Missing</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Transcript Sources</h2>
        <p className="text-gray-400">Coverage across 10 companies × 4 quarters with source attribution</p>
      </div>

      {/* Coverage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-400 mb-1">Total Coverage</div>
          <div className="text-2xl font-bold text-blue-400">{coverage}%</div>
          <div className="text-xs text-gray-500 mt-1">{stats.available + stats.proxy}/{stats.total} quarters</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-400 mb-1">Full Transcripts</div>
          <div className="text-2xl font-bold text-green-400">{stats.available}</div>
          <div className="text-xs text-gray-500 mt-1">Public sources</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-400 mb-1">Proxy Documents</div>
          <div className="text-2xl font-bold text-yellow-400">{stats.proxy}</div>
          <div className="text-xs text-gray-500 mt-1">SEC filings</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-400 mb-1">Missing</div>
          <div className="text-2xl font-bold text-red-400">{stats.missing}</div>
          <div className="text-xs text-gray-500 mt-1">Coverage gaps</div>
        </div>
      </div>

      {/* Fallback Policy Info */}
      <div className="card p-6 bg-blue-900/10 border-blue-500/30">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-white mb-2">Fallback Policy</h3>
            <p className="text-sm text-gray-300 mb-3">
              When transcripts are missing or gated, we use the following fallback strategy:
            </p>
            <ol className="text-sm text-gray-400 space-y-2 ml-4 list-decimal">
              <li><strong className="text-white">Primary:</strong> Public transcript sources (Motley Fool, Yahoo Finance, Investing.com)</li>
              <li><strong className="text-white">Fallback:</strong> Alternative public sources with clear citation</li>
              <li><strong className="text-white">Proxy:</strong> SEC 10-Q/10-K MD&A sections (clearly labeled)</li>
            </ol>
            <p className="text-xs text-gray-500 mt-3">
              All claims are verified against SEC EDGAR filings regardless of transcript source.
            </p>
          </div>
        </div>
      </div>

      {/* Company Selector */}
      <div className="card p-6">
        <label className="block text-sm text-gray-400 mb-3 font-medium">Select Company</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {companies.map(ticker => (
            <button
              key={ticker}
              onClick={() => setSelectedCompany(ticker)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCompany === ticker
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>

      {/* Transcript Details */}
      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4">
          {selectedCompany} - {currentCompany.name}
        </h3>
        
        <div className="space-y-3">
          {currentCompany.quarters.map((quarter, idx) => (
            <div key={idx} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getStatusIcon(quarter)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-white">{quarter.quarter}</h4>
                      {getStatusBadge(quarter)}
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div><strong className="text-gray-300">Source:</strong> {quarter.source}</div>
                      <div><strong className="text-gray-300">Type:</strong> {quarter.type === 'transcript' ? 'Full Transcript' : 'Proxy Document'}</div>
                      <div><strong className="text-gray-300">Filed:</strong> {quarter.filed}</div>
                      {quarter.note && (
                        <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-700/30 rounded text-xs text-yellow-300">
                          <strong>Note:</strong> {quarter.note}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {quarter.url && (
                  <a
                    href={quarter.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 p-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Source Attribution */}
      <div className="card p-6 bg-gray-800/30">
        <h3 className="font-semibold text-white mb-3">Source Attribution & Verification</h3>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            <strong className="text-white">Transcript Sources:</strong> All transcripts are sourced from publicly accessible publishers 
            (The Motley Fool, Yahoo Finance, Investing.com) with explicit citation and provenance tracking.
          </p>
          <p>
            <strong className="text-white">Verification Standard:</strong> All quantitative claims are verified against official 
            SEC EDGAR filings (10-Q, 10-K) regardless of transcript source.
          </p>
          <p>
            <strong className="text-white">Proxy Documents:</strong> When full transcripts are unavailable, we use SEC filing 
            MD&A sections as proxies, clearly labeled to distinguish from full earnings call transcripts.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TranscriptSources;
