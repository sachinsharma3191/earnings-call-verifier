import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertTriangle, User, Building, PlayCircle } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

function ClaimExplorer({ companies }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const [selectedTicker, setSelectedTicker] = useState(companies?.[0]?.ticker || '');
  const [availableQuarters, setAvailableQuarters] = useState([]);
  const [selectedQuarter, setSelectedQuarter] = useState('');

  const [claimsJson, setClaimsJson] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    if (!selectedTicker && companies?.length) setSelectedTicker(companies[0].ticker);
  }, [companies]);

  useEffect(() => {
    let cancelled = false;
    async function loadQuarters() {
      if (!selectedTicker) return;
      try {
        const resp = await apiClient.getCompanyQuarters(selectedTicker);
        const q = (resp?.quarters || []).map((x) => x.quarter);
        if (!cancelled) {
          setAvailableQuarters(q);
          setSelectedQuarter((prev) => prev || q?.[0] || '');
        }
      } catch (e) {
        if (!cancelled) setAvailableQuarters([]);
      }
    }
    loadQuarters();
    return () => {
      cancelled = true;
    };
  }, [selectedTicker]);

  const verifiedClaims = useMemo(() => {
    const claims = verificationResult?.claims || [];
    return claims.map((c, idx) => ({
      ...c,
      id: c.id || `${selectedTicker}_${selectedQuarter}_${idx}`,
      companyTicker: selectedTicker,
      companyName: companies?.find((x) => x.ticker === selectedTicker)?.name || selectedTicker,
      quarter: selectedQuarter
    }));
  }, [verificationResult, selectedTicker, selectedQuarter, companies]);

  const filteredClaims = useMemo(() => {
    return verifiedClaims.filter((claim) => {
      const matchesSearch =
        (claim.text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (claim.speaker || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (claim.metric || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (claim.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || (claim.status === 'discrepant' && claim.severity === severityFilter);
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [verifiedClaims, searchTerm, statusFilter, severityFilter]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Claims Explorer</h2>
        <p className="text-gray-400">Paste Claude-extracted claims JSON and verify against SEC filings</p>
      </div>

      {/* Run Verification */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Company</label>
            <select
              value={selectedTicker}
              onChange={(e) => {
                setSelectedTicker(e.target.value);
                setVerificationResult(null);
                setVerifyError(null);
              }}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {companies.map((company) => (
                <option key={company.ticker} value={company.ticker}>
                  {company.ticker} - {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Quarter</label>
            <select
              value={selectedQuarter}
              onChange={(e) => {
                setSelectedQuarter(e.target.value);
                setVerificationResult(null);
                setVerifyError(null);
              }}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableQuarters.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={async () => {
                setVerifying(true);
                setVerifyError(null);
                setVerificationResult(null);
                try {
                  const parsed = claimsJson?.trim() ? JSON.parse(claimsJson) : [];
                  const claims = Array.isArray(parsed) ? parsed : (parsed.claims || []);
                  const resp = await apiClient.verifyClaims(claims, selectedTicker, selectedQuarter);
                  setVerificationResult(resp);
                } catch (e) {
                  setVerifyError(e?.message || 'Verification failed');
                } finally {
                  setVerifying(false);
                }
              }}
              disabled={!selectedTicker || !selectedQuarter || verifying}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              {verifying ? 'Verifying...' : 'Verify Claims'}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-400 mb-2 font-medium">Claims JSON (from Claude Skill)</label>
          <textarea
            value={claimsJson}
            onChange={(e) => setClaimsJson(e.target.value)}
            rows={8}
            placeholder='Paste an array of claims here: [{"metric":"Revenue","claimed":29.1,"unit":"billion","text":"..."}]'
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {verifyError && <div className="mt-3 text-sm text-red-300">{verifyError}</div>}
          {verificationResult?.summary && (
            <div className="mt-3 text-sm text-gray-300">
              Summary:
              <span className="ml-2 text-green-400">accurate {verificationResult.summary.accurate}</span>
              <span className="ml-2 text-red-400">discrepant {verificationResult.summary.discrepant}</span>
              <span className="ml-2 text-gray-400">unverifiable {verificationResult.summary.unverifiable}</span>
              <span className="ml-2 text-blue-300">accuracy {verificationResult.summary.accuracyScore}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm text-gray-400 mb-2 font-medium">Search Claims</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by text, speaker, metric, or company..."
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="accurate">✓ Accurate</option>
              <option value="discrepant">✗ Discrepant</option>
              <option value="unverifiable">? Unverifiable</option>
            </select>
          </div>

          {/* Company Filter */}
          <div />
        </div>

        {/* Severity Filter (only for discrepant) */}
        {statusFilter === 'discrepant' && (
          <div className="mt-4">
            <label className="block text-sm text-gray-400 mb-2 font-medium">Severity Level</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'high', 'moderate', 'low'].map(severity => (
                <button
                  key={severity}
                  onClick={() => setSeverityFilter(severity)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    severityFilter === severity
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-gray-600 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Showing <span className="font-semibold text-white">{filteredClaims.length}</span> of <span className="font-semibold text-white">{verifiedClaims.length}</span> claims
          </span>
          {(searchTerm || statusFilter !== 'all' || severityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSeverityFilter('all');
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {filteredClaims.length === 0 ? (
          <div className="card p-12 text-center">
            <Filter className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No claims match your filters</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria or clearing filters</p>
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <div 
              key={claim.id}
              className={`card p-6 hover:shadow-xl transition-all ${
                claim.status === 'discrepant' ? 'border-red-500/30' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(claim.status)}
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-white">{claim.companyTicker}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 text-sm">{claim.companyName}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 text-sm">{claim.quarter}</span>
                    </div>
                    <div className="flex items-center mt-2 space-x-2">
                      <User className="h-3 w-3 text-gray-500" />
                      <span className="text-sm text-gray-400">{claim.speaker} ({claim.role})</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-blue-400">{claim.metric}</span>
                    </div>
                  </div>
                </div>
                <span className={`badge ${
                  claim.status === 'accurate' 
                    ? 'badge-success'
                    : claim.status === 'discrepant'
                    ? 'badge-danger'
                    : 'badge-neutral'
                }`}>
                  {claim.status.toUpperCase()}
                </span>
              </div>

              {/* Claim Text */}
              <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                <p className="text-gray-300 italic leading-relaxed">"{claim.text}"</p>
              </div>

              {/* Comparison */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-400 mb-1 font-medium">Claimed</div>
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
                    <span className="text-xs ml-1">({claim.percentDiff.toFixed(2)}%)</span>
                  </div>
                </div>
              </div>

              {/* Flags */}
              {claim.flag && (
                <div className="mt-4 pt-4 border-t border-gray-600 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Analysis:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${
                      claim.severity === 'high' ? 'badge-danger' :
                      claim.severity === 'moderate' ? 'badge-warning' :
                      'badge-neutral'
                    }`}>
                      {claim.severity} SEVERITY
                    </span>
                    <span className="badge-warning">
                      {claim.flag.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ClaimExplorer;
