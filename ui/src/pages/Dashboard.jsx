import React, { useState, useEffect, useMemo } from 'react';
import { Building2, ChevronRight, Clock, Database, AlertTriangle, Search, ArrowUpDown, RefreshCw } from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { getMeta, fmtB } from '../data/companyMeta';

function Dashboard({ companies, loading, error, onSelectCompany }) {
  const totalCompanies = companies?.length || 0;
  const [search, setSearch] = useState('');
  const [companySortBy, setCompanySortBy] = useState('ticker');
  const [companySortDir, setCompanySortDir] = useState('asc');
  const [discSearch, setDiscSearch] = useState('');
  const [discSortBy, setDiscSortBy] = useState('pctDiff');
  const [discSortDir, setDiscSortDir] = useState('desc');
  const [discrepancies, setDiscrepancies] = useState([]);
  const [discLoading, setDiscLoading] = useState(true);
  const [discRefreshing, setDiscRefreshing] = useState(false);

  const fetchDiscrepancies = async () => {
    setDiscRefreshing(true);
    try {
      const resp = await apiClient.getTopDiscrepancies(15);
      setDiscrepancies(resp?.discrepancies || []);
    } catch (e) { /* non-fatal */ }
    finally { setDiscLoading(false); setDiscRefreshing(false); }
  };

  useEffect(() => { fetchDiscrepancies(); }, []);

  const handleCompanySort = (key) => {
    if (companySortBy === key) setCompanySortDir(companySortDir === 'asc' ? 'desc' : 'asc');
    else { setCompanySortBy(key); setCompanySortDir('asc'); }
  };

  const handleDiscSort = (key) => {
    if (discSortBy === key) setDiscSortDir(discSortDir === 'asc' ? 'desc' : 'asc');
    else { setDiscSortBy(key); setDiscSortDir(key === 'pctDiff' ? 'desc' : 'asc'); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = (companies || []).filter((c) => {
      if (!q) return true;
      const meta = getMeta(c.ticker);
      return c.ticker?.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q) || meta.sector.toLowerCase().includes(q);
    });
    list.sort((a, b) => {
      let va, vb;
      if (companySortBy === 'revenue') {
        va = a.quarters?.[0]?.financials?.Revenues || 0;
        vb = b.quarters?.[0]?.financials?.Revenues || 0;
      } else {
        va = (a[companySortBy] || '').toString().toLowerCase();
        vb = (b[companySortBy] || '').toString().toLowerCase();
      }
      if (va < vb) return companySortDir === 'asc' ? -1 : 1;
      if (va > vb) return companySortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [companies, search, companySortBy, companySortDir]);

  const filteredDisc = useMemo(() => {
    const q = discSearch.toLowerCase().trim();
    let list = (discrepancies || []).filter((d) => {
      if (!q) return true;
      return `${d.ticker} ${d.name} ${d.metric} ${d.speaker} ${d.severity}`.toLowerCase().includes(q);
    });
    list.sort((a, b) => {
      let va = a[discSortBy], vb = b[discSortBy];
      if (discSortBy === 'pctDiff') { va = Math.abs(va || 0); vb = Math.abs(vb || 0); }
      if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
      if (va < vb) return discSortDir === 'asc' ? -1 : 1;
      if (va > vb) return discSortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [discrepancies, discSearch, discSortBy, discSortDir]);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card cursor-pointer hover:border-cyan-500/50 transition-all" onClick={() => document.getElementById('companies-section')?.scrollIntoView({ behavior: 'smooth' })}>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-cyan-400" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Companies</span>
          </div>
          <div className="text-2xl font-extrabold">{totalCompanies}</div>
          <div className="text-xs text-gray-500 mt-1">S&P 500 constituents</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Quarters</span>
          </div>
          <div className="text-2xl font-extrabold">4</div>
          <div className="text-xs text-gray-500 mt-1">Q1–Q4 2025</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-cyan-400" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Data Points</span>
          </div>
          <div className="text-2xl font-extrabold">{totalCompanies * 4}</div>
          <div className="text-xs text-gray-500 mt-1">Company-quarter pairs</div>
        </div>
        <div className="stat-card cursor-pointer hover:border-yellow-500/50 transition-all" onClick={() => document.getElementById('discrepancies-section')?.scrollIntoView({ behavior: 'smooth' })}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">QoQ Anomalies</span>
          </div>
          <div className="text-2xl font-extrabold text-yellow-400">{discrepancies.length}</div>
          <div className="text-xs text-gray-500 mt-1">Flagged for review</div>
        </div>
      </div>

      {/* Discrepancies Table */}
      <div id="discrepancies-section" className="card overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            Top Quarter-over-Quarter Changes
            <button onClick={fetchDiscrepancies} className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-all" title="Refresh">
              <RefreshCw className={`h-3.5 w-3.5 ${discRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-500" />
            <input value={discSearch} onChange={(e) => setDiscSearch(e.target.value)} placeholder="Search ticker, metric, severity..."
              className="pl-8 pr-3 py-1.5 rounded-md border border-gray-600 bg-gray-900 text-white text-xs w-52 focus:outline-none focus:border-cyan-500" />
          </div>
        </div>

        {discLoading ? (
          <div className="text-center text-gray-400 py-8 text-sm">Loading discrepancies from SEC data...</div>
        ) : filteredDisc.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">{discSearch ? `No results for "${discSearch}"` : 'No discrepancies detected yet.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-700">
                  {[{ key: 'ticker', label: 'Ticker' }, { key: 'metric', label: 'Metric' }, { key: 'quarter', label: 'Quarter' }, { key: 'actual', label: 'Value' }, { key: 'pctDiff', label: '% Diff' }, { key: 'severity', label: 'Severity' }].map((col) => (
                    <th key={col.key} onClick={() => handleDiscSort(col.key)}
                      className={`px-3 py-2.5 text-left font-semibold cursor-pointer select-none whitespace-nowrap ${discSortBy === col.key ? 'text-cyan-400' : 'text-gray-500'}`}>
                      {col.label} <span className="text-[9px] ml-0.5">{discSortBy === col.key ? (discSortDir === 'asc' ? '▲' : '▼') : '⇅'}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDisc.slice(0, 10).map((d, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/40 cursor-pointer transition-colors"
                    onClick={() => { const c = companies?.find(c => c.ticker === d.ticker); if (c) onSelectCompany(c); }}>
                    <td className="px-3 py-2.5 font-bold text-cyan-400">{d.ticker}</td>
                    <td className="px-3 py-2.5 text-gray-200">{d.metric}</td>
                    <td className="px-3 py-2.5 text-gray-400">{d.quarter}</td>
                    <td className="px-3 py-2.5 text-gray-200 tabular-nums">{d.actual}</td>
                    <td className="px-3 py-2.5 font-bold tabular-nums" style={{ color: d.pctDiff > 0 ? '#4ade80' : '#f87171' }}>
                      {d.pctDiff > 0 ? '+' : ''}{d.pctDiff}%
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.severity === 'high' ? 'bg-red-500/20 text-red-400' : d.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                      }`}>{d.severity}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Companies List */}
      <div id="companies-section">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold">Companies</h3>
            <div className="flex gap-1">
              {[{ key: 'ticker', label: 'Ticker' }, { key: 'name', label: 'Name' }, { key: 'revenue', label: 'Revenue' }].map((s) => (
                <button key={s.key} onClick={() => handleCompanySort(s.key)}
                  className={`px-2 py-1 rounded text-[10px] font-semibold border transition-colors ${
                    companySortBy === s.key ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-gray-600 text-gray-500 hover:border-gray-500'
                  }`}>
                  {s.label} {companySortBy === s.key && (companySortDir === 'asc' ? '▲' : '▼')}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ticker, name, sector..."
              className="pl-9 pr-3 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white text-sm w-64 focus:outline-none focus:border-cyan-500" />
          </div>
        </div>

        {loading && <div className="card p-8 text-center text-gray-400">Loading companies from SEC EDGAR...</div>}
        {error && <div className="card p-8 text-center text-red-300">{error}</div>}

        <div className="space-y-2">
          {!loading && !error && filtered.map((company) => {
            const meta = getMeta(company.ticker);
            const latestQ = company.quarters?.[0];
            const revenue = latestQ?.financials?.Revenues;
            return (
              <div key={company.ticker} onClick={() => onSelectCompany(company)}
                className="flex items-center p-3 rounded-xl bg-gray-800/60 border border-gray-700 cursor-pointer gap-3 transition-all hover:border-gray-500 hover:translate-x-1 group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                  style={{ background: `${meta.color}18`, color: meta.color }}>
                  {company.ticker.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">
                    {company.ticker} <span className="font-normal text-gray-400 text-xs">— {company.name}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {meta.sector} · CIK: {company.cik}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-white">{revenue ? fmtB(revenue) : '—'}</div>
                  <div className="text-[10px] text-gray-500">{latestQ?.quarter || 'Q4 2025'} Revenue</div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
