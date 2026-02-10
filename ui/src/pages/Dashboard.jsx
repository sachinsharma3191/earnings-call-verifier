import React, { useState, useEffect, useMemo } from 'react';
import { FileText, ChevronRight, Database, Building2, AlertTriangle, Search, ArrowUpDown, RefreshCw } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

const SORT_OPTIONS = [
  { key: 'ticker', label: 'Ticker' },
  { key: 'name', label: 'Name' },
  { key: 'latestQuarter', label: 'Quarter' },
];

const DISC_SORT_OPTIONS = [
  { key: 'pctDiff', label: '% Diff' },
  { key: 'ticker', label: 'Ticker' },
  { key: 'severity', label: 'Severity' },
  { key: 'metric', label: 'Metric' },
];

function Dashboard({ companies, loading, error, onSelectCompany }) {
  const totalCompanies = companies?.length || 0;
  const companiesLoaded = companies?.filter((c) => !c.error)?.length || 0;
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('ticker');
  const [sortAsc, setSortAsc] = useState(true);
  const [discSearch, setDiscSearch] = useState('');
  const [discSortKey, setDiscSortKey] = useState('pctDiff');
  const [discSortAsc, setDiscSortAsc] = useState(false);
  const [discrepancies, setDiscrepancies] = useState([]);
  const [discLoading, setDiscLoading] = useState(true);
  const [discRefreshing, setDiscRefreshing] = useState(false);

  const fetchDiscrepancies = async () => {
    setDiscRefreshing(true);
    try {
      const resp = await apiClient.getTopDiscrepancies(10);
      setDiscrepancies(resp?.discrepancies || []);
    } catch (e) {
      // non-fatal
    } finally {
      setDiscLoading(false);
      setDiscRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDiscrepancies();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = (companies || []).filter((c) => {
      if (!q) return true;
      return (
        c.ticker?.toLowerCase().includes(q) ||
        c.name?.toLowerCase().includes(q) ||
        c.cik?.toString().includes(q)
      );
    });
    list.sort((a, b) => {
      const va = (a[sortKey] || '').toString().toLowerCase();
      const vb = (b[sortKey] || '').toString().toLowerCase();
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [companies, search, sortKey, sortAsc]);

  const filteredDisc = useMemo(() => {
    const q = discSearch.toLowerCase().trim();
    let list = (discrepancies || []).filter((d) => {
      if (!q) return true;
      return (
        d.ticker.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.metric.toLowerCase().includes(q) ||
        d.speaker.toLowerCase().includes(q) ||
        d.severity.toLowerCase().includes(q)
      );
    });
    list.sort((a, b) => {
      if (discSortKey === 'pctDiff') {
        return discSortAsc ? a.pctDiff - b.pctDiff : b.pctDiff - a.pctDiff;
      }
      const va = (a[discSortKey] || '').toString().toLowerCase();
      const vb = (b[discSortKey] || '').toString().toLowerCase();
      return discSortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [discrepancies, discSearch, discSortKey, discSortAsc]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleDiscSort = (key) => {
    if (discSortKey === key) {
      setDiscSortAsc(!discSortAsc);
    } else {
      setDiscSortKey(key);
      setDiscSortAsc(key === 'pctDiff' ? false : true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center animate-slide-up">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">Verify Executive Claims</span>
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Automatically cross-reference earnings call statements with official SEC filings to detect discrepancies and misleading claims
        </p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => document.getElementById('companies-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="stat-card cursor-pointer hover:scale-[1.03] hover:border-blue-500/50 transition-all duration-200 group"
          title="Click to view companies"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Companies</span>
            <FileText className="h-5 w-5 text-blue-400 group-hover:scale-125 transition-transform" />
          </div>
          <div className="text-3xl font-bold">{totalCompanies}</div>
          <p className="text-xs text-gray-500 mt-2 group-hover:text-blue-400 transition-colors">Click to browse companies</p>
        </div>

        <div
          onClick={() => document.getElementById('companies-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="stat-card border-green-500/30 cursor-pointer hover:scale-[1.03] hover:border-green-500/50 transition-all duration-200 group"
          title="Click to view loaded companies"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Loaded</span>
            <Database className="h-5 w-5 text-green-400 group-hover:scale-125 transition-transform" />
          </div>
          <div className="text-3xl font-bold text-green-400">{companiesLoaded}</div>
          <p className="text-xs text-gray-500 mt-2 group-hover:text-green-400 transition-colors">Click to browse companies</p>
        </div>

        <div
          onClick={() => document.getElementById('discrepancies-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="stat-card border-yellow-500/30 cursor-pointer hover:scale-[1.03] hover:border-yellow-500/50 transition-all duration-200 group"
          title="Click to view discrepancies"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Quarters</span>
            <Building2 className="h-5 w-5 text-yellow-400 group-hover:scale-125 transition-transform" />
          </div>
          <div className="text-3xl font-bold text-yellow-400">4</div>
          <p className="text-xs text-gray-500 mt-2 group-hover:text-yellow-400 transition-colors">Click to view discrepancies</p>
        </div>

        <a
          href="https://claude.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="stat-card border-purple-500/30 cursor-pointer hover:scale-[1.03] hover:border-purple-500/50 transition-all duration-200 group no-underline"
          title="Open Claude AI for claim extraction"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Claims</span>
            <FileText className="h-5 w-5 text-purple-400 group-hover:scale-125 transition-transform" />
          </div>
          <div className="text-3xl font-bold text-purple-400">Claude Skill</div>
          <p className="text-xs text-gray-500 mt-2 group-hover:text-purple-400 transition-colors">Click to open Claude AI ↗</p>
        </a>
      </div>

      {/* Top 5 Discrepancies */}
      <div id="discrepancies-section" className="card p-6 bg-red-900/5 border-red-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <h3 className="text-lg font-semibold flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-400" />
            <span className="text-red-300">Top Discrepancies Detected</span>
            <button
              onClick={fetchDiscrepancies}
              className="ml-3 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
              title="Refresh discrepancies"
            >
              <RefreshCw className={`h-4 w-4 ${discRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search ticker, metric, speaker..."
                value={discSearch}
                onChange={(e) => setDiscSearch(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex items-center gap-1">
              {DISC_SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleDiscSort(opt.key)}
                  className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    discSortKey === opt.key
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {opt.label}
                  {discSortKey === opt.key && <ArrowUpDown className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {discLoading && (
          <div className="text-center text-gray-400 py-4">Loading discrepancies from SEC data...</div>
        )}

        {!discLoading && filteredDisc.length === 0 && discSearch && (
          <div className="text-center text-gray-400 py-4">No discrepancies match "{discSearch}"</div>
        )}

        {!discLoading && filteredDisc.length === 0 && !discSearch && (
          <div className="text-center py-6">
            <p className="text-gray-400 mb-3">No discrepancies detected yet. Cache may still be loading.</p>
            <button
              onClick={fetchDiscrepancies}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${discRefreshing ? 'animate-spin' : ''}`} />
              {discRefreshing ? 'Loading...' : 'Refresh Discrepancies'}
            </button>
          </div>
        )}

        <div className={`space-y-3 transition-opacity duration-300 ${discRefreshing ? 'opacity-40' : 'opacity-100'}`}>
          {discRefreshing && filteredDisc.length > 0 && (
            <div className="text-center text-gray-400 text-sm py-2 animate-pulse">Refreshing data...</div>
          )}
          {!discLoading && filteredDisc.map((d, idx) => (
            <div
              key={d.rank}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-800/60 border border-gray-700/50 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start space-x-4">
                <span className="text-2xl font-bold text-gray-500 w-8">#{d.rank}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{d.ticker}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-400 text-sm">{d.name}</span>
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    {d.metric} · {d.speaker} ({d.role})
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-gray-400">Claimed: </span>
                    <span className="text-white font-medium">{d.claimed}</span>
                    <span className="text-gray-500 mx-2">Actual: </span>
                    <span className="text-green-400 font-medium">{d.actual}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <div className="text-xl font-bold text-red-400">+{d.pctDiff}%</div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  d.severity === 'high'
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-orange-500/20 text-orange-300'
                }`}>
                  {d.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Companies List — searchable + sortable */}
      <div id="companies-section">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-2xl font-bold">Companies Analyzed</h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search ticker or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Sort buttons */}
            <div className="flex items-center gap-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleSort(opt.key)}
                  className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors flex items-center gap-1 ${
                    sortKey === opt.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {opt.label}
                  {sortKey === opt.key && (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="card p-8 text-center text-gray-400">Loading companies from SEC EDGAR...</div>
        )}
        {error && (
          <div className="card p-8 text-center text-red-300">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && search && (
          <div className="card p-8 text-center text-gray-400">No companies match "{search}"</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && !error && filtered.map((company) => (
            <div
              key={company.ticker}
              onClick={() => onSelectCompany(company)}
              className="card-hover p-6 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold group-hover:text-blue-400 transition-colors">
                    {company.ticker}
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">{company.name}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                    CIK: {company.cik || '—'}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Latest quarter</span>
                <span className="text-gray-300 text-xs">{company.latestQuarter || '—'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="card p-6 bg-blue-900/10 border-blue-500/30">
        <h3 className="text-lg font-semibold mb-4 text-blue-400">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
          <div>
            <div className="font-semibold mb-2 text-white">1. Extract Claims</div>
            <p className="text-gray-400">
              Automatically identify quantitative statements from earnings call transcripts using pattern matching and LLM analysis
            </p>
          </div>
          <div>
            <div className="font-semibold mb-2 text-white">2. Verify Against SEC</div>
            <p className="text-gray-400">
              Compare claims with official 10-Q/10-K filings from SEC EDGAR database using structured XBRL data
            </p>
          </div>
          <div>
            <div className="font-semibold mb-2 text-white">3. Flag Discrepancies</div>
            <p className="text-gray-400">
              Detect and categorize deviations beyond tolerance thresholds (5% for dollars, 2pts for percentages)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
