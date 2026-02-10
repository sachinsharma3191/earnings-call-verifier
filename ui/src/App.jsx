import React, { useEffect, useState } from 'react';
import { TrendingUp, BarChart3, Search, Info } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CompanyDetail from './pages/CompanyDetail';
import ClaimExplorer from './pages/ClaimExplorer';
import LegacyDashboard from './legacy/pages/Dashboard';
import LegacyCompanyDetail from './legacy/pages/CompanyDetail';
import LegacyClaimExplorer from './legacy/pages/ClaimExplorer';
import { companiesData as legacyCompaniesData } from './legacy/data/verificationData';
import About from './pages/About';
import { apiClient } from './utils/apiClient';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [mode, setMode] = useState('static'); // 'static' or 'live'
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [companiesError, setCompaniesError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingCompanies(true);
      setCompaniesError(null);
      try {
        const list = await apiClient.getCompanies();
        const tickers = (list?.companies || []).map((c) => c.ticker);

        const detailed = await Promise.all(
          tickers.map(async (ticker) => {
            try {
              const fin = await apiClient.getCompany(ticker, 4);
              return {
                ticker: fin.ticker,
                name: fin.company_name,
                cik: fin.cik,
                quarters: (fin.quarters || []).map((q) => `${q.fiscal_period} ${q.fiscal_year}`),
                latestQuarter: fin.quarters?.[0] ? `${fin.quarters[0].fiscal_period} ${fin.quarters[0].fiscal_year}` : null,
                financials: fin
              };
            } catch (e) {
              return {
                ticker,
                name: ticker,
                cik: null,
                quarters: [],
                latestQuarter: null,
                financials: null,
                error: e?.message || 'Failed to load company'
              };
            }
          })
        );

        if (!cancelled) setCompanies(detailed);
      } catch (e) {
        if (!cancelled) setCompaniesError(e?.message || 'Failed to load companies');
      } finally {
        if (!cancelled) setLoadingCompanies(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'explorer', label: 'Claims Explorer', icon: Search },
    { id: 'about', label: 'About', icon: Info },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        if (mode === 'static') {
          return (
            <LegacyDashboard 
              companies={legacyCompaniesData}
              onSelectCompany={(company) => {
                setSelectedCompany(company);
                setCurrentView('company');
              }}
            />
          );
        }
        return (
          <Dashboard 
            companies={companies}
            loading={loadingCompanies}
            error={companiesError}
            onSelectCompany={(company) => {
              setSelectedCompany(company);
              setCurrentView('company');
            }}
          />
        );
      case 'company':
        if (mode === 'static') {
          return (
            <LegacyCompanyDetail 
              company={selectedCompany}
              onBack={() => setCurrentView('dashboard')}
            />
          );
        }
        return (
          <CompanyDetail 
            company={selectedCompany}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'explorer':
        if (mode === 'static') {
          return <LegacyClaimExplorer companies={legacyCompaniesData} />;
        }
        return <ClaimExplorer companies={companies} />;
      case 'about':
        return <About />;
      default:
        return mode === 'static' 
          ? <LegacyDashboard companies={legacyCompaniesData} onSelectCompany={(company) => { setSelectedCompany(company); setCurrentView('company'); }} />
          : <Dashboard companies={companies} loading={loadingCompanies} error={companiesError} onSelectCompany={(company) => { setSelectedCompany(company); setCurrentView('company'); }} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => setCurrentView('dashboard')}
              >
                <TrendingUp className="h-8 w-8 text-blue-500 group-hover:text-blue-400 transition-colors" />
                <div>
                  <h1 className="text-xl font-bold gradient-text">
                    Earnings Verifier
                  </h1>
                  <p className="text-xs text-gray-400">SEC Filing Analysis</p>
                </div>
              </div>
              
              {/* Mode Toggle */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-700/50 rounded-lg border border-gray-600">
                <button
                  onClick={() => setMode('static')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    mode === 'static'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Static
                </button>
                <button
                  onClick={() => setMode('live')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    mode === 'live'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Live
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id || 
                  (currentView === 'company' && item.id === 'dashboard');
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={isActive ? 'nav-link-active' : 'nav-link-inactive'}
                  >
                    <Icon className="inline h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {renderView()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/50 border-t border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400 text-center md:text-left">
              <p className="font-medium">Data Sources</p>
              <p className="mt-1">SEC EDGAR API • Official 10-Q/10-K Filings</p>
            </div>
            <div className="text-sm text-gray-400 text-center">
              <p>Built for Kip Engineering Take-Home Assignment</p>
              <p className="mt-1">Powered by Claude AI • React • Tailwind CSS</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <a 
                href="https://github.com/sachinsharma3191/earnings-call-verifier" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
              <span>•</span>
              <a 
                href="https://www.sec.gov" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                SEC.gov
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
