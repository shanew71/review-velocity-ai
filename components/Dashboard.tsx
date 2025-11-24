import React, { useState, useEffect, useCallback } from 'react';
import Widget from './Widget';
import SetupGuide from './SetupGuide';
import { DataService } from '../services/dataService';
import { Tier, WidgetState, BusinessData, AnalysisResult } from '../types';
import { Search, Lock, UserCheck, RefreshCw, BarChart, FileCode, Zap, Code, Globe, Bot, MapPin } from 'lucide-react';

const dataService = new DataService();

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'docs'>('generator');
  
  // App State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [businessId, setBusinessId] = useState<string>('b1');
  const [tier, setTier] = useState<Tier>('PROSPECT');
  const [state, setState] = useState<WidgetState>({
    businessData: null,
    analysis: null,
    tier: 'PROSPECT',
    loading: false,
    analyzing: false,
    error: null,
  });

  // Load Data Logic
  const loadData = useCallback(async (forceRefresh = false, customQuery = '') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      if (forceRefresh) dataService.clearCache();
      
      // Pass the custom search query if provided
      const queryToUse = customQuery || (businessId === 'b1' || businessId === 'b2' ? '' : businessId);
      
      const { data, analysis } = await dataService.getWidgetData(businessId, tier, queryToUse);
      
      setState(prev => ({ 
        ...prev, 
        businessData: data, 
        analysis: analysis, 
        loading: false,
        analyzing: !analysis && !!data // If no analysis in cache but we have data, we need to run it
      }));

      // If missing analysis, run it now
      if (!analysis && data) {
         runAI(data, tier);
      }

    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, loading: false, error: 'Failed to load business data.' }));
    }
  }, [businessId, tier]);

  const runAI = async (data: BusinessData, currentTier: Tier) => {
      try {
        const result = await dataService.runAnalysis(data, currentTier);
        setState(prev => ({ ...prev, analysis: result, analyzing: false }));
      } catch (e) {
        setState(prev => ({ ...prev, analyzing: false, error: 'AI Analysis failed.' }));
      }
  };

  // Handle manual search submission
  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if(searchQuery.trim()) {
          setBusinessId(searchQuery); // Use the query as the ID for now
          loadData(true, searchQuery);
      }
  };

  useEffect(() => {
    // Initial load with default mock
    if(businessId === 'b1' || businessId === 'b2') {
        loadData();
    }
  }, [loadData]); // Removing businessId from deps to prevent double-fire on manual search

  // Handler for Auth Simulation
  const handleClientAuth = () => {
    const win = window.open('', '_blank', 'width=500,height=600');
    if(win) {
        win.document.write('<h1>Connecting to Google Business Profile...</h1><p>Please wait...</p>');
        setTimeout(() => {
            win.close();
            setTier('CLIENT'); 
            setTimeout(() => {
                dataService.clearCache(); 
                loadData(true);
            }, 500);
        }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
               <BarChart className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">ReviewVelocity</span>
          </div>
          <nav className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('generator')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'generator' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Widget Generator
            </button>
            <button 
              onClick={() => setActiveTab('docs')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'docs' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <span className="flex items-center gap-2"><FileCode className="w-4 h-4"/> Documentation</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <div className="max-w-7xl mx-auto">
          
          {activeTab === 'docs' ? (
            <SetupGuide />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Panel: Controls */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Search / Select Business */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Target Business</h3>
                  
                  {/* Manual Search Input */}
                  <form onSubmit={handleSearch} className="mb-4">
                      <label className="block text-xs text-slate-500 mb-1">Search Google Maps</label>
                      <div className="relative flex gap-2">
                        <input 
                            type="text" 
                            placeholder="e.g. Joe's Pizza, New York"
                            className="flex-grow pl-3 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            <Search className="w-4 h-4" />
                        </button>
                      </div>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-400">Or select demo</span>
                    </div>
                  </div>

                  <div className="mt-4 relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <select 
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
                      value={businessId}
                      onChange={(e) => {
                          setBusinessId(e.target.value);
                          setSearchQuery(''); // Clear search if picking demo
                          setTier('PROSPECT'); 
                          // Immediate reload for demo selection
                          setTimeout(() => loadData(false, ''), 0);
                      }}
                    >
                      <option value="b1">Apex Coffee Roasters (Mock)</option>
                      <option value="b2">Modern Dental Studio (Mock)</option>
                    </select>
                  </div>
                </div>

                {/* Tier Selection */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Access Tier</h3>
                  
                  <div className="space-y-3">
                    {/* Prospect Mode */}
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${tier === 'PROSPECT' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
                      onClick={() => setTier('PROSPECT')}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">Prospecting Mode</span>
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Public Data</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">Analyzes last 5 reviews.</p>
                      {tier === 'PROSPECT' && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                    </div>

                    {/* Client Mode */}
                    <div 
                      className={`p-4 rounded-lg border-2 transition-all ${tier === 'CLIENT' ? 'border-green-500 bg-green-50' : 'border-slate-100'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">Client Mode</span>
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Authenticated</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">Analyzes last 25 reviews via GBP API.</p>
                      
                      {tier === 'CLIENT' ? (
                        <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                           <UserCheck className="w-4 h-4" /> Connected to GBP
                        </div>
                      ) : (
                        <button 
                          onClick={handleClientAuth}
                          className="w-full py-2 bg-white border border-slate-300 rounded shadow-sm text-sm text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                        >
                          <Lock className="w-3 h-3" /> Connect Google Business Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <button 
                  onClick={() => loadData(true)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Regenerate Analysis
                </button>
                
              </div>

              {/* Right Panel: Widget Preview */}
              <div className="lg:col-span-8 flex flex-col items-center">
                 <div className="w-full flex justify-between items-center mb-4 px-2">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        Widget Preview 
                        <span className="text-xs font-normal bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Universal Code Ready
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                         <Bot className="w-3 h-3 text-indigo-500" />
                         Optimized for: ChatGPT, Gemini, Claude, Perplexity, & Google Search
                      </p>
                    </div>
                    <span className="text-sm text-slate-500">
                      Status: <span className="text-green-500 font-bold">Active</span>
                    </span>
                 </div>
                 
                 <div className="w-full bg-slate-200/50 p-8 rounded-2xl border border-slate-200 min-h-[500px] flex items-center justify-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
                    <Widget 
                      data={state.businessData}
                      analysis={state.analysis}
                      loading={state.loading}
                      analyzing={state.analyzing}
                      tier={tier}
                    />
                 </div>
                 
                 <div className="mt-6 w-full max-w-2xl bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs overflow-x-auto relative">
                   <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 text-green-400 text-[10px] border border-green-900 bg-green-900/20 px-2 py-1 rounded">
                        <Code className="w-3 h-3" /> JSON-LD Included
                      </div>
                   </div>
                   <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2 mr-20">
                      <span className="font-bold text-indigo-400">Universal Embed Code</span>
                      <button className="text-slate-400 hover:text-white" onClick={() => alert("Copied to clipboard!")}>Copy</button>
                   </div>
                   <code>
                     {`<div id="rv-widget" data-business="${businessId || 'demo'}"></div>
<script src="https://cdn.reviewvelocity.com/universal-widget.js"></script>`}
                   </code>
                 </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
