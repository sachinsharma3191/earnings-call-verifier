import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calendar, Database } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

function CompanyDetail({ company, onBack }) {
  const ticker = company?.ticker;
  const [quarters, setQuarters] = useState(() => {
    const raw = company?.quarters || [];
    return raw.map(q => typeof q === 'string' ? q : q.quarter).filter(Boolean);
  });
  const [selectedQuarter, setSelectedQuarter] = useState(() => {
    const lq = company?.latestQuarter;
    if (typeof lq === 'string') return lq;
    if (lq?.quarter) return lq.quarter;
    const first = company?.quarters?.[0];
    if (typeof first === 'string') return first;
    return first?.quarter || '';
  });
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

        {!loading && !error && metrics && (() => {
          const raw = metrics.raw_data || {};
          const calc = metrics.calculated_metrics || {};
          const fmt = (v, prefix = '$', suffix = 'B') =>
            v != null && v !== 0 ? `${prefix}${Number(v).toFixed(2)}${suffix}` : '—';
          const pct = (v) =>
            v != null ? `${Number(v).toFixed(2)}%` : '—';

          const filingRows = [
            { label: 'Revenue', value: fmt(raw.Revenues), icon: '💰' },
            { label: 'Cost of Revenue', value: fmt(raw.CostOfRevenue), icon: '�' },
            { label: 'Gross Profit', value: fmt(raw.GrossProfit), icon: '📊' },
            { label: 'Operating Expenses', value: fmt(raw.OperatingExpenses), icon: '�' },
            { label: 'Operating Income', value: fmt(raw.OperatingIncome), icon: '🏢' },
            { label: 'Net Income', value: fmt(raw.NetIncome), icon: '�' },
            { label: 'Earnings Per Share', value: raw.EPS != null && raw.EPS !== 0 ? `$${Number(raw.EPS).toFixed(2)}` : '—', icon: '🔢' },
          ];

          const marginRows = [
            { label: 'Gross Margin', value: pct(calc.gross_margin_pct), color: 'text-green-400' },
            { label: 'Operating Margin', value: pct(calc.operating_margin_pct), color: 'text-blue-400' },
            { label: 'Net Margin', value: pct(calc.net_margin_pct), color: 'text-purple-400' },
          ];

          return (
            <div className="space-y-6">
              {/* Filing Values */}
              <div>
                <div className="text-sm text-gray-400 mb-3 font-medium">SEC Filing Values (in Billions USD)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filingRows.map((row) => (
                    <div key={row.label} className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{row.icon}</span>
                        <span className="text-gray-300 text-sm">{row.label}</span>
                      </div>
                      <span className="text-white font-semibold text-lg">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Margin Analysis */}
              <div>
                <div className="text-sm text-gray-400 mb-3 font-medium">Profitability Margins</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {marginRows.map((row) => {
                    const numVal = parseFloat(row.value);
                    const barWidth = !isNaN(numVal) ? Math.min(numVal, 100) : 0;
                    return (
                      <div key={row.label} className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300 text-sm">{row.label}</span>
                          <span className={`font-bold text-lg ${row.color}`}>{row.value}</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              row.color === 'text-green-400' ? 'bg-green-500' :
                              row.color === 'text-blue-400' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Source */}
              {metrics.dataSource && (
                <div className="text-xs text-gray-500 flex items-center space-x-2">
                  <span>Source:</span>
                  <span className={`px-2 py-0.5 rounded ${
                    metrics.dataSource === 'sec_edgar' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {metrics.dataSource === 'sec_edgar' ? 'SEC EDGAR (10-Q)' : 'Static Fallback'}
                  </span>
                </div>
              )}
            </div>
          );
        })()}
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
