import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Calendar, TrendingUp, User } from 'lucide-react';

function CompanyDetail({ company, onBack }) {
  const [selectedQuarter, setSelectedQuarter] = useState(company.latestQuarter);
  const verification = company.verifications[selectedQuarter];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accurate':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'discrepant':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    }
  };

  const getStatusBadge = (status, flag, severity) => {
    if (status === 'accurate') {
      return <span className="badge-success">VERIFIED</span>;
    }
    if (status === 'discrepant') {
      const severityColors = {
        high: 'bg-red-500/20 text-red-300 border-red-500/30',
        moderate: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        low: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      };
      const flagText = flag === 'high_discrepancy' ? 'HIGH DISCREPANCY' : 
                      flag === 'optimistic' ? 'OPTIMISTIC' : 'DISCREPANT';
      return <span className={`badge border ${severityColors[severity]}`}>{flagText}</span>;
    }
    return <span className="badge-neutral">UNVERIFIABLE</span>;
  };

  const accuracyColor = 
    verification.accuracyScore >= 70 ? 'text-green-400' :
    verification.accuracyScore >= 50 ? 'text-yellow-400' :
    'text-red-400';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold">{company.name}</h2>
          <div className="flex items-center flex-wrap gap-3 mt-2">
            <span className="text-gray-400">{company.ticker}</span>
            <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">{company.sector}</span>
            <span className="text-gray-500 text-sm">CIK: {company.cik}</span>
          </div>
        </div>
      </div>

      {/* Quarter Selector */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2 text-gray-400">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-medium">Select Quarter:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(company.quarters || []).map((q) => {
              const quarter = typeof q === 'string' ? q : q.quarter;
              return (
              <button
                key={quarter}
                onClick={() => setSelectedQuarter(quarter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedQuarter === quarter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {quarter}
              </button>
            );
            })}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="text-gray-400 text-sm mb-1">Total Claims</div>
          <div className="text-3xl font-bold">{verification.totalClaims}</div>
          <p className="text-xs text-gray-500 mt-1">Analyzed for {selectedQuarter}</p>
        </div>
        <div className="stat-card border-green-500/30">
          <div className="text-gray-400 text-sm mb-1">Accurate</div>
          <div className="text-3xl font-bold text-green-400">{verification.accurate}</div>
          <p className="text-xs text-gray-500 mt-1">Within tolerance</p>
        </div>
        <div className="stat-card border-red-500/30">
          <div className="text-gray-400 text-sm mb-1">Discrepant</div>
          <div className="text-3xl font-bold text-red-400">{verification.discrepant}</div>
          <p className="text-xs text-gray-500 mt-1">Flagged issues</p>
        </div>
        <div className="stat-card border-purple-500/30">
          <div className="text-gray-400 text-sm mb-1">Accuracy Score</div>
          <div className={`text-3xl font-bold ${accuracyColor}`}>
            {verification.accuracyScore}%
          </div>
          <p className="text-xs text-gray-500 mt-1">Verifiable claims</p>
        </div>
      </div>

      {/* Accuracy Gauge */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
          Accuracy Analysis
        </h3>
        <div className="relative h-12 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000 ease-out"
            style={{ width: `${verification.accuracyScore}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
            {verification.accurate} out of {verification.totalClaims} verifiable claims accurate
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          Tolerance thresholds: ±5% for dollar amounts, ±2 percentage points for margins
        </div>
      </div>

      {/* Claims List */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-6">Detailed Claim Analysis</h3>
        <div className="space-y-4">
          {verification.claims.map((claim) => (
            <div 
              key={claim.id}
              className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
                claim.status === 'accurate' 
                  ? 'bg-green-900/10 border-green-500/30 hover:border-green-500/50' 
                  : claim.status === 'discrepant'
                  ? 'bg-red-900/10 border-red-500/30 hover:border-red-500/50'
                  : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(claim.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-white">{claim.speaker}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-400">{claim.role}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{claim.metric}</div>
                  </div>
                </div>
                {getStatusBadge(claim.status, claim.flag, claim.severity)}
              </div>

              {/* Claim Text */}
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <p className="text-gray-300 italic leading-relaxed">"{claim.text}"</p>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1 font-medium">Claimed Value</div>
                  <div className="font-semibold text-lg">
                    {claim.unit === 'billion' ? '$' : ''}{claim.claimed}{claim.unit === 'billion' ? 'B' : claim.unit === 'percent' ? '%' : ''}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1 font-medium">SEC Filing</div>
                  <div className="font-semibold text-lg text-green-400">
                    {claim.unit === 'billion' ? '$' : ''}{claim.actual}{claim.unit === 'billion' ? 'B' : claim.unit === 'percent' ? '%' : ''}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1 font-medium">Difference</div>
                  <div className={`font-semibold text-lg ${
                    claim.status === 'discrepant' ? 'text-red-400' : 'text-gray-300'
                  }`}>
                    {claim.difference > 0 ? '+' : ''}{claim.difference.toFixed(2)}{claim.unit === 'billion' ? 'B' : claim.unit === 'percent' ? 'pts' : ''}
                    <span className="text-sm ml-1">
                      ({claim.percentDiff > 0 ? '+' : ''}{claim.percentDiff.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Severity Indicator */}
              {claim.status === 'discrepant' && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Severity Level:</span>
                    <span className={`font-medium ${
                      claim.severity === 'high' ? 'text-red-400' :
                      claim.severity === 'moderate' ? 'text-orange-400' :
                      'text-yellow-400'
                    }`}>
                      {claim.severity.toUpperCase()}
                    </span>
                  </div>
                  {claim.flag && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-400">Flag:</span>
                      <span className="text-orange-400 font-medium">
                        {claim.flag.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Methodology Notes */}
      <div className="card p-6 bg-blue-900/10 border-blue-500/30">
        <h3 className="text-lg font-semibold mb-3 text-blue-400">
          📋 Analysis Methodology
        </h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start">
            <span className="text-blue-400 mr-2 mt-0.5">•</span>
            <span><strong>Data Source:</strong> Official SEC EDGAR filings (10-Q quarterly reports)</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2 mt-0.5">•</span>
            <span><strong>Tolerance Thresholds:</strong> ±5% for dollar amounts, ±2 percentage points for margins/percentages</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2 mt-0.5">•</span>
            <span><strong>Optimistic Flag:</strong> Claimed value exceeds actual by more than tolerance threshold</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2 mt-0.5">•</span>
            <span><strong>High Discrepancy:</strong> Deviation exceeds 10% threshold</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2 mt-0.5">•</span>
            <span><strong>Unverifiable Claims:</strong> Typically segment-level data not available in summary filings</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default CompanyDetail;
