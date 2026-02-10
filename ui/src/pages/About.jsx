import React from 'react';
import { Database, Code, TrendingUp, Shield, Zap, Github } from 'lucide-react';

function About() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4 gradient-text">About This Project</h2>
        <p className="text-xl text-gray-300">
          Automatically verify executive claims from earnings calls against official SEC filings
        </p>
      </div>

      {/* Problem & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 border-red-500/30 bg-red-900/10">
          <h3 className="text-lg font-semibold mb-3 text-red-400">The Problem</h3>
          <p className="text-gray-300">
            Executives make hundreds of quantitative claims during earnings calls. 
            Manually verifying each claim against SEC filings is time-consuming, 
            error-prone, and often impossible at scale.
          </p>
        </div>
        <div className="card p-6 border-green-500/30 bg-green-900/10">
          <h3 className="text-lg font-semibold mb-3 text-green-400">The Solution</h3>
          <p className="text-gray-300">
            Automated verification system that extracts claims from transcripts, 
            compares them with official SEC data, and flags discrepancies beyond 
            tolerance thresholds.
          </p>
        </div>
      </div>

      {/* Key Features */}
      <div className="card p-8">
        <h3 className="text-2xl font-bold mb-6">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4">
            <Database className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">Official SEC Data</h4>
              <p className="text-sm text-gray-400">
                Uses SEC EDGAR API for reliable, official financial data from 10-Q/10-K filings
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Code className="h-6 w-6 text-purple-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">Automated Extraction</h4>
              <p className="text-sm text-gray-400">
                Pattern matching and LLM-powered extraction of quantitative claims from transcripts
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <TrendingUp className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">Discrepancy Detection</h4>
              <p className="text-sm text-gray-400">
                Tolerance-based verification with customizable thresholds for different metric types
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Shield className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">Misleading Detection</h4>
              <p className="text-sm text-gray-400">
                Flags optimistic bias, high discrepancies, and patterns of selective disclosure
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Methodology */}
      <div className="card p-8 bg-blue-900/10 border-blue-500/30">
        <h3 className="text-2xl font-bold mb-6 text-blue-400">Methodology</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 text-sm">1</span>
              Data Acquisition
            </h4>
            <p className="text-sm text-gray-300 ml-11">
              Fetch financial data from SEC EDGAR API and earnings call transcripts from various sources
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 text-sm">2</span>
              Claim Extraction
            </h4>
            <p className="text-sm text-gray-300 ml-11">
              Use pattern matching and LLM analysis to identify and extract quantitative claims with context
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 text-sm">3</span>
              Verification
            </h4>
            <p className="text-sm text-gray-300 ml-11">
              Match claims to SEC filing line items, calculate actual values, and compare with tolerance thresholds
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 text-sm">4</span>
              Analysis & Reporting
            </h4>
            <p className="text-sm text-gray-300 ml-11">
              Generate accuracy scores, flag discrepancies, and provide detailed explanations with evidence
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card p-8">
        <h3 className="text-2xl font-bold mb-6">Technology Stack</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-blue-400">Frontend</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• React 18</li>
              <li>• Tailwind CSS</li>
              <li>• Lucide Icons</li>
              <li>• Recharts</li>
              <li>• Vite</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-purple-400">Backend</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Python 3.x</li>
              <li>• SEC EDGAR API</li>
              <li>• JSON Data Storage</li>
              <li>• Pattern Matching</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-green-400">Data Sources</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• SEC EDGAR (Official)</li>
              <li>• 10-Q/10-K Filings</li>
              <li>• XBRL Format</li>
              <li>• Sample Transcripts</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Findings Summary */}
      <div className="card p-8 border-yellow-500/30 bg-yellow-900/10">
        <h3 className="text-2xl font-bold mb-4 text-yellow-400">Key Findings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Overall Statistics</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• 29 claims analyzed across 3 companies</li>
              <li>• 34.5% overall accuracy rate</li>
              <li>• 11 discrepancies detected (38%)</li>
              <li>• Average discrepancy: 3.6%</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Pattern Discoveries</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• Profitability metrics most inflated</li>
              <li>• Growth companies inflate more</li>
              <li>• CEOs less accurate than CFOs</li>
              <li>• Revenue generally accurate</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="card p-8">
        <h3 className="text-2xl font-bold mb-6">Project Links</h3>
        <div className="flex flex-col space-y-4">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-3 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Github className="h-5 w-5" />
            <span>View Source Code on GitHub</span>
          </a>
          <a 
            href="https://www.sec.gov/edgar" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-3 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Database className="h-5 w-5" />
            <span>SEC EDGAR Database</span>
          </a>
          <a 
            href="https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-3 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Zap className="h-5 w-5" />
            <span>Example: Apple's SEC Data (JSON)</span>
          </a>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-gray-400 py-8 border-t border-gray-700">
        <p className="font-semibold mb-2">Built for Kip Engineering Take-Home Assignment</p>
        <p>Demonstrating data engineering, LLM integration, and full-stack development skills</p>
      </div>
    </div>
  );
}

export default About;
