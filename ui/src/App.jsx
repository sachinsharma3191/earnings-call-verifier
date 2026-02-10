import React, { useState } from 'react';
import { TrendingUp, BarChart3, Search, Info } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CompanyDetail from './pages/CompanyDetail';
import ClaimExplorer from './pages/ClaimExplorer';
import About from './pages/About';
import { useCompanies } from './context/CompaniesContext';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const { companies, loading: loadingCompanies, error: companiesError } = useCompanies();

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'explorer', label: 'Claims Explorer', icon: Search },
    { id: 'about', label: 'About', icon: Info },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
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
        return (
          <CompanyDetail 
            company={selectedCompany}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'explorer':
        return <ClaimExplorer companies={companies} />;
      case 'about':
        return <About />;
      default:
        return <Dashboard companies={companies} loading={loadingCompanies} error={companiesError} onSelectCompany={(company) => { setSelectedCompany(company); setCurrentView('company'); }} />;
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
                  <p className="text-xs text-gray-400">SEC EDGAR + Transcript Analysis</p>
                </div>
              </div>
              
              {/* Data Coverage Badge */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-900/30 rounded-lg border border-blue-700/50">
                <span className="text-xs font-semibold text-blue-400">
                  10 Companies × 4 Quarters
                </span>
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
