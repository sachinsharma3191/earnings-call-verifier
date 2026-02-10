import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Database } from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { getMeta, fmtB, fmtPct, pctChange } from '../data/companyMeta';

const METRICS_DEF = [
  { label: 'Revenue', key: 'Revenues' },
  { label: 'Net Income', key: 'NetIncome' },
  { label: 'Gross Profit', key: 'GrossProfit' },
  { label: 'Operating Income', key: 'OperatingIncome' },
  { label: 'EPS (Diluted)', key: 'EPS' },
  { label: 'Cost of Revenue', key: 'CostOfRevenue' },
  { label: 'Operating Expenses', key: 'OperatingExpenses' },
];

function CompanyDetail({ company, onBack }) {
  const ticker = company?.ticker;
  const meta = getMeta(ticker);
  const [quartersData, setQuartersData] = useState([]);
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!ticker) return;
      setLoading(true);
      try {
        const resp = await apiClient.getCompanyQuarters(ticker);
        const qList = resp?.quarters || [];
        if (!cancelled) {
          setQuartersData(qList);
          if (qList.length && !selectedQuarter) setSelectedQuarter(qList[0].quarter);
        }
      } catch (e) { /* non-fatal */ }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [ticker]);

  const quarters = quartersData.map(q => q.quarter);
  const currentQ = quartersData.find(q => q.quarter === selectedQuarter);
  const qIdx = quarters.indexOf(selectedQuarter);
  const prevQ = qIdx >= 0 && qIdx < quarters.length - 1 ? quartersData[qIdx + 1] : null;
  const currentFin = currentQ?.financials || {};
  const prevFin = prevQ?.financials || {};

  const fmtVal = (key, val) => {
    if (val == null || val === 0) return '—';
    if (key === 'EPS') return `$${Number(val).toFixed(2)}`;
    return fmtB(val);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <button onClick={onBack} className="text-cyan-400 text-sm font-semibold hover:text-cyan-300 transition-colors flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold">
            <span style={{ color: meta.color }}>{ticker}</span> — {company.name}
          </h2>
          <p className="text-xs text-gray-500 mt-1">{meta.sector} · CIK: {company.cik} · SEC EDGAR XBRL</p>
        </div>
        <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white text-sm focus:outline-none focus:border-cyan-500">
          {quarters.map((q) => <option key={q} value={q}>{q}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-400">Loading financial data...</div>
      ) : (
        <>
          {/* Metrics with QoQ change */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <span className="text-sm font-bold flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan-400" />
                Financial Metrics — {selectedQuarter}
              </span>
              {currentQ?.dataSource && (
                <span className="text-[11px] text-gray-500">Source: SEC {currentQ.dataSource === 'sec_edgar' ? '10-Q filing' : 'static fallback'}</span>
              )}
            </div>
            {METRICS_DEF.map((m) => {
              const val = currentFin[m.key];
              const prev = prevFin[m.key];
              const change = pctChange(val, prev);
              return (
                <div key={m.key} className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
                  <span className="text-sm text-gray-400">{m.label}</span>
                  <div className="flex items-center gap-4">
                    {change !== null && (
                      <span className={`text-xs font-semibold ${change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% QoQ
                      </span>
                    )}
                    <span className="text-sm font-bold text-white tabular-nums min-w-[100px] text-right">
                      {fmtVal(m.key, val)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* All Quarters Overview Table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h4 className="text-sm font-bold">All Quarters Overview</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Metric</th>
                    {quarters.map((q) => (
                      <th key={q} className={`px-3 py-2.5 text-right font-semibold ${q === selectedQuarter ? 'text-cyan-400' : 'text-gray-500'}`}>{q}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {METRICS_DEF.map((m) => (
                    <tr key={m.key} className="border-b border-gray-800/50">
                      <td className="px-3 py-2.5 text-gray-400">{m.label}</td>
                      {quartersData.map((qd) => {
                        const v = qd.financials?.[m.key];
                        return (
                          <td key={qd.quarter} className={`px-3 py-2.5 text-right tabular-nums ${qd.quarter === selectedQuarter ? 'text-white font-semibold' : 'text-gray-300'}`}>
                            {fmtVal(m.key, v)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CompanyDetail;
