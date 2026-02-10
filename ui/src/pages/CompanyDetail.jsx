import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calendar, Database } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

function CompanyDetail({ company, onBack }) {
  const ticker = company?.ticker;
  const [quarters, setQuarters] = useState(company?.quarters || []);
  const [selectedQuarter, setSelectedQuarter] = useState(company?.latestQuarter || company?.quarters?.[0] || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadQuarters() {
      if (!ticker) return;
      try {
        const resp = await apiClient.getCompanyQuarters(ticker);
        const q = (resp?.quarters || []).map((x) => x.quarter);
        if (!cancelled && q.length) {
          setQuarters(q);
          if (!selectedQuarter) setSelectedQuarter(q[0]);
        }
      } catch (e) {
        // non-fatal
      }
    }
    loadQuarters();
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  useEffect(() => {
    let cancelled = false;
    async function loadMetrics() {
      if (!ticker || !selectedQuarter) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await apiClient.getQuarterMetrics(ticker, selectedQuarter);
        if (!cancelled) setMetrics(resp);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load metrics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadMetrics();
    return () => {
      cancelled = true;
    };
  }, [ticker, selectedQuarter]);

  const cards = useMemo(() => {
    const m = metrics?.calculated_metrics || {};
    return [
      { label: 'Revenue', value: m.revenue_billions != null ? `$${m.revenue_billions.toFixed(2)}B` : '—' },
      { label: 'Net Income', value: m.net_income_billions != null ? `$${m.net_income_billions.toFixed(2)}B` : '—' },
      { label: 'Gross Margin', value: m.gross_margin_pct != null ? `${m.gross_margin_pct.toFixed(2)}%` : '—' },
      { label: 'Operating Margin', value: m.operating_margin_pct != null ? `${m.operating_margin_pct.toFixed(2)}%` : '—' }
    ];
  }, [metrics]);

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
            {quarters.map((quarter) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards (SEC metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="text-gray-400 text-sm mb-1">{c.label}</div>
            <div className="text-3xl font-bold">{c.value}</div>
            <p className="text-xs text-gray-500 mt-1">{selectedQuarter}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-400" />
          SEC Filing Metrics
        </h3>

        {loading && <div className="text-gray-400">Loading metrics...</div>}
        {error && <div className="text-red-300">{error}</div>}

        {!loading && !error && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-2 font-medium">Raw (SEC) values</div>
              <pre className="text-xs text-gray-300 overflow-auto">{JSON.stringify(metrics.raw_data, null, 2)}</pre>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-2 font-medium">Calculated metrics</div>
              <pre className="text-xs text-gray-300 overflow-auto">{JSON.stringify(metrics.calculated_metrics, null, 2)}</pre>
            </div>
          </div>
        )}
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
            <span><strong>Claims:</strong> Use Claude Skill to extract claims from transcripts, then verify via /api/verification/verify</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default CompanyDetail;
