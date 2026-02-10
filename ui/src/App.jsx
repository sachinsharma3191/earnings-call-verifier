import React, { useState } from 'react';
import { TrendingUp, BarChart3, Search, Info, FileText } from 'lucide-react';
import SinglePageVerifier from './pages/SinglePageVerifier';
import TranscriptSources from './pages/TranscriptSources';
import About from './pages/About';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [mode, setMode] = useState('static'); // 'static' or 'live'

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'transcripts', label: 'Transcript Sources', icon: FileText },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="App">
      <SinglePageVerifier />
    </div>
  );
}

export default App;
