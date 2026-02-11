import React, { useState } from 'react';
import { Mic, Volume2, Zap, Target, ArrowUpDown, Eye, Shield, AlertTriangle } from 'lucide-react';

const DETECTION_STRATEGIES = {
  delta: {
    title: 'Delta-Threshold Detection',
    icon: Target,
    description: 'When a CEO says "strong growth" on an earnings call, what does "strong" actually mean? We map sentiment words to expected magnitudes. "Strong" or "significant" should mean >10% change. If the SEC filing shows <2% change — that\'s a gap between language intensity and data magnitude.',
    patterns: [
      { word: '"Strong" / "Significant"', expected: 'Expects >10% change', flag: 'Flag if <5%', color: 'text-pink-400' },
      { word: '"Robust" / "Solid"', expected: 'Expects >5% and sustained', flag: 'Flag if <3% or declining', color: 'text-pink-400' },
      { word: '"Record"', expected: 'Must be literal all-time high', flag: 'Flag if prior quarter was higher', color: 'text-pink-400' },
      { word: '"Modest" / "Steady"', expected: 'Expects 2-10%', flag: 'Flag if >15% (understating)', color: 'text-pink-400' },
    ]
  },
  cherry: {
    title: 'Cherry-Pick Detection',
    icon: ArrowUpDown,
    description: 'Executives often cite favorable comparisons while hiding unfavorable ones. If they say "revenue grew 15% year over year" but QoQ is negative, that\'s cherry-picking. We check if they\'re citing YoY when QoQ is negative, or using adjusted figures when GAAP tells a different story.',
    patterns: [
      { word: 'Citing YoY when QoQ negative', expected: 'Check both comparisons', flag: 'Flag selective timeframe', color: 'text-orange-400' },
      { word: 'Using adjusted/non-GAAP only', expected: 'Compare to GAAP figures', flag: 'Flag if GAAP diverges >20%', color: 'text-orange-400' },
      { word: 'Highlighting revenue, hiding margin', expected: 'Check all key metrics', flag: 'Flag omitted metrics', color: 'text-orange-400' },
    ]
  },
  conflation: {
    title: 'Metric Conflation',
    icon: ArrowUpDown,
    description: 'Sometimes executives use adjusted figures when GAAP tells a different story. "We had a great quarter with $2B in earnings" — but is that GAAP net income or adjusted EBITDA? We detect when non-GAAP metrics are presented without GAAP context.',
    patterns: [
      { word: 'Adjusted EBITDA vs Net Income', expected: 'Clarify which metric', flag: 'Flag if >15% difference', color: 'text-cyan-400' },
      { word: 'Operating income vs GAAP income', expected: 'Show both figures', flag: 'Flag if only adjusted cited', color: 'text-cyan-400' },
      { word: 'Revenue vs Billings', expected: 'Distinguish clearly', flag: 'Flag conflation', color: 'text-cyan-400' },
    ]
  },
  omission: {
    title: 'Omission Detection',
    icon: Eye,
    description: 'What they don\'t say is often as important as what they do say. If a CEO celebrates revenue growth but doesn\'t mention margins, and margins compressed significantly, that\'s strategic omission. We flag when key metrics are suspiciously absent from the narrative.',
    patterns: [
      { word: 'Revenue mentioned, margin omitted', expected: 'Discuss both', flag: 'Flag if margin declined >5%', color: 'text-purple-400' },
      { word: 'Growth cited, profitability omitted', expected: 'Balance growth & profit', flag: 'Flag if losses widened', color: 'text-purple-400' },
      { word: 'Positive metrics only', expected: 'Acknowledge challenges', flag: 'Flag one-sided narrative', color: 'text-purple-400' },
    ]
  }
};

export default function TheWhy() {
  const [activeStrategy, setActiveStrategy] = useState('delta');
  const strategy = DETECTION_STRATEGIES[activeStrategy];
  const StrategyIcon = strategy.icon;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Mic className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              The "Why" — <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">How We Catch Misleading Claims</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">A spoken-style walkthrough of the detection methodology</p>
          </div>
        </div>
      </div>

      {/* Core Idea Section */}
      <section className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 border border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <Volume2 className="w-6 h-6 text-pink-400" />
          <h2 className="text-xl font-bold text-pink-400">THE CORE IDEA (30 SECONDS)</h2>
        </div>
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p className="italic">
            "Executives say a lot of things on earnings calls. Some of it is accurate. Some of it is misleading. We want to know the difference. <span className="text-pink-400 font-semibold">My approach: delta-thresholds.</span> When a CEO says <span className="text-yellow-300 italic">'strong growth'</span> but the SEC filing shows &lt;2% change — that's a gap between <span className="text-cyan-400">language intensity</span> and <span className="text-green-400">data magnitude</span>. The claim is technically true, but the framing creates a false impression. Beyond numbers, I detect <span className="text-orange-400">cherry-picked baselines</span> (citing YoY when QoQ is negative), <span className="text-cyan-400">metric conflation</span> (using adjusted figures when GAAP tells a different story), and <span className="text-red-400">strategic omissions</span> (celebrating revenue while hiding margin compression). If a CEO says 'revenue grew 15% year over year' — we check if that's true, but also <span className="italic">why</span> they picked that comparison."
          </p>
        </div>
      </section>

      {/* Verification Pipeline */}
      <section className="space-y-4">
        <div className="flex items-center space-x-3">
          <Zap className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Verification Pipeline</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-5 border border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-sm">
                1
              </div>
              <h3 className="font-semibold text-cyan-400">Extract Claims</h3>
            </div>
            <p className="text-sm text-gray-400">
              Claude AI reads the earnings call and pulls out every quantitative claim with a specific number
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-5 border border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-purple-400 font-bold text-sm">
                2
              </div>
              <h3 className="font-semibold text-purple-400">Map to XBRL</h3>
            </div>
            <p className="text-sm text-gray-400">
              Each claim is mapped to a specific SEC EDGAR XBRL field — Revenue, Net Income, EPS, etc.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-5 border border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-green-400 font-bold text-sm">
                3
              </div>
              <h3 className="font-semibold text-green-400">Compute Delta</h3>
            </div>
            <p className="text-sm text-gray-400">
              Calculate the % difference between what was claimed and what was actually filed with the SEC
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-5 border border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center text-yellow-400 font-bold text-sm">
                4
              </div>
              <h3 className="font-semibold text-yellow-400">Threshold Check</h3>
            </div>
            <p className="text-sm text-gray-400">
              ≤2% = Accurate, 2-10% = Minor, &gt;10% = Major discrepancy
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-5 border border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-purple-400 font-bold text-sm">
                5
              </div>
              <h3 className="font-semibold text-purple-400">Framing Analysis</h3>
            </div>
            <p className="text-sm text-gray-400">
              Run all four misleading detectors: delta-threshold, cherry-pick, conflation, omission
            </p>
          </div>

          {/* Step 6 */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-5 border border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400 font-bold text-sm">
                6
              </div>
              <h3 className="font-semibold text-red-400">Verdict</h3>
            </div>
            <p className="text-sm text-gray-400">
              Each claim gets a severity rating + plain-English explanation of what was said vs. what's real
            </p>
          </div>
        </div>
      </section>

      {/* Four Detection Strategies */}
      <section className="space-y-4">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Four Detection Strategies</h2>
        </div>

        {/* Strategy Tabs */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(DETECTION_STRATEGIES).map(([key, strat]) => {
            const Icon = strat.icon;
            const isActive = activeStrategy === key;
            return (
              <button
                key={key}
                onClick={() => setActiveStrategy(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-semibold text-sm">{strat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Strategy Details */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <StrategyIcon className="w-6 h-6 text-pink-400" />
            <h3 className="text-xl font-bold text-pink-400">{strategy.title}</h3>
            <span className="text-xs text-gray-500">Click to expand explanation</span>
          </div>
          <p className="text-gray-300 leading-relaxed mb-6 italic">
            "{strategy.description}"
          </p>

          {/* Patterns Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Pattern</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Expected</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Flag When</th>
                </tr>
              </thead>
              <tbody>
                {strategy.patterns.map((pattern, idx) => (
                  <tr key={idx} className="border-b border-gray-800">
                    <td className="py-3 px-4 text-sm text-gray-300 font-mono">{pattern.word}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{pattern.expected}</td>
                    <td className={`py-3 px-4 text-sm font-semibold ${pattern.color}`}>{pattern.flag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Live Examples Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Live Examples from Actual SEC Data</h2>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-cyan-900/30 rounded-lg border border-cyan-700/50">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-400">Showing 8 examples</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700 text-center">
          <p className="text-gray-400 mb-4">
            Explore the <strong className="text-cyan-400">Claims Explorer</strong> tab to see real examples of verified and flagged claims from 10 S&P 500 companies across 4 quarters.
          </p>
          <button
            onClick={() => window.location.href = '#explorer'}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
          >
            View Live Examples →
          </button>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-800">
        <p>
          Built with React, Fastify, SEC EDGAR XBRL API, Finnhub API, and Claude AI
        </p>
        <p className="mt-1">
          Data sourced from official SEC filings and verified earnings call transcripts
        </p>
      </div>
    </div>
  );
}
