import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, XCircle, FileText, ChevronRight, Award } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { overallStats } from '../data/verificationData';

function Dashboard({ companies, onSelectCompany }) {
  const COLORS = {
    accurate: '#10b981',
    discrepant: '#ef4444',
    unverifiable: '#6b7280'
  };

  const pieData = [
    { name: 'Accurate', value: overallStats.accurateClaims, color: COLORS.accurate },
    { name: 'Discrepant', value: overallStats.discrepantClaims, color: COLORS.discrepant },
    { name: 'Unverifiable', value: overallStats.unverifiableClaims, color: COLORS.unverifiable }
  ];

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
            <span className="text-gray-400 text-sm font-medium">Total Claims Analyzed</span>
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold">{overallStats.totalClaims}</div>
          <p className="text-xs text-gray-500 mt-2">
            Across {overallStats.companiesAnalyzed} companies
          </p>
        </div>

        <div className="stat-card border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Accurate Claims</span>
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">{overallStats.accurateClaims}</div>
          <p className="text-xs text-gray-500 mt-2">
            Within tolerance thresholds
          </p>
        </div>

        <div className="stat-card border-red-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Discrepant Claims</span>
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-400">{overallStats.discrepantClaims}</div>
          <p className="text-xs text-gray-500 mt-2">
            Significant deviations detected
          </p>
        </div>

        <div className="stat-card border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">Overall Accuracy</span>
            <Award className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400">{overallStats.overallAccuracy}%</div>
          <p className="text-xs text-gray-500 mt-2">
            Verifiable claims accurate
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims Distribution */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4">Claims Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Accuracy by Company */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4">Accuracy by Company</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={overallStats.accuracyByCompany}>
              <XAxis 
                dataKey="ticker" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="accuracy" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Discrepancies Alert */}
      <div className="card p-6 border-red-500/30 bg-red-900/10">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-red-400 mt-1 mr-4 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-red-400 mb-4">
              🚨 Top Discrepancies Detected
            </h3>
            <div className="space-y-3">
              {overallStats.topDiscrepancies.map((disc, idx) => (
                <div 
                  key={idx}
                  className="bg-gray-800/70 rounded-lg p-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="text-2xl font-bold text-gray-500 mt-1">
                        #{idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className="font-semibold text-white">{disc.company}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-300">{disc.companyName}</span>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                          <span className="font-medium">{disc.claim}</span>
                          {' • '}
                          <span>{disc.executive}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div>
                            <span className="text-gray-500">Claimed: </span>
                            <span className="font-medium">{disc.claimed}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Actual: </span>
                            <span className="font-medium text-green-400">{disc.actual}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-2xl font-bold ${
                        disc.severity === 'high' ? 'text-red-400' : 'text-orange-400'
                      }`}>
                        +{disc.difference.toFixed(2)}%
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                        disc.severity === 'high' 
                          ? 'bg-red-500/20 text-red-300' 
                          : 'bg-orange-500/20 text-orange-300'
                      }`}>
                        {disc.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => {
            const verification = company.verifications[company.latestQuarter];
            const accuracyColor = 
              verification.accuracyScore >= 70 ? 'text-green-400' :
              verification.accuracyScore >= 50 ? 'text-yellow-400' :
              'text-red-400';

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
                      {company.sector}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Accuracy</div>
                    <div className={`text-2xl font-bold ${accuracyColor}`}>
                      {verification.accuracyScore}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Total Claims</div>
                    <div className="text-2xl font-bold text-gray-300">
                      {verification.totalClaims}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-green-400 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {verification.accurate}
                    </span>
                    <span className="text-red-400 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" />
                      {verification.discrepant}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">{company.latestQuarter}</span>
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
