// Company metadata: sector, accent color, executive names
// Used across Dashboard, CompanyDetail, and ClaimExplorer

export const COMPANY_META = {
  AAPL: { sector: 'Technology', color: '#22d3ee', executives: [{ name: 'Tim Cook', role: 'CEO' }, { name: 'Luca Maestri', role: 'CFO' }] },
  NVDA: { sector: 'Semiconductors', color: '#a78bfa', executives: [{ name: 'Jensen Huang', role: 'CEO' }, { name: 'Colette Kress', role: 'CFO' }] },
  MSFT: { sector: 'Technology', color: '#34d399', executives: [{ name: 'Satya Nadella', role: 'CEO' }, { name: 'Amy Hood', role: 'CFO' }] },
  GOOGL: { sector: 'Technology', color: '#fb923c', executives: [{ name: 'Sundar Pichai', role: 'CEO' }, { name: 'Ruth Porat', role: 'CFO' }] },
  AMZN: { sector: 'E-Commerce', color: '#f472b6', executives: [{ name: 'Andy Jassy', role: 'CEO' }, { name: 'Brian Olsavsky', role: 'CFO' }] },
  META: { sector: 'Social Media', color: '#60a5fa', executives: [{ name: 'Mark Zuckerberg', role: 'CEO' }, { name: 'Susan Li', role: 'CFO' }] },
  TSLA: { sector: 'Automotive', color: '#e879f9', executives: [{ name: 'Elon Musk', role: 'CEO' }, { name: 'Vaibhav Taneja', role: 'CFO' }] },
  JPM: { sector: 'Banking', color: '#fbbf24', executives: [{ name: 'Jamie Dimon', role: 'CEO' }, { name: 'Jeremy Barnum', role: 'CFO' }] },
  JNJ: { sector: 'Healthcare', color: '#2dd4bf', executives: [{ name: 'Joaquin Duato', role: 'CEO' }, { name: 'Joseph Wolk', role: 'CFO' }] },
  WMT: { sector: 'Retail', color: '#fb7185', executives: [{ name: 'Doug McMillon', role: 'CEO' }, { name: 'John David Rainey', role: 'CFO' }] },
};

export const SEVERITY_CONFIG = {
  accurate: { label: 'Accurate', icon: '✓', bg: 'bg-green-900/30', text: 'text-green-400', border: 'border-green-700/50', badgeBg: 'bg-green-500/20' },
  minor: { label: 'Minor', icon: '~', bg: 'bg-yellow-900/20', text: 'text-yellow-400', border: 'border-yellow-700/50', badgeBg: 'bg-yellow-500/20' },
  major: { label: 'Major', icon: '✗', bg: 'bg-red-900/20', text: 'text-red-400', border: 'border-red-700/50', badgeBg: 'bg-red-500/20' },
  misleading: { label: 'Misleading', icon: '⚠', bg: 'bg-purple-900/20', text: 'text-purple-400', border: 'border-purple-700/50', badgeBg: 'bg-purple-500/20' },
  discrepant: { label: 'Discrepant', icon: '✗', bg: 'bg-red-900/20', text: 'text-red-400', border: 'border-red-700/50', badgeBg: 'bg-red-500/20' },
  unverifiable: { label: 'Unverifiable', icon: '?', bg: 'bg-indigo-900/20', text: 'text-indigo-400', border: 'border-indigo-700/50', badgeBg: 'bg-indigo-500/20' },
};

export const QUARTERS = ['Q4 2025', 'Q3 2025', 'Q2 2025', 'Q1 2025'];

export function getMeta(ticker) {
  return COMPANY_META[ticker] || { sector: 'Unknown', color: '#94a3b8', executives: [] };
}

export function fmt(val) {
  if (val == null) return 'N/A';
  const abs = Math.abs(val);
  if (abs >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  if (abs < 100) return `$${val.toFixed(2)}`;
  return `$${val.toLocaleString()}`;
}

export function fmtB(val) {
  if (val == null || val === 0) return '—';
  return `$${Number(val).toFixed(2)}B`;
}

export function fmtPct(val) {
  if (val == null) return '—';
  return `${Number(val).toFixed(1)}%`;
}

export function pctChange(current, previous) {
  if (!previous || !current) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}
