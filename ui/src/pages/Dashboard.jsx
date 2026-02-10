import React from 'react';
import { FileText, ChevronRight, Database, Building2 } from 'lucide-react';

function Dashboard({ companies, loading, error, onSelectCompany }) {
  const totalCompanies = companies?.length || 0;
  const companiesLoaded = companies?.filter((c) => !c.error)?.length || 0;

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
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Companies</span>
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold">{totalCompanies}</div>
          <p className="text-xs text-gray-500 mt-2">
            SEC EDGAR-backed financials
          </p>
        </div>

        <div className="stat-card border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Loaded</span>
            <Database className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">{companiesLoaded}</div>
          <p className="text-xs text-gray-500 mt-2">
            Company facts retrieved
          </p>
        </div>

        <div className="stat-card border-yellow-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Quarters</span>
            <Building2 className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400">4</div>
          <p className="text-xs text-gray-500 mt-2">
            Latest SEC 10-Q periods
          </p>
        </div>

        <div className="stat-card border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Claims</span>
            <FileText className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400">Claude Skill</div>
          <p className="text-xs text-gray-500 mt-2">
            Extraction in Claude
          </p>
        </div>
      </div>

      {/* Companies Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Companies Analyzed</h3>
          <span className="text-sm text-gray-400">
            {companies.length} companies • Click to view details
          </span>
        </div>

        {loading && (
          <div className="card p-8 text-center text-gray-400">Loading companies from SEC EDGAR...</div>
        )}

        {error && (
          <div className="card p-8 text-center text-red-300">{error}</div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && !error && companies.map((company) => {
            return (
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
            );
          })}
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
