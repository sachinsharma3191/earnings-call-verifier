import React, { useEffect, useMemo, useState } from 'react';
import { Search, CheckCircle, XCircle, AlertTriangle, FileText, Zap } from 'lucide-react';
import { apiClient } from '../utils/apiClient';
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
  const [transcriptText, setTranscriptText] = useState('');
  const [extractedClaims, setExtractedClaims] = useState([]);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [quartersData, setQuartersData] = useState([]);
  const [extracting, setExtracting] = useState(false);

  // ── Search tab state ──
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTickerFilter, setSearchTickerFilter] = useState('');
  const [searchQuarterFilter, setSearchQuarterFilter] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Extract claims from current transcript (backend regex + heuristics)
  const handleExtract = async () => {
    if (!selectedTicker || !selectedQuarter) {
      setVerifyError('Please select a company and quarter');
      return;
    }
    if (!transcriptText || transcriptText.trim().length < 20) {
      setVerifyError('Transcript is empty or too short to extract claims');
      return;
    }
    setExtracting(true);
    setVerifyError(null);
    setExtractedClaims([]);
    try {
      const resp = await apiClient.extractClaims(transcriptText, selectedTicker, selectedQuarter);
      setExtractedClaims(resp?.claims || []);
    } catch (e) {
      setVerifyError(e?.message || 'Extraction failed');
    } finally {
      setExtracting(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedTicker || !selectedQuarter) {
      setVerifyError('Please select a company and quarter');
      return;
    }
    setVerifying(true);
    setVerifyError(null);
    setVerificationResult(null);
    try {
      // Prefer verifying directly from transcript so backend can extract + verify in one step
      const result = await apiClient.verifyTranscript(transcriptText, selectedTicker, selectedQuarter);
      setVerificationResult(result);
      // Store verified claims to backend cache
      try {
        await apiClient.storeClaims(selectedTicker, selectedQuarter, result.claims || [], result.summary);
      } catch (storeErr) { console.warn('Failed to store claims:', storeErr); }
    } catch (e) {
      setVerifyError(e?.message || 'Verification failed');
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
        }
      } catch (e) {
        if (!cancelled) {
          setAvailableQuarters([]);
          setSelectedQuarter('');
        }
      }
    }
    loadQuarters();
    return () => { cancelled = true; };
  }, [selectedTicker]);

  useEffect(() => {
    let cancelled = false;
    async function loadTranscript() {
      if (!selectedTicker || !selectedQuarter) return;
      setTranscriptText('');
      setExtractedClaims([]);
      try {
        const resp = await apiClient.getTranscript(selectedTicker, selectedQuarter);
        if (!cancelled) setTranscriptText(resp?.transcriptText || '');
      } catch (e) {
        try {
          const m = await apiClient.getQuarterMetrics(selectedTicker, selectedQuarter);
          if (!cancelled) setTranscriptText(m?.transcript || '');
        } catch (_) {
          if (!cancelled) setTranscriptText('');
        }
      }
    }
    loadTranscript();
    return () => { cancelled = true; };
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

  // Load claims from backend — only triggered by explicit Search button click
  const loadSearchClaims = async () => {
    setSearchLoading(true);
    setHasSearched(true);
    try {
      const params = { limit: 50, offset: 0 };
      if (searchTickerFilter) params.ticker = searchTickerFilter;
      if (searchQuarterFilter) params.quarter = searchQuarterFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (severityFilter !== 'all') params.severity = severityFilter;
      if (searchTerm) params.text = searchTerm;
      const resp = await apiClient.searchClaims(params);
      setSearchResults(resp?.claims || []);
      setSearchTotal(resp?.total || 0);
    } catch (e) {
      console.warn('Search failed:', e);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

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
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id === 'verify') { setSearchResults([]); setSearchTotal(0); setHasSearched(false); } }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                  : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500'
              }`}>
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.id === 'search' && searchTotal > 0 && (
                <span className="bg-cyan-400 text-black rounded-full px-2 py-0 text-[10px] font-extrabold ml-1">{searchTotal}</span>
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

          {/* Transcript input + actions */}
          <div className="space-y-2">
            <label className="block text-[11px] text-gray-500 font-semibold uppercase tracking-wide">Transcript</label>
            <textarea
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              rows={10}
              placeholder="Transcript text will load here if available. You can edit or paste your own."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleExtract}
                disabled={extracting || !transcriptText}
                className="px-4 py-2 rounded-lg font-bold text-xs text-black flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: extracting ? '#475569' : 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
              >
                <FileText className="h-4 w-4" /> {extracting ? 'Extracting...' : 'Extract Claims'}
              </button>
              <button
                onClick={handleVerify}
                disabled={verifying || !selectedTicker || !selectedQuarter}
                className="px-4 py-2 rounded-lg font-bold text-xs text-black flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: verifying ? '#475569' : 'linear-gradient(135deg, #22d3ee, #6366f1)' }}
              >
                <Zap className="h-4 w-4" /> {verifying ? 'Verifying...' : 'Verify Claims'}
              </button>
            </div>
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
              <strong className="text-gray-400">How it works:</strong> Transcript → extract quantitative claims (regex + heuristics) → verify each claim against cached SEC EDGAR XBRL metrics. No hardcoded claims.
            </p>
          </div>

          {/* Extracted claims preview */}
          {extractedClaims && extractedClaims.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Extracted {extractedClaims.length} claims</div>
              <div className="space-y-2">
                {extractedClaims.map((c, i) => (
                  <div key={i} className="rounded-lg p-3 border bg-gray-900 border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-semibold">{c.metric}</span>
                      {c.type && <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/30 text-cyan-400 font-semibold">{c.type}</span>}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">"{c.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary + inline results after verification */}
          {verificationResult?.summary && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-sm">
                <span className="text-gray-400 font-semibold">Results:</span>
                <span className="text-green-400">✓ {verificationResult.summary.accurate} accurate</span>
                <span className="text-red-400">✗ {verificationResult.summary.discrepant} discrepant</span>
                <span className="text-gray-500">? {verificationResult.summary.unverifiable} unverifiable</span>
                <span className="text-cyan-400 font-bold">{verificationResult.summary.accuracyScore}%</span>
                <button onClick={() => setActiveTab('search')} className="ml-auto text-cyan-400 hover:text-cyan-300 text-xs font-semibold">Search all claims →</button>
              </div>
              {/* Inline claim cards on verify tab */}
              <div className="space-y-2">
                {verifiedClaims.map((claim, i) => {
                  const sev = SEVERITY_CONFIG[claim.status] || SEVERITY_CONFIG.unverifiable;
                  return (
                    <div key={i} className={`rounded-lg p-3 border ${sev.bg} ${sev.border}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${sev.badgeBg} ${sev.text}`}>{sev.icon} {sev.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-semibold">{claim.metric}</span>
                        {claim.percentDiff != null && (
                          <span className={`text-[10px] font-bold ml-auto tabular-nums ${sev.text}`}>{claim.percentDiff > 0 ? '+' : ''}{claim.percentDiff.toFixed(1)}%</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">&quot;{claim.text}&quot;</p>
                      {claim.actual != null && (
                        <div className="flex gap-4 mt-1 text-[10px] text-gray-500">
                          <span>Claimed: <strong className="text-white">{claim.claimed}</strong></span>
                          <span>Actual: <strong className="text-cyan-400">{claim.actual}</strong></span>
                          <span className="text-gray-600">{claim.speaker}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ SEARCH TAB ═══ */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="card p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search text, speaker, metric..."
                    className="w-full pl-8 pr-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-1">Company</label>
                <select value={searchTickerFilter} onChange={(e) => setSearchTickerFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500">
                  <option value="">All Companies</option>
                  {companies?.map((c) => <option key={c.ticker} value={c.ticker}>{c.ticker}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-1">Quarter</label>
                <select value={searchQuarterFilter} onChange={(e) => setSearchQuarterFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500">
                  <option value="">All Quarters</option>
                  {['Q4 2025', 'Q3 2025', 'Q2 2025', 'Q1 2025'].map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-1">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500">
                  <option value="all">All Status</option>
                  <option value="accurate">Accurate</option>
                  <option value="discrepant">Discrepant</option>
                  <option value="unverifiable">Unverifiable</option>
                </select>
              </div>
              <div>
                <button onClick={loadSearchClaims} disabled={searchLoading}
                  className="w-full px-4 py-2 rounded-lg font-bold text-sm text-black flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                  style={{ background: searchLoading ? '#475569' : 'linear-gradient(135deg, #22d3ee, #6366f1)' }}>
                  <Search className="h-3.5 w-3.5" />
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
            {hasSearched && (
              <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  Showing <strong className="text-white">{searchResults.length}</strong> of <strong className="text-white">{searchTotal}</strong> stored claims
                </span>
                {(searchTerm || searchTickerFilter || searchQuarterFilter || statusFilter !== 'all') && (
                  <button onClick={() => { setSearchTerm(''); setSearchTickerFilter(''); setSearchQuarterFilter(''); setStatusFilter('all'); setSeverityFilter('all'); setSearchResults([]); setSearchTotal(0); setHasSearched(false); }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold">Clear Filters</button>
                )}
              </div>
            )}
          </div>

          {/* Results */}
          {!hasSearched ? (
            <div className="card p-12 text-center">
              <Search className="h-12 w-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-semibold">Search Verified Claims</p>
              <p className="text-gray-600 text-sm mt-2">Select filters above and click <strong className="text-cyan-400">Search</strong> to find stored claims</p>
            </div>
          ) : searchLoading ? (
            <div className="text-center text-gray-400 py-8 text-sm">Searching claims...</div>
          ) : searchResults.length === 0 ? (
            <div className="card p-10 text-center">
              <Search className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No claims found matching your filters</p>
              <p className="text-gray-600 text-xs mt-1 mb-3">Try different filters or run verification on the Verify tab first</p>
              <button onClick={() => setActiveTab('verify')} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors">
                Go to Verify Claims
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((claim, i) => {
                const sev = SEVERITY_CONFIG[claim.status] || SEVERITY_CONFIG.unverifiable;
                const isYoY = claim.type === 'yoy_percent' || claim.type === 'yoy_growth';
                const fmtClaimed = isYoY ? `${claim.claimed}%` : `${claim.unit === 'billion' ? '$' : ''}${claim.claimed}${claim.unit === 'billion' ? 'B' : claim.unit === 'percent' ? '%' : ''}`;
                const fmtActual = isYoY ? `${claim.actual}%` : `${claim.unit === 'billion' ? '$' : ''}${claim.actual}${claim.unit === 'billion' ? 'B' : claim.unit === 'percent' ? '%' : ''}`;
                return (
                  <div key={`${claim.batchId}_${i}`} className={`rounded-xl p-4 border ${sev.bg} ${sev.border}`}>
                    <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${sev.badgeBg} ${sev.text}`}>
                          {sev.icon} {sev.label}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/30 text-cyan-400 font-bold">{claim.ticker}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-semibold">{claim.metric}</span>
                        <span className="text-[10px] text-gray-500">{claim.quarter}</span>
                      </div>
                      {claim.percentDiff != null && (
                        <span className={`text-xs font-bold tabular-nums ${sev.text}`}>
                          {claim.percentDiff > 0 ? '+' : ''}{claim.percentDiff.toFixed(1)}% diff
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed mb-2">&quot;{claim.text}&quot;</p>
                    <div className="text-xs text-gray-400 mb-2">
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ClaimExplorer;
