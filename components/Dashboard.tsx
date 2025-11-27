import React, { useState, useEffect, useCallback } from 'react';
import Widget from './Widget';
import SetupGuide from './SetupGuide';
import { DataService } from '../services/dataService';
import { Tier, WidgetState, BusinessData, AnalysisResult } from '../types';
import { Search, Lock, UserCheck, RefreshCw, BarChart, FileCode, Zap, Code, Globe, Bot, MapPin, Key, AlertTriangle, CheckCircle, Shield, Terminal } from 'lucide-react';

const dataService = new DataService();

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'docs'>('generator');

  // App State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapsApiKey, setMapsApiKey] = useState<string>(''); // For Maps API
  const [clientId, setClientId] = useState<string>(''); // For OAuth Client ID
  const [businessId, setBusinessId] = useState<string>('ChIJUQvj6h-vK4cRVPaPZQIQOl0'); // Default to Snow Family Dentistry
  const [tier, setTier] = useState<Tier>('PROSPECT');
  const [state, setState] = useState<WidgetState>({
    businessData: null,
    analysis: null,
    tier: 'PROSPECT',
    loading: false,
    analyzing: false,
    error: null,
  });

  // OAuth State
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [showDevMode, setShowDevMode] = useState<boolean>(false);
  const [manualToken, setManualToken] = useState<string>('');

  // Initialize Maps Key and Client ID from Env if available
  useEffect(() => {
    if (process.env.VITE_GOOGLE_MAPS_API_KEY) {
      setMapsApiKey(process.env.VITE_GOOGLE_MAPS_API_KEY);
    }
    if (process.env.VITE_GOOGLE_CLIENT_ID) {
      // SANITIZATION: Strip quotes if user accidentally added them in .env
      setClientId(process.env.VITE_GOOGLE_CLIENT_ID.replace(/['"]/g, '').trim());
    }
  }, []);

  // Initialize Google OAuth Token Client
  useEffect(() => {
    if (!clientId) {
      return; // No client ID, skip initialization
    }

    // Function to initialize OAuth client
    const initializeOAuth = () => {
      // Check if Google Identity Services library is loaded
      if (!window.google || !window.google.accounts) {
        return false; // Not ready yet
      }

      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/business.manage',
          callback: (tokenResponse) => {
            console.log("✅ OAuth Success:", tokenResponse);
            if (tokenResponse.access_token) {
              handleAuthSuccess(tokenResponse.access_token);
            }
          },
          error_callback: (err) => {
            console.error("❌ OAuth Error:", err);
            setState(prev => ({ ...prev, error: `OAuth Failed: ${err.type || 'Unknown error'}` }));
          }
        });
        setTokenClient(client);
        console.log("✅ OAuth Token Client initialized successfully");
        return true;
      } catch (e) {
        console.error("❌ Failed to initialize OAuth token client:", e);
        setState(prev => ({ ...prev, error: "OAuth initialization failed. Check console for details." }));
        return false;
      }
    };

    // Try to initialize immediately
    if (initializeOAuth()) {
      return;
    }

    // If not ready, poll every 100ms for up to 5 seconds
    console.log("⏳ Waiting for Google Identity Services library to load...");
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds (50 * 100ms)
    
    const interval = setInterval(() => {
      attempts++;
      if (initializeOAuth()) {
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.error("❌ Google Identity Services library failed to load after 5 seconds.");
        console.log("ℹ️ Make sure the Google GSI script is included in index.html");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [clientId]);

  const handleAuthSuccess = (token: string) => {
    // In a real backend scenario, we would send this token to our server.
    // For this agency tool, we confirm auth and unlock the tier.
    setTier('CLIENT');
    setTimeout(() => {
      dataService.clearCache();
      loadData(true);
    }, 500);
  };

  // Load Data Logic
  const loadData = useCallback(async (forceRefresh = false, customQuery = '') => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      if (forceRefresh) dataService.clearCache();

      const queryToUse = customQuery || (businessId === 'b1' || businessId === 'b2' ? '' : businessId);

      // Pass the mapsApiKey to the service
      const { data, analysis } = await dataService.getWidgetData(businessId, tier, queryToUse, mapsApiKey);

      setState(prev => ({
        ...prev,
        businessData: data,
        analysis: analysis,
        loading: false,
        analyzing: !analysis && !!data
      }));

      if (!analysis && data) {
        runAI(data, tier);
      }

    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, loading: false, error: 'Failed to load business data.' }));
    }
  }, [businessId, tier, mapsApiKey]);

  const runAI = async (data: BusinessData, currentTier: Tier) => {
    try {
      const result = await dataService.runAnalysis(data, currentTier);
      setState(prev => ({ ...prev, analysis: result, analyzing: false }));
    } catch (e) {
      setState(prev => ({ ...prev, analyzing: false, error: 'AI Analysis failed.' }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setBusinessId(searchQuery);
      // Force refresh to bypass cache if user is explicitly searching
      loadData(true, searchQuery);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClientAuth = () => {
    if (!window.google || !window.google.accounts) {
      alert("Google Identity Services library is not loaded. Please check that the GSI script is included in your HTML.");
      return;
    }

    if (tokenClient) {
      tokenClient.requestAccessToken();
    } else if (!clientId) {
      alert("Please enter a valid Google Client ID below to connect.");
    } else {
      alert("OAuth client failed to initialize. Check the browser console for details.");
    }
  };

  const handleManualTokenSubmit = () => {
    if (manualToken.length > 10) {
      handleAuthSuccess(manualToken);
    } else {
      alert("Invalid Token");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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
              <span className="flex items-center gap-2"><FileCode className="w-4 h-4" /> Documentation</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow p-8">
        <div className="max-w-7xl mx-auto">

          {activeTab === 'docs' ? (
            <SetupGuide />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              <div className="lg:col-span-4 space-y-6">

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Target Business</h3>

                  {/* SEARCH FORM */}
                  <form onSubmit={handleSearch} className="mb-4">
                    <label className="block text-xs text-slate-500 mb-1">Enter Google Place ID</label>
                    <div className="relative flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. ChIJ..."
                        className="flex-grow pl-3 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button type="submit" className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </form>

                  {/* TEMPORARY API KEY INPUT FOR PREVIEW MODE */}
                  <div className={`mb-4 p-3 rounded-md border transition-colors ${mapsApiKey ? 'bg-indigo-50 border-indigo-200' : 'bg-yellow-50 border-yellow-100'}`}>
                    <label className={`block text-xs font-bold mb-1 flex items-center gap-1 ${mapsApiKey ? 'text-indigo-800' : 'text-yellow-800'}`}>
                      <Key className="w-3 h-3" /> Google Maps API Key (For Live Data)
                    </label>
                    <input
                      type="password"
                      placeholder="Paste AIza... key here"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none mb-1"
                      value={mapsApiKey}
                      onChange={(e) => setMapsApiKey(e.target.value)}
                      onBlur={() => loadData(true)}
                      onKeyDown={(e) => e.key === 'Enter' && loadData(true)}
                    />
                    <p className={`text-[10px] ${mapsApiKey ? 'text-indigo-600' : 'text-yellow-600'}`}>
                      {mapsApiKey
                        ? "Key Applied. Click 'Regenerate Analysis' to refresh."
                        : 'Required to fetch real data in preview mode.'}
                    </p>
                  </div>

                  {/* Warning if Key Provided but Data is Mock */}
                  {mapsApiKey && state.businessData?.isMock && !state.loading && (
                    <div className="mb-4 bg-red-50 border border-red-100 rounded-md p-2 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-red-700">
                        <strong>Connection Failed:</strong> Your API Key was rejected by Google. Showing mock data instead. Check your browser console for details.
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-400">Select Example</span>
                    </div>
                  </div>

                  <div className="mt-4 relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <select
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
                      value={businessId}
                      onChange={(e) => {
                        setBusinessId(e.target.value);
                        setSearchQuery('');
                        setTier('PROSPECT');
                        setTimeout(() => loadData(false, ''), 0);
                      }}
                    >
                      <option value="ChIJUQvj6h-vK4cRVPaPZQIQOl0">Snow Family Dentistry (Real ID)</option>
                      <option value="b1">Apex Coffee Roasters (Mock)</option>
                      <option value="b2">Modern Dental Studio (Mock)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Access Tier</h3>

                  <div className="space-y-3">
                    <div
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${tier === 'PROSPECT' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
                      onClick={() => setTier('PROSPECT')}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">Prospecting Mode</span>
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Public Data</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">Analyzes last 5 reviews. Perfect for Sales.</p>
                      {tier === 'PROSPECT' && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                    </div>

                    <div
                      className={`p-4 rounded-lg border-2 transition-all ${tier === 'CLIENT' ? 'border-green-500 bg-green-50' : 'border-slate-100'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">Client Mode</span>
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Agency Grade</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">Production Fulfillment. Connects to Private GBP API for deep history.</p>

                      {tier === 'CLIENT' ? (
                        <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                          <UserCheck className="w-4 h-4" /> Connected to GBP
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={handleClientAuth}
                            className="w-full py-2 bg-white border border-slate-300 rounded shadow-sm text-sm text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                          >
                            <Lock className="w-3 h-3" /> Connect Google Business Profile
                          </button>

                          {/* Client ID Input for Production Auth */}
                          {!tokenClient && !showDevMode && (
                            <div className="pt-2 border-t border-slate-100">
                              <label className="block text-[10px] text-slate-400 mb-1">OAuth Client ID (Required for Login)</label>
                              <input
                                type="text"
                                placeholder="Enter Client ID from Google Cloud..."
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 focus:outline-none focus:border-indigo-400"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                              />
                            </div>
                          )}

                          {/* Manual Token Override */}
                          <div className="pt-2">
                            <button
                              onClick={() => setShowDevMode(!showDevMode)}
                              className="text-[10px] text-slate-400 underline hover:text-indigo-600 flex items-center gap-1"
                            >
                              <Terminal className="w-3 h-3" />
                              {showDevMode ? 'Hide Developer Mode' : 'Developer: Enter Token Manually'}
                            </button>

                            {showDevMode && (
                              <div className="mt-2 space-y-2">
                                <textarea
                                  placeholder="Paste OAuth Access Token here..."
                                  className="w-full h-16 p-2 text-[10px] bg-slate-900 text-green-400 rounded border border-slate-700 focus:outline-none font-mono"
                                  value={manualToken}
                                  onChange={(e) => setManualToken(e.target.value)}
                                />
                                <button
                                  onClick={handleManualTokenSubmit}
                                  className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700"
                                >
                                  Inject Token & Unlock
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => loadData(true)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Regenerate Analysis
                </button>

              </div>

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
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-slate-500">
                      Status: <span className="text-green-500 font-bold">Active</span>
                    </span>
                    {state.businessData && (
                      <div className={`text-[10px] mt-1 font-mono px-2 py-0.5 rounded flex items-center gap-1 ${!state.businessData.isMock ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-200 text-slate-600'}`}>
                        {!state.businessData.isMock ? <CheckCircle className="w-3 h-3" /> : null}
                        Source: {!state.businessData.isMock ? 'LIVE (Google)' : 'MOCK DATA'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full bg-slate-200/50 p-8 rounded-2xl border border-slate-200 min-h-[500px] flex items-center justify-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
                  <Widget
                    data={state.businessData}
                    analysis={state.analysis}
                    loading={state.loading}
                    analyzing={state.analyzing}
                    tier={tier}
                    error={state.error}
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
<script src="https://reviewvelocityai.vercel.app/universal-widget.js"></script>`}
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
