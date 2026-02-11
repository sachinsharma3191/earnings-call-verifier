import React from 'react';
import { Mic, Target, Shield, TrendingUp, AlertTriangle, CheckCircle, Users, Zap, FileText, Database } from 'lucide-react';

export default function TheWhy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 pb-8 border-b border-gray-700">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Mic className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold gradient-text">
          The Why
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Why we built an earnings call claim verifier and why it matters
        </p>
      </div>

      {/* Problem Statement */}
      <section className="space-y-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-white">The Problem</h2>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 space-y-4">
          <p className="text-gray-300 leading-relaxed">
            Every quarter, executives from public companies hold earnings calls where they make bold claims about their company's performance. These claims directly influence investor decisions, stock prices, and market sentiment.
          </p>
          <p className="text-gray-300 leading-relaxed">
            However, <span className="text-yellow-400 font-semibold">verifying these claims is time-consuming and requires cross-referencing multiple sources</span>: earnings call transcripts, SEC EDGAR filings (10-Q, 10-K), XBRL data, and historical quarterly comparisons.
          </p>
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mt-4">
            <p className="text-red-300 text-sm leading-relaxed">
              <strong>Real-world impact:</strong> Misleading claims can lead to misinformed investment decisions, regulatory scrutiny, and loss of investor trust. In some cases, discrepancies between what executives say and what SEC filings show can indicate deeper issues.
            </p>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="space-y-4">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-cyan-500" />
          <h2 className="text-2xl font-bold text-white">Our Solution</h2>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 space-y-4">
          <p className="text-gray-300 leading-relaxed">
            The <strong className="text-cyan-400">Earnings Call Claim Verifier</strong> automatically extracts claims from earnings call transcripts and verifies them against official SEC EDGAR XBRL data.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Transcript Analysis</h3>
              </div>
              <p className="text-sm text-gray-400">
                AI-powered extraction of quantitative claims from earnings call transcripts (revenue, net income, EPS, margins, etc.)
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-white">SEC EDGAR Data</h3>
              </div>
              <p className="text-sm text-gray-400">
                Direct integration with SEC EDGAR XBRL API to fetch official financial data from 10-Q and 10-K filings
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-white">Automated Verification</h3>
              </div>
              <p className="text-sm text-gray-400">
                Compare claimed values against actual SEC data, flag discrepancies, and calculate accuracy scores
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-white">QoQ Analysis</h3>
              </div>
              <p className="text-sm text-gray-400">
                Track quarter-over-quarter changes and identify potential areas for misleading framing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Benefits */}
      <section className="space-y-4">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-white">Who Benefits</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg p-5 border border-blue-700/50">
            <h3 className="font-semibold text-blue-300 mb-2">Investors</h3>
            <p className="text-sm text-gray-300">
              Make informed decisions based on verified data, not just executive narratives
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg p-5 border border-green-700/50">
            <h3 className="font-semibold text-green-300 mb-2">Analysts</h3>
            <p className="text-sm text-gray-300">
              Quickly verify claims during earnings season without manual cross-referencing
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-lg p-5 border border-purple-700/50">
            <h3 className="font-semibold text-purple-300 mb-2">Regulators</h3>
            <p className="text-sm text-gray-300">
              Identify potential discrepancies that warrant further investigation
            </p>
          </div>
        </div>
      </section>

      {/* Technical Approach */}
      <section className="space-y-4">
        <div className="flex items-center space-x-3">
          <Zap className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-white">How It Works</h2>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <ol className="space-y-4">
            <li className="flex space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Data Collection</h3>
                <p className="text-sm text-gray-400">
                  Fetch earnings call transcripts from Finnhub API and SEC EDGAR XBRL data from official SEC APIs
                </p>
              </div>
            </li>
            <li className="flex space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Claim Extraction</h3>
                <p className="text-sm text-gray-400">
                  Use AI (Claude) to extract quantitative claims from transcripts, identifying speaker, metric, value, and context
                </p>
              </div>
            </li>
            <li className="flex space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Verification</h3>
                <p className="text-sm text-gray-400">
                  Compare claimed values against actual SEC EDGAR data, calculate percentage differences, and flag discrepancies
                </p>
              </div>
            </li>
            <li className="flex space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Severity Classification</h3>
                <p className="text-sm text-gray-400">
                  Classify discrepancies as accurate, minor, major, or misleading based on percentage difference thresholds
                </p>
              </div>
            </li>
            <li className="flex space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-sm">
                5
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Reporting</h3>
                <p className="text-sm text-gray-400">
                  Generate accuracy scores by executive, identify patterns, and provide actionable insights
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Impact */}
      <section className="space-y-4">
        <div className="flex items-center space-x-3">
          <Target className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold text-white">The Impact</h2>
        </div>
        <div className="bg-gradient-to-br from-green-900/20 to-cyan-900/20 rounded-lg p-6 border border-green-700/50">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Increased Transparency</h3>
                <p className="text-sm text-gray-300">
                  Executives know their claims will be automatically verified, encouraging more accurate communication
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Time Savings</h3>
                <p className="text-sm text-gray-300">
                  What used to take hours of manual work now happens in seconds, allowing analysts to focus on deeper insights
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Better Investment Decisions</h3>
                <p className="text-sm text-gray-300">
                  Investors can make decisions based on verified facts, reducing risk and improving portfolio performance
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Market Integrity</h3>
                <p className="text-sm text-gray-300">
                  Automated verification helps maintain trust in public markets by holding companies accountable
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg p-8 border border-cyan-700/50 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Try It Yourself
        </h2>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Explore the dashboard to see verified claims from 10 S&P 500 companies across 4 quarters of 2025. Use the Claims Explorer to verify your own claims against SEC data.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.href = '#dashboard'}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
          >
            View Dashboard
          </button>
          <button
            onClick={() => window.location.href = '#explorer'}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            Explore Claims
          </button>
        </div>
      </section>

      {/* Footer Note */}
      <div className="text-center text-sm text-gray-500 pt-4">
        <p>
          Built with React, Fastify, SEC EDGAR API, Finnhub API, and Claude AI
        </p>
        <p className="mt-1">
          Data sourced from official SEC EDGAR XBRL filings and verified earnings call transcripts
        </p>
      </div>
    </div>
  );
}
