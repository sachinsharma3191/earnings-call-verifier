import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertTriangle, User, Building, PlayCircle, FileText } from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { getMockClaims, getMockTranscript } from '../data/mockTranscripts';

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

  const sampleClaims = {
    AAPL: [
      {
        speaker: "Tim Cook",
        role: "CEO",
        text: "Our Q4 revenue came in at $95.3 billion, representing growth of 6% year over year",
        metric: "Revenue",
        claimed: 95.3,
        unit: "billion"
      },
      {
        speaker: "Luca Maestri",
        role: "CFO",
        text: "Operating income came in at $31.5 billion, representing an operating margin of 33.1%",
        metric: "Operating Income",
        claimed: 31.5,
        unit: "billion"
      },
      {
        speaker: "Tim Cook",
        role: "CEO",
        text: "Our gross margin expanded to 46.2%, up 150 basis points year over year",
        metric: "Gross Margin",
        claimed: 46.2,
        unit: "percent"
      }
    ],
    NVDA: [
      {
        speaker: "Jensen Huang",
        role: "CEO",
        text: "Revenue for the quarter was $22.1 billion, up 265% from a year ago",
        metric: "Revenue",
        claimed: 22.1,
        unit: "billion"
      },
      {
        speaker: "Colette Kress",
        role: "CFO",
        text: "Gross margin came in at 76.2%, reflecting strong demand for our data center products",
        metric: "Gross Margin",
        claimed: 76.2,
        unit: "percent"
      }
    ],
    MSFT: [
      {
        speaker: "Satya Nadella",
        role: "CEO",
        text: "Revenue was $62.0 billion, up 18% year-over-year",
        metric: "Revenue",
        claimed: 62.0,
        unit: "billion"
      },
      {
        speaker: "Amy Hood",
        role: "CFO",
        text: "Operating income increased to $27.2 billion",
        metric: "Operating Income",
        claimed: 27.2,
        unit: "billion"
      }
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
    try {
      claims = JSON.parse(claimsJson || '[]');
      if (!Array.isArray(claims) || claims.length === 0) {
        setVerifyError('Please provide valid claims JSON array');
        return;
      }
    } catch (e) {
      setVerifyError('Invalid JSON format');
      return;
    }

    setVerifying(true);
    setVerifyError(null);
    setVerificationResult(null);

    try {
      const result = await apiClient.verifyClaims(selectedTicker, selectedQuarter, claims);
      setVerificationResult(result);
    } catch (e) {
      // Fallback to mock claims when API fails
      const mockClaims = getMockClaims(selectedTicker, selectedQuarter);
      if (mockClaims && mockClaims.length > 0) {
        setVerificationResult({
          ticker: selectedTicker,
          quarter: selectedQuarter,
          claims: mockClaims,
          summary: {
            total: mockClaims.length,
            verified: mockClaims.filter(c => c.status === 'verified').length,
            discrepancies: mockClaims.filter(c => c.status === 'minor_discrepancy').length,
            failed: mockClaims.filter(c => c.status === 'failed').length
          },
          data_source: 'mock_fallback'
        });
        setVerifyError('Using sample data - API unavailable');
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

  const [quartersData, setQuartersData] = useState([]);
  const [transcriptSource, setTranscriptSource] = useState(null);

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
          
          // Set transcript source for first quarter
          if (quarters.length > 0 && quarters[0].transcriptSource) {
            setTranscriptSource(quarters[0].transcriptSource);
          }
        }
      } catch (e) {
        // Fallback to mock data when API fails
        if (!cancelled) {
          const mockQuarters = ['Q4 2025', 'Q3 2025', 'Q2 2025', 'Q1 2025'];
          setAvailableQuarters(mockQuarters);
          setSelectedQuarter((prev) => prev || mockQuarters[0] || '');
          
          // Fallback to mock transcript source
          const mockSource = getMockTranscript(selectedTicker, mockQuarters[0]);
          setTranscriptSource(mockSource);
        }
      }
    }
    loadQuarters();
    return () => {
      cancelled = true;
    };
  }, [selectedTicker]);

  // Update transcript source when quarter changes
  useEffect(() => {
    if (!selectedQuarter || !quartersData.length) return;
    
    const quarterData = quartersData.find(q => q.quarter === selectedQuarter);
    if (quarterData?.transcriptSource) {
      setTranscriptSource(quarterData.transcriptSource);
    } else {
      // Fallback to mock
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

      {/* Interactive Steps Guide */}
      {!verificationResult && (
        <div className="card p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <PlayCircle className="h-5 w-5 mr-2 text-blue-400" />
            Quick Start Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <div className="font-semibold text-white mb-1">Select Company & Quarter</div>
                <div className="text-gray-400">Choose a company and reporting period to verify</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <div className="font-semibold text-white mb-1">Add Claims JSON</div>
                <div className="text-gray-400">Paste claims or use sample data to get started</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <div className="font-semibold text-white mb-1">Verify Claims</div>
                <div className="text-gray-400">Click verify to cross-check against SEC data</div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              {companies?.length > 0 ? (
                companies.map((company) => (
                  <option key={company.ticker} value={company.ticker}>
                    {company.ticker}{company.name ? ` - ${company.name}` : ''}
                  </option>
                ))
              ) : (
                <option value="">Loading companies...</option>
              )}
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
              onClick={handleVerify}
              disabled={!selectedTicker || !selectedQuarter || verifying}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              {verifying ? 'Verifying...' : 'Verify Claims'}
            </button>
          </div>
        </div>

        {/* Transcript Source Attribution */}
        {transcriptSource && (
          <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs text-gray-400 mb-1">Transcript Source</div>
                <div className="text-sm text-white font-medium">{transcriptSource.source || 'Unknown'}</div>
                {transcriptSource.type === 'proxy' && (
                  <div className="mt-1 text-xs text-yellow-400 flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Proxy Document (SEC 10-Q/10-K MD&A) - Full transcript unavailable</span>
                  </div>
                )}
                {transcriptSource.type === 'transcript' && (
                  <div className="mt-1 text-xs text-green-400">Full earnings call transcript</div>
                )}
                {transcriptSource.note && (
                  <div className="mt-1 text-xs text-gray-500">{transcriptSource.note}</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm text-gray-400 font-medium">Claims JSON (from Claude Skill)</label>
            <button
              onClick={loadSampleClaims}
              className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center space-x-1"
            >
              <PlayCircle className="h-4 w-4" />
              <span>Load Sample Claims</span>
            </button>
          </div>
          <textarea
            value={claimsJson}
            onChange={(e) => setClaimsJson(e.target.value)}
            rows={8}
            placeholder='Paste an array of claims here: [{"speaker":"CEO Name","role":"CEO","metric":"Revenue","claimed":29.1,"unit":"billion","text":"..."}]'
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          {verifyError && <div className="mt-3 text-sm text-red-300">{verifyError}</div>}
          {verificationResult?.summary && (
            <div className="mt-3 space-y-2">
              <div className="text-sm text-gray-300">
                <span className="font-semibold">Overall Summary:</span>
                <span className="ml-2 text-green-400">✓ {verificationResult.summary.accurate} accurate</span>
                <span className="ml-2 text-red-400">✗ {verificationResult.summary.discrepant} discrepant</span>
                <span className="ml-2 text-gray-400">? {verificationResult.summary.unverifiable} unverifiable</span>
                <span className="ml-2 text-blue-300 font-semibold">{verificationResult.summary.accuracyScore}% accuracy</span>
              </div>
              {verificationResult.summary.byExecutive && verificationResult.summary.byExecutive.length > 0 && (
                <div className="text-sm text-gray-300 pt-2 border-t border-gray-700">
                  <span className="font-semibold">By Executive:</span>
                  <div className="mt-2 space-y-1">
                    {verificationResult.summary.byExecutive.map((exec, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-800/50 px-3 py-2 rounded">
                        <div>
                          <span className="text-white font-medium">{exec.speaker}</span>
                          <span className="text-gray-400 text-xs ml-2">({exec.role})</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-gray-400">{exec.totalClaims} claims</span>
                          <span className="text-green-400 text-xs">✓ {exec.accurate}</span>
                          <span className="text-red-400 text-xs">✗ {exec.discrepant}</span>
                          <span className={`text-xs font-semibold ${
                            exec.accuracyScore >= 80 ? 'text-green-400' :
                            exec.accuracyScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                          }`}>{exec.accuracyScore}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              <div className="mb-4">
                <p className="text-gray-300 leading-relaxed italic">"{claim.text}"</p>
                {claim.context && (
                  <p className="text-xs text-gray-500 mt-2">Context: {claim.context}</p>
                )}
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
