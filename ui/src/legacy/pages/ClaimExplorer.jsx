import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertTriangle, User, Building } from 'lucide-react';

function ClaimExplorer({ companies }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Flatten all claims
  const allClaims = useMemo(() => {
    const claims = [];
    companies.forEach(company => {
      Object.entries(company.verifications).forEach(([quarter, verification]) => {
        verification.claims.forEach(claim => {
          claims.push({
            ...claim,
            companyTicker: company.ticker,
            companyName: company.name,
            companySector: company.sector,
            quarter
          });
        });
      });
    });
    return claims;
  }, [companies]);

  // Calculate executive statistics
  const executiveStats = useMemo(() => {
    const stats = {};
    allClaims.forEach(claim => {
      const exec = claim.speaker || 'Unknown';
      if (!stats[exec]) {
        stats[exec] = {
          speaker: exec,
          role: claim.role || 'Unknown',
          totalClaims: 0,
          accurate: 0,
          discrepant: 0,
          unverifiable: 0
        };
      }
      stats[exec].totalClaims++;
      if (claim.status === 'accurate') stats[exec].accurate++;
      else if (claim.status === 'discrepant') stats[exec].discrepant++;
      else if (claim.status === 'unverifiable') stats[exec].unverifiable++;
    });
    
    return Object.values(stats).map(stat => {
      const verifiable = stat.accurate + stat.discrepant;
      const accuracyScore = verifiable > 0 ? (stat.accurate / verifiable) * 100 : 0;
      return {
        ...stat,
        accuracyScore: Math.round(accuracyScore * 10) / 10
      };
    }).sort((a, b) => b.totalClaims - a.totalClaims);
  }, [allClaims]);

  // Filter claims
  const filteredClaims = useMemo(() => {
    const filtered = allClaims.filter(claim => {
      const matchesSearch = 
        claim.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.metric.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
      const matchesCompany = companyFilter === 'all' || claim.companyTicker === companyFilter;
      const matchesSeverity = severityFilter === 'all' || 
        (claim.status === 'discrepant' && claim.severity === severityFilter);
      
      return matchesSearch && matchesStatus && matchesCompany && matchesSeverity;
    });
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
    return filtered;
  }, [allClaims, searchTerm, statusFilter, companyFilter, severityFilter]);

  // Paginate filtered claims
  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
  const paginatedClaims = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredClaims.slice(startIndex, endIndex);
  }, [filteredClaims, currentPage, itemsPerPage]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accurate':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'discrepant':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Claims Explorer</h2>
        <p className="text-gray-400">Search and filter verified claims from earnings calls</p>
      </div>

      {/* Executive Analysis Summary */}
      {executiveStats.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-400" />
            Executive Accuracy Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {executiveStats.map((exec, idx) => (
              <div key={idx} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-white">{exec.speaker}</div>
                    <div className="text-xs text-gray-400">{exec.role}</div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    exec.accuracyScore >= 80 ? 'text-green-400' :
                    exec.accuracyScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {exec.accuracyScore}%
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{exec.totalClaims} claims</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">✓ {exec.accurate}</span>
                    <span className="text-red-400">✗ {exec.discrepant}</span>
                    <span className="text-gray-500">? {exec.unverifiable}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm text-gray-400 mb-2 font-medium">Search Claims</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by text, speaker, metric, or company..."
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="accurate">✓ Accurate</option>
              <option value="discrepant">✗ Discrepant</option>
              <option value="unverifiable">? Unverifiable</option>
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Company</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Companies</option>
              {companies.map(company => (
                <option key={company.ticker} value={company.ticker}>
                  {company.ticker} - {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Severity Filter (only for discrepant) */}
        {statusFilter === 'discrepant' && (
          <div className="mt-4">
            <label className="block text-sm text-gray-400 mb-2 font-medium">Severity Level</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'high', 'moderate', 'low'].map(severity => (
                <button
                  key={severity}
                  onClick={() => setSeverityFilter(severity)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    severityFilter === severity
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Count and Pagination Info */}
        <div className="mt-4 pt-4 border-t border-gray-600 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Showing <span className="font-semibold text-white">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredClaims.length)}-{Math.min(currentPage * itemsPerPage, filteredClaims.length)}</span> of <span className="font-semibold text-white">{filteredClaims.length}</span> claims
          </span>
          {(searchTerm || statusFilter !== 'all' || companyFilter !== 'all' || severityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCompanyFilter('all');
                setSeverityFilter('all');
                setCurrentPage(1);
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {paginatedClaims.length === 0 ? (
          <div className="card p-12 text-center">
            <Filter className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No claims match your filters</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria or clearing filters</p>
          </div>
        ) : (
          paginatedClaims.map((claim) => (
            <div 
              key={claim.id}
              className={`card p-6 hover:shadow-xl transition-all ${
                claim.status === 'discrepant' ? 'border-red-500/30' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(claim.status)}
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-white">{claim.companyTicker}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 text-sm">{claim.companyName}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 text-sm">{claim.quarter}</span>
                    </div>
                    <div className="flex items-center mt-2 space-x-2">
                      <User className="h-3 w-3 text-gray-500" />
                      <span className="text-sm text-gray-400">{claim.speaker} ({claim.role})</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-blue-400">{claim.metric}</span>
                    </div>
                  </div>
                </div>
                <span className={`badge ${
                  claim.status === 'accurate' 
                    ? 'badge-success'
                    : claim.status === 'discrepant'
                    ? 'badge-danger'
                    : 'badge-neutral'
                }`}>
                  {claim.status.toUpperCase()}
                </span>
              </div>

              {/* Claim Text */}
              <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                <p className="text-gray-300 italic leading-relaxed">"{claim.text}"</p>
              </div>

              {/* Comparison */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-400 mb-1 font-medium">Claimed</div>
                  <div className="font-semibold text-lg">
                    {claim.unit === 'billion' ? '$' : ''}{claim.claimed}{claim.unit === 'billion' ? 'B' : claim.unit === 'percent' ? '%' : ''}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1 font-medium">SEC Filing</div>
                  <div className="font-semibold text-lg text-green-400">
                    {claim.unit === 'billion' ? '$' : ''}{claim.actual}{claim.unit === 'billion' ? 'B' : claim.unit === 'percent' ? '%' : ''}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1 font-medium">Difference</div>
                  <div className={`font-semibold text-lg ${
                    claim.status === 'discrepant' ? 'text-red-400' : 'text-gray-300'
                  }`}>
                    {claim.difference > 0 ? '+' : ''}{claim.difference.toFixed(2)}{claim.unit === 'billion' ? 'B' : claim.unit === 'percent' ? 'pts' : ''}
                    <span className="text-xs ml-1">({claim.percentDiff.toFixed(2)}%)</span>
                  </div>
                </div>
              </div>

              {/* Flags */}
              {claim.flag && (
                <div className="mt-4 pt-4 border-t border-gray-600 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Analysis:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${
                      claim.severity === 'high' ? 'badge-danger' :
                      claim.severity === 'moderate' ? 'badge-warning' :
                      'badge-neutral'
                    }`}>
                      {claim.severity} SEVERITY
                    </span>
                    <span className="badge-warning">
                      {claim.flag.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="card p-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ClaimExplorer;
