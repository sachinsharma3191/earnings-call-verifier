import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertTriangle, User, Building, PlayCircle, FileText, Zap, Shield } from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { getMockClaims, getMockTranscript } from '../data/mockTranscripts';
import { SEVERITY_CONFIG } from '../data/companyMeta';

const TABS = [
  { id: 'verify', label: 'Verify Claims' },
  { id: 'search', label: 'Search Claims' },
];

function ClaimExplorer({ companies }) {
  const [activeTab, setActiveTab] = useState('verify');

  // ── Verify tab state ──
  const [selectedTicker, setSelectedTicker] = useState(companies?.[0]?.ticker || '');
  const [availableQuarters, setAvailableQuarters] = useState([]);
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [claimsJson, setClaimsJson] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [quartersData, setQuartersData] = useState([]);
  const [transcriptSource, setTranscriptSource] = useState(null);

  // ── Search tab state ──
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const sampleClaims = {
    AAPL: [
      { speaker: "Tim Cook", role: "CEO", text: "Our Q4 revenue came in at $95.3 billion", metric: "Revenue", claimed: 95.3, unit: "billion" },
      { speaker: "Tim Cook", role: "CEO", text: "Revenue grew 6% year over year", metric: "Revenue", claimed: 6, unit: "percent", type: "yoy_percent" },
      { speaker: "Luca Maestri", role: "CFO", text: "Operating income came in at $31.5 billion", metric: "Operating Income", claimed: 31.5, unit: "billion" },
      { speaker: "Tim Cook", role: "CEO", text: "Our gross margin expanded to 46.2%", metric: "Gross Margin", claimed: 46.2, unit: "percent" }
    ],
    NVDA: [
      { speaker: "Jensen Huang", role: "CEO", text: "Revenue for the quarter was $22.1 billion", metric: "Revenue", claimed: 22.1, unit: "billion" },
      { speaker: "Jensen Huang", role: "CEO", text: "Revenue was up 265% from a year ago", metric: "Revenue", claimed: 265, unit: "percent", type: "yoy_percent" },
      { speaker: "Colette Kress", role: "CFO", text: "Net income grew 33% year over year", metric: "Net Income", claimed: 33, unit: "percent", type: "yoy_percent" },
      { speaker: "Colette Kress", role: "CFO", text: "Gross margin came in at 76.2%", metric: "Gross Margin", claimed: 76.2, unit: "percent" }
    ],
    MSFT: [
      { speaker: "Satya Nadella", role: "CEO", text: "Revenue was $62.0 billion", metric: "Revenue", claimed: 62.0, unit: "billion" },
      { speaker: "Satya Nadella", role: "CEO", text: "Revenue grew 18% year-over-year", metric: "Revenue", claimed: 18, unit: "percent", type: "yoy_percent" },
      { speaker: "Amy Hood", role: "CFO", text: "Operating income increased to $27.2 billion", metric: "Operating Income", claimed: 27.2, unit: "billion" },
      { speaker: "Amy Hood", role: "CFO", text: "EPS grew 21% year over year", metric: "EPS", claimed: 21, unit: "percent", type: "yoy_percent" }
    ]
  };

  const loadSampleClaims = () => {
    const samples = sampleClaims[selectedTicker] || sampleClaims.AAPL;
    setClaimsJson(JSON.stringify(samples, null, 2));
    setVerifyError(null);
  };

  const handleVerify = async () => {
    if (!selectedTicker || !selectedQuarter) {
      setVerifyError('Please select a company and quarter');
      return;
    }
    let claims;
    // Auto-use sample claims if no JSON provided
    if (!claimsJson || claimsJson.trim() === '' || claimsJson.trim() === '[]') {
      claims = sampleClaims[selectedTicker] || sampleClaims.AAPL;
      setClaimsJson(JSON.stringify(claims, null, 2));
    } else {
      try {
        claims = JSON.parse(claimsJson);
        if (!Array.isArray(claims) || claims.length === 0) {
          claims = sampleClaims[selectedTicker] || sampleClaims.AAPL;
          setClaimsJson(JSON.stringify(claims, null, 2));
        }
      } catch (e) {
        setVerifyError('Invalid JSON format');
        return;
      }
    }
    setVerifying(true);
    setVerifyError(null);
    setVerificationResult(null);
    try {
      const result = await apiClient.verifyClaims(selectedTicker, selectedQuarter, claims);
      setVerificationResult(result);
      setActiveTab('search');
    } catch (e) {
      const mockClaims = getMockClaims(selectedTicker, selectedQuarter);
      if (mockClaims && mockClaims.length > 0) {
        setVerificationResult({
          ticker: selectedTicker, quarter: selectedQuarter, claims: mockClaims,
          summary: { total: mockClaims.length, verified: mockClaims.filter(c => c.status === 'verified').length, discrepancies: mockClaims.filter(c => c.status === 'minor_discrepancy').length, failed: mockClaims.filter(c => c.status === 'failed').length },
          data_source: 'mock_fallback'
        });
        setVerifyError('Using sample data - API unavailable');
        setActiveTab('search');
      } else {
        setVerifyError(e?.message || 'Verification failed');
      }
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (!selectedTicker && companies?.length) setSelectedTicker(companies[0].ticker);
  }, [companies]);

  useEffect(() => {
    let cancelled = false;
    async function loadQuarters() {
      if (!selectedTicker) return;
      try {
        const resp = await apiClient.getCompanyQuarters(selectedTicker);
        const quarters = resp?.quarters || [];
        if (!cancelled) {
          setQuartersData(quarters);
          const q = quarters.map((x) => x.quarter);
          setAvailableQuarters(q);
          setSelectedQuarter((prev) => prev || q?.[0] || '');
          if (quarters.length > 0) {
            const src = quarters[0].transcript || quarters[0].transcriptSource;
            if (src) setTranscriptSource(src);
          }
        }
      } catch (e) {
        if (!cancelled) {
          const mockQuarters = ['Q4 2025', 'Q3 2025', 'Q2 2025', 'Q1 2025'];
          setAvailableQuarters(mockQuarters);
          setSelectedQuarter((prev) => prev || mockQuarters[0] || '');
          const mockSource = getMockTranscript(selectedTicker, mockQuarters[0]);
          setTranscriptSource(mockSource);
        }
      }
    }
    loadQuarters();
    return () => { cancelled = true; };
  }, [selectedTicker]);

  useEffect(() => {
    if (!selectedQuarter || !quartersData.length) return;
    const quarterData = quartersData.find(q => q.quarter === selectedQuarter);
    const src = quarterData?.transcript || quarterData?.transcriptSource;
    if (src) {
      setTranscriptSource(src);
    } else {
      const mockSource = getMockTranscript(selectedTicker, selectedQuarter);
      setTranscriptSource(mockSource);
    }
  }, [selectedQuarter, quartersData, selectedTicker]);

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
      case 'accurate': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'discrepant': return <XCircle className="h-5 w-5 text-red-400" />;
      default: return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold mb-1">Claims Explorer</h2>
        <p className="text-sm text-gray-500">Extract quantitative claims from earnings calls and verify against SEC EDGAR filings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {[{ id: 'verify', label: 'Verify Claims', Icon: Zap }, { id: 'search', label: 'Search Results', Icon: Search }].map((tab) => {
          const Icon = tab.Icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                  : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500'
              }`}>
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.id === 'search' && verifiedClaims.length > 0 && (
                <span className="bg-cyan-400 text-black rounded-full px-2 py-0 text-[10px] font-extrabold ml-1">{verifiedClaims.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ VERIFY TAB ═══ */}
      {activeTab === 'verify' && (
        <div className="card p-5 space-y-4">
          {/* Company / Quarter / Run Verification — single row */}
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Company</label>
              <select
                value={selectedTicker}
                onChange={(e) => { setSelectedTicker(e.target.value); setVerificationResult(null); setVerifyError(null); }}
                className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                {companies?.length > 0 ? (
                  companies.map((company) => (
                    <option key={company.ticker} value={company.ticker}>{company.ticker} — {company.name}</option>
                  ))
                ) : (
                  <option value="">Loading companies...</option>
                )}
              </select>
            </div>
            <div className="min-w-[140px]">
              <label className="block text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Quarter</label>
              <select
                value={selectedQuarter}
                onChange={(e) => { setSelectedQuarter(e.target.value); setVerificationResult(null); setVerifyError(null); }}
                className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                {availableQuarters.map((q) => (<option key={q} value={q}>{q}</option>))}
              </select>
            </div>
            <button
              onClick={handleVerify}
              disabled={!selectedTicker || !selectedQuarter || verifying}
              className="px-6 py-2.5 rounded-lg font-bold text-sm text-black whitespace-nowrap flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: verifying ? '#475569' : 'linear-gradient(135deg, #22d3ee, #6366f1)' }}
            >
              <Zap className="h-4 w-4" />
              {verifying ? 'Analyzing...' : 'Run Verification'}
            </button>
          </div>

          {/* Loading indicator */}
          {verifying && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-sm text-cyan-400">
              <Zap className="h-4 w-4 animate-pulse" /> Verifying claims against SEC EDGAR data...
            </div>
          )}

          {/* Error */}
          {verifyError && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">{verifyError}</div>
          )}

          {/* How it works */}
          <div className="px-4 py-3 rounded-lg bg-gray-900 border border-gray-800">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong className="text-gray-400">How it works:</strong> Uses sample earnings call claims for the selected company based on actual SEC financial data, then independently verifies each claim against the structured XBRL filings. Claims are classified as Accurate, Minor Discrepancy, Major Discrepancy, Misleading, or Unverifiable.
            </p>
          </div>

          {/* Summary after verification */}
          {verificationResult?.summary && (
            <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-sm">
              <span className="text-gray-400 font-semibold">Results:</span>
              <span className="text-green-400">✓ {verificationResult.summary.accurate} accurate</span>
              <span className="text-red-400">✗ {verificationResult.summary.discrepant} discrepant</span>
              <span className="text-gray-500">? {verificationResult.summary.unverifiable} unverifiable</span>
              <span className="text-cyan-400 font-bold">{verificationResult.summary.accuracyScore}%</span>
              <button onClick={() => setActiveTab('search')} className="ml-auto text-cyan-400 hover:text-cyan-300 text-xs font-semibold">View results →</button>
            </div>
          )}
        </div>
      )}

      {/* ═══ SEARCH TAB ═══ */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {verifiedClaims.length === 0 ? (
            <div className="card p-12 text-center">
              <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No verified claims yet</p>
              <p className="text-gray-500 text-sm mt-2 mb-4">Go to the Verify tab to submit claims first</p>
              <button onClick={() => setActiveTab('verify')} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                Go to Verify Claims
              </button>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <div />
                </div>

                {statusFilter === 'discrepant' && (
                  <div className="mt-4">
                    <label className="block text-sm text-gray-400 mb-2 font-medium">Severity Level</label>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'high', 'moderate', 'low'].map(severity => (
                        <button
                          key={severity}
                          onClick={() => setSeverityFilter(severity)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            severityFilter === severity ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-600 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Showing <span className="font-semibold text-white">{filteredClaims.length}</span> of <span className="font-semibold text-white">{verifiedClaims.length}</span> claims
                  </span>
                  {(searchTerm || statusFilter !== 'all' || severityFilter !== 'all') && (
                    <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); setSeverityFilter('all'); }} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
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
                  filteredClaims.map((claim) => {
                    const sev = SEVERITY_CONFIG[claim.status] || SEVERITY_CONFIG.unverifiable;
                    const isYoY = claim.type === 'yoy_percent' || claim.type === 'yoy_growth';
                    const fmtClaimed = isYoY ? `${claim.claimed}%` : `${claim.unit === 'billion' ? '$' : ''}${claim.claimed}${claim.unit === 'billion' ? 'B' : claim.unit === 'percent' ? '%' : ''}`;
                    const fmtActual = isYoY ? `${claim.actual}%` : `${claim.unit === 'billion' ? '$' : ''}${claim.actual}${claim.unit === 'billion' ? 'B' : claim.unit === 'percent' ? '%' : ''}`;
                    return (
                      <div key={claim.id} className={`rounded-xl p-4 border ${sev.bg} ${sev.border}`}>
                        <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${sev.badgeBg} ${sev.text}`}>
                              {sev.icon} {sev.label}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-semibold">{claim.metric}</span>
                            {isYoY && <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/30 text-purple-400 font-semibold">YoY</span>}
                            <span className="text-[10px] text-gray-500">{claim.quarter}</span>
                          </div>
                          {claim.percentDiff != null && (
                            <span className={`text-xs font-bold tabular-nums ${sev.text}`}>
                              {claim.percentDiff > 0 ? '+' : ''}{claim.percentDiff.toFixed(1)}% diff
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed mb-2">&quot;{claim.text}&quot;</p>
                        <div className="text-xs text-gray-400 mb-3">
                          <strong className="text-gray-300">Speaker:</strong> {claim.speaker} {claim.role ? `(${claim.role})` : ''}
                        </div>
                        {claim.actual != null && (
                          <div className="flex gap-5 px-3 py-2 rounded-lg bg-gray-900/60 text-xs text-gray-400">
                            <span>Claimed: <strong className="text-white">{fmtClaimed}</strong></span>
                            <span>SEC Actual: <strong className="text-cyan-400">{fmtActual}</strong></span>
                          </div>
                        )}
                        {claim.flag && (
                          <p className={`text-xs mt-2 pt-2 border-t border-gray-700/30 italic ${sev.text}`}>
                            {claim.flag.replace(/_/g, ' ')} — {claim.severity} severity
                          </p>
                        )}
                        {claim.reason && (
                          <p className="text-xs text-gray-500 mt-1 italic">{claim.reason}</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ClaimExplorer;
