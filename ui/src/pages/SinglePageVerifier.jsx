
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertCircle, CheckCircle, HelpCircle, ChevronRight, Menu, FileText, Activity } from 'lucide-react';
import { getMockClaims, getMockTranscript, getAllMockCompanies } from '../data/mockTranscripts';

const SinglePageVerifier = () => {
    const [selectedCompany, setSelectedCompany] = useState('AAPL');
    const [selectedQuarter, setSelectedQuarter] = useState('Q4 2025');
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [usingMockData, setUsingMockData] = useState(false);

    // Initial Data Load with fallback to mock data
    useEffect(() => {
        fetch('/api/companies')
            .then(res => res.json())
            .then(data => {
                if (data.companies) {
                    setCompanies(data.companies);
                    setUsingMockData(false);
                }
            })
            .catch(err => {
                console.error("Failed to load companies, using mock data", err);
                // Fallback to mock companies
                const mockCompanies = [
                    { ticker: 'AAPL', name: 'Apple Inc.' },
                    { ticker: 'NVDA', name: 'NVIDIA Corporation' },
                    { ticker: 'MSFT', name: 'Microsoft Corporation' }
                ];
                setCompanies(mockCompanies);
                setUsingMockData(true);
            });
    }, []);

    // Run Analysis Handler with mock data fallback
    const handleAnalyze = async () => {
        setAnalyzing(true);
        setAnalysisResult(null);
        try {
            const [q, year] = selectedQuarter.split(' ');
            const qNum = q.replace('Q', '');

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticker: selectedCompany,
                    quarter: qNum,
                    year: year
                })
            });

            const result = await response.json();
            if (response.ok) {
                setAnalysisResult(result);
                setUsingMockData(false);
            } else {
                throw new Error(result.error || 'API failed');
            }
        } catch (error) {
            console.error("Analysis failed, using mock data:", error);
            // Fallback to mock data
            const mockClaims = getMockClaims(selectedCompany, selectedQuarter);
            const mockTranscript = getMockTranscript(selectedCompany, selectedQuarter);
            
            if (mockClaims && mockClaims.length > 0) {
                setAnalysisResult({
                    ticker: selectedCompany,
                    quarter: selectedQuarter,
                    claims: mockClaims,
                    transcript: mockTranscript,
                    summary: {
                        total: mockClaims.length,
                        verified: mockClaims.filter(c => c.status === 'verified').length,
                        discrepancies: mockClaims.filter(c => c.status === 'minor_discrepancy').length,
                        failed: mockClaims.filter(c => c.status === 'failed').length
                    },
                    data_source: 'mock_sample'
                });
                setUsingMockData(true);
            } else {
                alert("No data available for this company/quarter");
            }
        } finally {
            setAnalyzing(false);
        }
    };

    // Mock quarters for selection (could be dynamic)
    const quarters = ['Q4 2025', 'Q3 2025', 'Q2 2025', 'Q1 2025'];

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
            {/* Sidebar */}
            <div className={`bg-slate-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}>
                <div className="p-4 flex items-center justify-between border-b border-slate-700">
                    {sidebarOpen && <h1 className="font-bold text-lg tracking-tight">EarningsVerifier</h1>}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-800 rounded">
                        <Menu size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    {sidebarOpen && <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase">Companies</div>}
                    {companies.map(c => (
                        <button
                            key={c.ticker}
                            onClick={() => setSelectedCompany(c.ticker)}
                            className={`w-full text-left px-4 py-3 flex items-center hover:bg-slate-800 transition-colors ${selectedCompany === c.ticker ? 'bg-indigo-600 border-l-4 border-white' : ''}`}
                        >
                            <span className="font-mono font-bold w-12">{c.ticker}</span>
                            {sidebarOpen && <span className="text-sm truncate opacity-90">{c.name || 'Company'}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header Bar */}
                <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            {selectedCompany}
                            <span className="mx-2 text-gray-400">/</span>
                            <select
                                value={selectedQuarter}
                                onChange={(e) => setSelectedQuarter(e.target.value)}
                                className="bg-gray-100 border-none rounded px-3 py-1 text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
                            >
                                {quarters.map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                        </h2>
                    </div>

                    <div className="flex items-center space-x-3">
                        {usingMockData && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                                Using Sample Data
                            </span>
                        )}
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className={`px-6 py-2 rounded-lg font-bold text-white shadow-md transition-all transform hover:scale-105 ${analyzing ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {analyzing ? (
                                <span className="flex items-center"><Activity className="animate-spin mr-2" size={18} /> Analyzing...</span>
                            ) : (
                                <span className="flex items-center"><FileText className="mr-2" size={18} /> Analyze Transcript</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Workspace Area */}
                <div className="flex-1 overflow-auto p-6">
                    {!analysisResult && !analyzing && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Activity size={64} className="mb-4 opacity-20" />
                            <p className="text-lg">Select a company and quarter, then click Analyze.</p>
                        </div>
                    )}

                    {analyzing && (
                        <div className="h-full flex flex-col items-center justify-center text-indigo-600">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-6"></div>
                            <p className="text-xl font-medium animate-pulse">Running Verification Pipeline...</p>
                            <div className="mt-4 text-sm text-gray-500 space-y-1 text-center">
                                <p>Fetching transcript...</p>
                                <p>Extracting extracted claims...</p>
                                <p>Verifying against SEC EDGAR...</p>
                            </div>
                        </div>
                    )}

                    {analysisResult && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

                            {/* Left: Transcript & Source */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col h-full overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-gray-800 flex items-center">
                                        <FileText className="mr-2 text-indigo-500" size={20} /> Transcript Source
                                    </h3>
                                    <span className="text-xs font-mono px-2 py-1 bg-gray-200 rounded text-gray-600">
                                        {analysisResult.source?.source || 'Proxy'}
                                    </span>
                                </div>
                                <div className="p-4 overflow-auto flex-1 font-serif text-gray-700 leading-relaxed space-y-4">
                                    {/* Render mock transcript text if available in extracted claims or just a summary */}
                                    {/* Since pipeline returns claims, we might not have the full text here unless we pass it. 
                        For now, let's show the claims map as logical segments of the transcript. */}
                                    <div className="text-sm text-gray-500 italic mb-4">
                                        Source URL: {analysisResult.source?.url ? <a href={analysisResult.source.url} target="_blank" className="text-indigo-600 hover:underline">{analysisResult.source.url}</a> : 'N/A'}
                                    </div>
                                    {analysisResult.claims && analysisResult.claims.map((claim, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg border-l-4 ${claim.status === 'accurate' ? 'border-green-500 bg-green-50' : claim.status === 'discrepant' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}`}>
                                            <div className="flex items-baseline justify-between mb-1">
                                                <span className="font-bold text-gray-900">{claim.speaker}</span>
                                                <span className="text-xs text-gray-500 uppercase">{claim.role}</span>
                                            </div>
                                            <p className="text-gray-800 mb-2">"{claim.text}"</p>
                                            <div className="flex items-center text-xs space-x-2">
                                                <span className="font-semibold text-gray-500">Claimed: {claim.claimed} {claim.unit}</span>
                                                <ChevronRight size={12} className="text-gray-400" />
                                                <span className={`font-bold ${claim.status === 'accurate' ? 'text-green-700' : claim.status === 'discrepant' ? 'text-red-700' : 'text-yellow-700'}`}>
                                                    Actual: {claim.actual !== null ? claim.actual : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Verification Dashboard */}
                            <div className="flex flex-col space-y-6 h-full overflow-y-auto pr-2">

                                {/* Score Card */}
                                <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Verification Score</h4>
                                        <Activity className={analysisResult.summary.accuracyScore > 80 ? 'text-green-500' : 'text-yellow-500'} />
                                    </div>
                                    <div className="flex items-end">
                                        <span className="text-5xl font-black text-gray-900">{analysisResult.summary.accuracyScore}%</span>
                                        <span className="mb-2 ml-2 text-gray-500 font-medium">Accuracy</span>
                                    </div>
                                    <div className="mt-4 flex space-x-2">
                                        <div className="flex-1 bg-green-100 rounded-lg p-2 text-center text-green-700 font-bold border border-green-200">
                                            {analysisResult.summary.accurate} Validated
                                        </div>
                                        <div className="flex-1 bg-red-100 rounded-lg p-2 text-center text-red-700 font-bold border border-red-200">
                                            {analysisResult.summary.discrepant} Discrepancies
                                        </div>
                                    </div>
                                </div>

                                {/* Discrepancy Chart (Mock for demo) */}
                                <div className="bg-white rounded-xl shadow p-4 border border-gray-100 flex-1">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">Metric Analysis</h4>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={analysisResult.claims.filter(c => c.actual !== null)}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="metric" hide />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="claimed" name="Claimed" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="actual" name="SEC Actual" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SinglePageVerifier;
