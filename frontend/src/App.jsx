import React, { useState, useEffect } from 'react';
import TickerInput from './components/TickerInput';
import BriefingPanel from './components/BriefingPanel';
import NewsFeed from './components/NewsFeed';
import Watchlist from './components/Watchlist';
import ApiKeyModal from './components/ApiKeyModal';
import { MOCK_SYNTHESES } from './utils/mockData';

// Backend endpoint configuration
const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function App() {
  // Load unified connection settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('aegis_connection_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse connection settings:', e);
      }
    }
    // Fallback/Legacy migration
    const legacyKey = localStorage.getItem('gemini_api_key') || '';
    return {
      provider: legacyKey ? 'gemini' : 'gemini',
      apiKey: legacyKey,
      ollamaEndpoint: 'http://localhost:11434',
      ollamaModel: 'gemma'
    };
  });

  const [timeframeDays, setTimeframeDays] = useState(() => {
    const saved = localStorage.getItem('aegis_requested_timeframe_days');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 20) {
        return parsed;
      }
    }
    return 2;
  });

  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('aegis_watchlist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Self-healing migration: Upgrade any stored mock briefings with the new properties (like usedInSynthesis)
        return parsed.map(item => {
          const updatedItem = {
            requestedTimeframeDays: 2, // fallback
            ...item
          };
          if (item && item.ticker && MOCK_SYNTHESES[item.ticker]) {
            return {
              ...updatedItem,
              ...MOCK_SYNTHESES[item.ticker],
              // Preserve original timestamp if present
              timestamp: item.timestamp || new Date().toISOString()
            };
          }
          return updatedItem;
        });
      } catch (e) {
        console.error('Failed to parse saved watchlist:', e);
      }
    }
    // Default initial mock briefs in watchlist for PM visual showcase
    const initialList = [MOCK_SYNTHESES.AAPL, MOCK_SYNTHESES.NVDA];
    return initialList.map(item => ({
      ...item,
      requestedTimeframeDays: 2,
      timestamp: new Date().toISOString()
    }));
  });

  const [activeTicker, setActiveTicker] = useState('AAPL');
  const [activeSynthesis, setActiveSynthesis] = useState(() => {
    return { ...MOCK_SYNTHESES.AAPL, requestedTimeframeDays: 2 };
  });
  const [activeArticles, setActiveArticles] = useState(MOCK_SYNTHESES.AAPL.newsItemSentiments);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  
  // Real-time progressive synthesis steps tracking
  const [analysisStep, setAnalysisStep] = useState({
    scrape: 'idle',           // 'idle' | 'running' | 'success' | 'failed'
    articlesCount: 0,
    timeFilter: 'idle',       // 'idle' | 'running' | 'success' | 'failed'
    payloadAssembly: 'idle',  // 'idle' | 'running' | 'success' | 'failed'
    synthesis: 'idle',        // 'idle' | 'running' | 'success' | 'failed'
    selfHealing: 'idle',      // 'idle' | 'running' | 'success' | 'failed'
    finalize: 'idle'          // 'idle' | 'running' | 'success' | 'failed'
  });

  const [fetchError, setFetchError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);

  // Active loading stopwatch timer
  useEffect(() => {
    let intervalId;
    if (isLoading) {
      setElapsedTime(0);
      intervalId = setInterval(() => {
        setElapsedTime(prev => prev + 0.1);
      }, 100);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [isLoading]);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem('aegis_connection_settings', JSON.stringify(settings));
    if (settings.apiKey) {
      localStorage.setItem('gemini_api_key', settings.apiKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }, [settings]);

  // Sync timeframeDays to localStorage
  useEffect(() => {
    localStorage.setItem('aegis_requested_timeframe_days', timeframeDays.toString());
  }, [timeframeDays]);

  // Sync watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('aegis_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Save new settings
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    setFetchError(null);
  };

  // Select a ticker from the watchlist history
  const handleSelectWatchlistTicker = (ticker) => {
    const found = watchlist.find(item => item.ticker === ticker);
    if (found) {
      setActiveTicker(ticker);
      setActiveSynthesis(found);
      setActiveArticles(found.articles || MOCK_SYNTHESES[ticker]?.newsItemSentiments || []);
      setFetchError(null);
      if (found.requestedTimeframeDays) {
        setTimeframeDays(found.requestedTimeframeDays);
      }
    }
  };

  // Remove a ticker from the watchlist with active cascading fallback
  const handleRemoveWatchlistTicker = (tickerToRemove) => {
    const updatedWatchlist = watchlist.filter(item => item.ticker !== tickerToRemove);
    setWatchlist(updatedWatchlist);

    if (tickerToRemove === activeTicker) {
      if (updatedWatchlist.length > 0) {
        const nextActive = updatedWatchlist[0];
        setActiveTicker(nextActive.ticker);
        setActiveSynthesis(nextActive);
        setActiveArticles(nextActive.articles || MOCK_SYNTHESES[nextActive.ticker]?.newsItemSentiments || []);
      } else {
        setActiveTicker('');
        setActiveSynthesis(null);
        setActiveArticles([]);
      }
    }
  };

  // Clear all watchlist briefs and reset active viewports
  const handleClearWatchlist = () => {
    setWatchlist([]);
    setActiveTicker('');
    setActiveSynthesis(null);
    setActiveArticles([]);
  };

  // Helper to determine if live AI connection is active
  const isLiveEnabled = settings.provider === 'ollama' || (settings.provider === 'gemini' && settings.apiKey);

  // Perform aggregation & synthesis execution
  const handleTickerAnalyze = async (tickerSymbol, customTimeframe = timeframeDays) => {
    const cleanTicker = tickerSymbol.trim().toUpperCase();
    
    // STATE FIX: Set active ticker immediately so loading headers, spinners, and targets
    // align with the new search context instantly. Clear stale cache data to prevent old flashes.
    setActiveTicker(cleanTicker);
    setActiveArticles([]);
    setActiveSynthesis(null);
    
    setIsLoading(true);
    setFetchError(null);
    setPerformanceMetrics(null);
    
    // Reset process step checklist
    setAnalysisStep({
      scrape: 'running',
      articlesCount: 0,
      timeFilter: 'idle',
      payloadAssembly: 'idle',
      synthesis: 'idle',
      selfHealing: 'idle',
      finalize: 'idle'
    });

    // 1. Check if mock data is available for instant showcase (AAPL, NVDA, TSLA, MSFT)
    if (MOCK_SYNTHESES[cleanTicker] && !isLiveEnabled) {
      // Simulate short progress intervals for realism
      setTimeout(() => {
        setAnalysisStep(prev => ({ ...prev, scrape: 'success', articlesCount: 3, timeFilter: 'running' }));
      }, 200);

      setTimeout(() => {
        setAnalysisStep(prev => ({ ...prev, timeFilter: 'success', payloadAssembly: 'running' }));
      }, 400);

      setTimeout(() => {
        setAnalysisStep(prev => ({ ...prev, payloadAssembly: 'success', synthesis: 'running' }));
      }, 600);

      setTimeout(() => {
        setAnalysisStep(prev => ({ ...prev, synthesis: 'success', selfHealing: 'running' }));
        setPerformanceMetrics(MOCK_SYNTHESES[cleanTicker].performance || null);
      }, 850);

      setTimeout(() => {
        setAnalysisStep(prev => ({ ...prev, selfHealing: 'success', finalize: 'running' }));
      }, 1050);

      setTimeout(() => {
        const mockBrief = {
          ...MOCK_SYNTHESES[cleanTicker],
          requestedTimeframeDays: customTimeframe,
          timestamp: new Date().toISOString()
        };

        // Add to watchlist if not present, otherwise update it
        setWatchlist(prev => {
          const filtered = prev.filter(item => item.ticker !== cleanTicker);
          return [mockBrief, ...filtered];
        });

        setActiveSynthesis(mockBrief);
        setActiveArticles(mockBrief.newsItemSentiments);
        setAnalysisStep({
          scrape: 'success',
          articlesCount: 3,
          timeFilter: 'success',
          payloadAssembly: 'success',
          synthesis: 'success',
          selfHealing: 'success',
          finalize: 'success'
        });
        setIsLoading(false);
      }, 1300);
      return;
    }

    // 2. Fetch live headlines from backend and run synthesis
    try {
      // Step A: Fetch recent headlines
      const newsRes = await fetch(`${BACKEND_BASE}/api/news/${cleanTicker}?days=${customTimeframe}`);
      
      if (!newsRes.ok) {
        setAnalysisStep(prev => ({ ...prev, scrape: 'failed' }));
        throw new Error(`Failed to retrieve feed headlines. (HTTP ${newsRes.status})`);
      }

      const newsData = await newsRes.json();
      
      if (!newsData.articles || newsData.articles.length === 0) {
        setAnalysisStep(prev => ({ ...prev, scrape: 'failed' }));
        throw new Error(`No recent articles or headlines could be found for ticker '${cleanTicker}' within the last ${customTimeframe} ${customTimeframe === 1 ? 'day' : 'days'}. Try another symbol.`);
      }

      // UX INFLECTION: Update state immediately so the PM can see the scraped headlines below
      // while the local/cloud LLM is still running in the background!
      setActiveArticles(newsData.articles);
      setAnalysisStep({
        scrape: 'success',
        articlesCount: newsData.articles.length,
        timeFilter: 'success',
        payloadAssembly: 'running',
        synthesis: 'idle',
        selfHealing: 'idle',
        finalize: 'idle'
      });

      // Step B: Attempt LLM Synthesis
      if (isLiveEnabled) {
        setAnalysisStep(prev => ({
          ...prev,
          payloadAssembly: 'success',
          synthesis: 'running'
        }));

        const synthRes = await fetch(`${BACKEND_BASE}/api/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticker: cleanTicker,
            articles: newsData.articles,
            provider: settings.provider,
            apiKey: settings.apiKey,
            ollamaEndpoint: settings.ollamaEndpoint,
            ollamaModel: settings.ollamaModel,
            requestedTimeframeDays: customTimeframe
          })
        });

        if (!synthRes.ok) {
          const errorJson = await synthRes.json();
          setAnalysisStep(prev => ({ ...prev, synthesis: 'failed' }));
          
          if (synthRes.status === 401 || errorJson.code === 'API_KEY_MISSING') {
            throw new Error('API_KEY_REQUIRED');
          }
          throw new Error(errorJson.message || 'LLM synthesis failed.');
        }

        setAnalysisStep(prev => ({
          ...prev,
          synthesis: 'success',
          selfHealing: 'running'
        }));

        const synthesisOutput = await synthRes.json();
        setPerformanceMetrics(synthesisOutput.performance || null);
        
        setAnalysisStep(prev => ({
          ...prev,
          selfHealing: 'success',
          finalize: 'running'
        }));

        // Attach raw articles to the synthesis object for history saving
        const completeBrief = {
          ...synthesisOutput,
          articles: newsData.articles,
          requestedTimeframeDays: customTimeframe,
          timestamp: new Date().toISOString()
        };

        // Update Watchlist history
        setWatchlist(prev => {
          const filtered = prev.filter(item => item.ticker !== cleanTicker);
          return [completeBrief, ...filtered];
        });

        setActiveSynthesis(completeBrief);
        setAnalysisStep(prev => ({
          ...prev,
          finalize: 'success'
        }));
        setFetchError(null);
      } else {
        // No live connection set up, and ticker is not one of our mock ones.
        // Create a custom temporary "Needs config" briefing
        const partialBrief = {
          ticker: cleanTicker,
          sentiment: 50,
          sentimentLabel: 'Config Required',
          executiveSummary: `We have successfully scraped ${newsData.articles.length} live headlines for ${cleanTicker}. However, to synthesize a professional portfolio brief, tactical actions, and catalyst quadrants, you must configure a model connection (Gemini Key or Local Ollama).`,
          portfolioActions: [],
          catalysts: { financials: [], macro: [], productTech: [], regulation: [] },
          risks: [],
          requestedTimeframeDays: customTimeframe
        };
        
        setActiveSynthesis(partialBrief);
        setAnalysisStep(prev => ({ ...prev, synthesis: 'failed' }));
        throw new Error('CONFIG_REQUIRED');
      }

    } catch (err) {
      console.error('Analysis error:', err);
      // Mark active/running step as failed in catch block
      setAnalysisStep(prev => {
        const nextSteps = { ...prev };
        if (nextSteps.scrape === 'running' || nextSteps.scrape === 'idle') nextSteps.scrape = 'failed';
        else if (nextSteps.timeFilter === 'running') nextSteps.timeFilter = 'failed';
        else if (nextSteps.payloadAssembly === 'running') nextSteps.payloadAssembly = 'failed';
        else if (nextSteps.synthesis === 'running') nextSteps.synthesis = 'failed';
        else if (nextSteps.selfHealing === 'running') nextSteps.selfHealing = 'failed';
        else if (nextSteps.finalize === 'running') nextSteps.finalize = 'failed';
        return nextSteps;
      });

      if (err.message === 'API_KEY_REQUIRED' || err.message === 'CONFIG_REQUIRED') {
        setFetchError({
          title: 'LLM Connection Required',
          message: `Live news stories for ${cleanTicker} were successfully aggregated, but synthesis requires an active LLM integration. Configure Google Gemini (Cloud) or local Ollama (Gemma) in the settings panel to enable live AI synthesis, or look at hot tickers (AAPL, NVDA) for instant pre-compiled briefings.`,
          isAuth: true
        });
      } else {
        setFetchError({
          title: 'Synthesis Refused',
          message: err.message || 'An unexpected networking failure occurred. Check if local Ollama or your backend server is active.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Label to show in top navbar
  const getConnectionLabel = () => {
    if (settings.provider === 'ollama') {
      return `Ollama: ${settings.ollamaModel} (Local)`;
    }
    if (settings.provider === 'gemini' && settings.apiKey) {
      return 'Gemini Cloud (Active)';
    }
    return 'Demo Mode (Mocks)';
  };

  const getStatusColor = () => {
    if (settings.provider === 'ollama') return '#10b981'; // Emerald Green
    if (settings.provider === 'gemini' && settings.apiKey) return 'var(--color-bullish)'; // Mint Green
    return 'var(--color-neutral)'; // Orange/Gold
  };

  return (
    <div className="app-container">
      
      {/* Sidebar watchlist history */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="app-logo">🛡️</span>
          <div className="app-title-group">
            <h1>AEGIS EQUITY</h1>
            <span>PM NEWS SYNTHESIZER</span>
          </div>
        </div>

        <Watchlist
          watchlist={watchlist}
          activeTicker={activeTicker}
          onSelectTicker={handleSelectWatchlistTicker}
          onRemoveTicker={handleRemoveWatchlistTicker}
          onClearWatchlist={handleClearWatchlist}
        />

        <div className="sidebar-footer">
          <button 
            className="btn-accent" 
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setIsApiModalOpen(true)}
          >
            ⚙️ Connection Settings
          </button>
        </div>
      </aside>

      {/* Main Workspace Dashboard */}
      <main className="workspace">
        
        {/* Top Navbar lookup */}
        <header className="top-nav">
          <TickerInput
            onSubmit={handleTickerAnalyze}
            isLoading={isLoading}
            timeframeDays={timeframeDays}
            setTimeframeDays={setTimeframeDays}
          />
          <div className="system-actions">
            <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: getStatusColor() }}>
              <span className="pulse-glow" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor() }} />
              {getConnectionLabel()}
            </span>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <div className="dashboard-content custom-scrollbar">
          
          {fetchError ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Show error notification */}
              <div className="glass-panel" style={{ borderLeft: '4px solid var(--color-bearish)', marginBottom: 0 }}>
                <h3 style={{ color: 'var(--color-bearish)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⚠️ {fetchError.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14.5px', lineHeight: '1.6', marginBottom: '16px' }}>
                  {fetchError.message}
                </p>
                {fetchError.isAuth && (
                  <button className="btn-accent" onClick={() => setIsApiModalOpen(true)}>
                    Configure LLM Connection
                  </button>
                )}
              </div>

              {/* Still render the raw feed if it loaded articles but synthesis failed */}
              {activeArticles && activeArticles.length > 0 && (
                <NewsFeed
                  articles={activeArticles}
                  sentimentEvaluations={activeSynthesis?.newsItemSentiments || []}
                />
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Render dynamic synthesis loader panel OR the full briefing panel */}
              {isLoading ? (
                <div className="glass-panel" style={{ padding: '32px', marginBottom: 0 }}>
                  
                  {/* Glowing upper section with stopwatch */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div className="spinner" style={{ margin: 0, width: '28px', height: '28px', borderWidth: '3px' }} />
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '0.5px' }}>
                          Synthesizing Daily Intelligence for <span style={{ color: 'var(--color-accent)' }}>{activeTicker}</span>
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '2px' }}>
                          {settings.provider === 'ollama' 
                            ? `Local model [${settings.ollamaModel}] synthesis can take 10-25 seconds depending on hardware.`
                            : 'Gemini Cloud synthesis executes typically in 2-5 seconds.'}
                        </p>
                      </div>
                    </div>
                    {/* Real-time stopwatch */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '110px' }}>
                      <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Elapsed Time</span>
                      <span style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-accent)', textShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}>
                        {elapsedTime.toFixed(1)}s
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  {(() => {
                    const completed = [
                      analysisStep.scrape === 'success',
                      analysisStep.timeFilter === 'success',
                      analysisStep.payloadAssembly === 'success',
                      analysisStep.synthesis === 'success',
                      analysisStep.selfHealing === 'success',
                      analysisStep.finalize === 'success'
                    ].filter(Boolean).length;
                    const running = [
                      analysisStep.scrape === 'running',
                      analysisStep.timeFilter === 'running',
                      analysisStep.payloadAssembly === 'running',
                      analysisStep.synthesis === 'running',
                      analysisStep.selfHealing === 'running',
                      analysisStep.finalize === 'running'
                    ].filter(Boolean).length;
                    const progressPercent = Math.min(Math.round(((completed + (running * 0.5)) / 6) * 100), 99);
                    return (
                      <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px', marginBottom: '24px', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-accent) 0%, #10b981 100%)', boxShadow: '0 0 8px var(--color-accent)', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                      </div>
                    );
                  })()}

                  {/* Model Performance Metrics Resolved Banner */}
                  {performanceMetrics && (
                    <div className="loading-perf-banner">
                      <div className="loading-perf-banner-title">⚡ LLM INFERENCE TELEMETRY RESOLVED</div>
                      <div className="loading-perf-banner-grid">
                        <div className="loading-perf-item">
                          <span className="banner-label">INFERENCE SPEED</span>
                          <span className="banner-value speed-glowing">
                            {performanceMetrics.tokensPerSecond?.toFixed(1) || '0.0'}{' '}
                            <span style={{ fontSize: '11px', fontWeight: '400', color: 'var(--color-text-secondary)' }}>tok/s</span>
                          </span>
                        </div>
                        <div className="loading-perf-item">
                          <span className="banner-label">PROMPT TOKENS</span>
                          <span className="banner-value">
                            {performanceMetrics.promptTokens?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="loading-perf-item">
                          <span className="banner-label">GENERATED TOKENS</span>
                          <span className="banner-value">
                            {performanceMetrics.completionTokens?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="loading-perf-item">
                          <span className="banner-label">GENERATION LATENCY</span>
                          <span className="banner-value time-glowing">
                            {performanceMetrics.generationTimeSec?.toFixed(1) || '0.0'}s
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progressive step checklist board */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                    
                    {/* Step 1: Aggregation */}
                    {(() => {
                      const status = analysisStep.scrape;
                      let icon = '⚪';
                      let statusText = 'Waiting to connect to public RSS channels...';
                      let titleColor = 'var(--color-text-muted)';
                      let rowBg = 'transparent';
                      let borderStyle = 'none';

                      if (status === 'running') {
                        icon = '⚡';
                        statusText = 'Retrieving consensus news headlines from Yahoo Finance...';
                        titleColor = '#fff';
                        rowBg = 'rgba(59, 130, 246, 0.02)';
                        borderStyle = '1px solid rgba(59, 130, 246, 0.15)';
                      } else if (status === 'success') {
                        icon = '🟢';
                        statusText = `Aggregated ${analysisStep.articlesCount} public news stories successfully.`;
                        titleColor = '#e2e8f0';
                      } else if (status === 'failed') {
                        icon = '🔴';
                        statusText = 'Failed to aggregate public news headlines.';
                        titleColor = 'var(--color-bearish)';
                        rowBg = 'rgba(239, 68, 68, 0.02)';
                        borderStyle = '1px solid rgba(239, 68, 68, 0.1)';
                      }

                      return (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '12px 16px', borderRadius: '10px', backgroundColor: rowBg, border: borderStyle, transition: 'all 0.3s ease' }}>
                          <div style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}>
                            {status === 'running' ? <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite alternate' }}>⚡</span> : icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: titleColor }}>Scrape News Headlines</div>
                            <span style={{ display: 'block', fontSize: '12px', color: status === 'running' ? 'var(--color-text-secondary)' : status === 'success' ? 'var(--color-accent)' : 'var(--color-text-muted)', marginTop: '2px' }}>
                              {statusText}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Step 2: Temporal Filter */}
                    {(() => {
                      const status = analysisStep.timeFilter;
                      let icon = '⚪';
                      let statusText = 'Waiting for feed aggregation...';
                      let titleColor = 'var(--color-text-muted)';
                      let rowBg = 'transparent';
                      let borderStyle = 'none';

                      if (status === 'running') {
                        icon = '⚡';
                        statusText = `Analyzing timestamps. Filtering news articles strictly to the last ${timeframeDays} ${timeframeDays === 1 ? 'day' : 'days'}...`;
                        titleColor = '#fff';
                        rowBg = 'rgba(59, 130, 246, 0.02)';
                        borderStyle = '1px solid rgba(59, 130, 246, 0.15)';
                      } else if (status === 'success') {
                        icon = '🟢';
                        statusText = `Strict ${timeframeDays}-day scope enforced. Retained ${analysisStep.articlesCount} fresh stories.`;
                        titleColor = '#e2e8f0';
                      } else if (status === 'failed') {
                        icon = '🔴';
                        statusText = 'Could not resolve article publication timelines.';
                        titleColor = 'var(--color-bearish)';
                        rowBg = 'rgba(239, 68, 68, 0.02)';
                        borderStyle = '1px solid rgba(239, 68, 68, 0.1)';
                      }

                      return (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '12px 16px', borderRadius: '10px', backgroundColor: rowBg, border: borderStyle, transition: 'all 0.3s ease' }}>
                          <div style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}>
                            {status === 'running' ? <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite alternate' }}>⚡</span> : icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: titleColor }}>Enforce {timeframeDays}-Day Filter</div>
                            <span style={{ display: 'block', fontSize: '12px', color: status === 'running' ? 'var(--color-text-secondary)' : status === 'success' ? 'var(--color-accent)' : 'var(--color-text-muted)', marginTop: '2px' }}>
                              {statusText}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Step 3: Payload Packager */}
                    {(() => {
                      const status = analysisStep.payloadAssembly;
                      let icon = '⚪';
                      let statusText = 'Waiting for fresh news articles...';
                      let titleColor = 'var(--color-text-muted)';
                      let rowBg = 'transparent';
                      let borderStyle = 'none';

                      if (status === 'running') {
                        icon = '⚡';
                        statusText = 'Assembling guidelines & formatting target schema mapping...';
                        titleColor = '#fff';
                        rowBg = 'rgba(59, 130, 246, 0.02)';
                        borderStyle = '1px solid rgba(59, 130, 246, 0.15)';
                      } else if (status === 'success') {
                        icon = '🟢';
                        statusText = 'Prompt guidelines configured. Context footprint optimized.';
                        titleColor = '#e2e8f0';
                      } else if (status === 'failed') {
                        icon = '🔴';
                        statusText = 'Payload configuration failed.';
                        titleColor = 'var(--color-bearish)';
                        rowBg = 'rgba(239, 68, 68, 0.02)';
                        borderStyle = '1px solid rgba(239, 68, 68, 0.1)';
                      }

                      return (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '12px 16px', borderRadius: '10px', backgroundColor: rowBg, border: borderStyle, transition: 'all 0.3s ease' }}>
                          <div style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}>
                            {status === 'running' ? <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite alternate' }}>⚡</span> : icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: titleColor }}>Payload Structuring</div>
                            <span style={{ display: 'block', fontSize: '12px', color: status === 'running' ? 'var(--color-text-secondary)' : status === 'success' ? 'var(--color-accent)' : 'var(--color-text-muted)', marginTop: '2px' }}>
                              {statusText}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Step 4: LLM Synthesis */}
                    {(() => {
                      const status = analysisStep.synthesis;
                      let icon = '⚪';
                      let statusText = 'Waiting for model prompt prep...';
                      let titleColor = 'var(--color-text-muted)';
                      let rowBg = 'transparent';
                      let borderStyle = 'none';

                      if (status === 'running') {
                        icon = '⚡';
                        statusText = settings.provider === 'ollama'
                          ? `Pulsing payload to local Gemma model [${settings.ollamaModel}] (running local inference)...`
                          : 'Pulsing payload to Gemini Cloud API (generating consensus briefing)...';
                        titleColor = '#fff';
                        rowBg = 'rgba(59, 130, 246, 0.02)';
                        borderStyle = '1px solid rgba(59, 130, 246, 0.15)';
                      } else if (status === 'success') {
                        icon = '🟢';
                        statusText = 'Consensus briefing returned from model successfully.';
                        titleColor = '#e2e8f0';
                      } else if (status === 'failed') {
                        icon = '🔴';
                        statusText = 'Model refused to synthesize or connection failed.';
                        titleColor = 'var(--color-bearish)';
                        rowBg = 'rgba(239, 68, 68, 0.02)';
                        borderStyle = '1px solid rgba(239, 68, 68, 0.1)';
                      }

                      return (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '12px 16px', borderRadius: '10px', backgroundColor: rowBg, border: borderStyle, transition: 'all 0.3s ease' }}>
                          <div style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}>
                            {status === 'running' ? <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite alternate' }}>⚡</span> : icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: titleColor }}>Execute AI Synthesis</div>
                            <span style={{ display: 'block', fontSize: '12px', color: status === 'running' ? 'var(--color-text-secondary)' : status === 'success' ? 'var(--color-accent)' : 'var(--color-text-muted)', marginTop: '2px' }}>
                              {statusText}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Step 5: Self-Healing */}
                    {(() => {
                      const status = analysisStep.selfHealing;
                      let icon = '⚪';
                      let statusText = 'Waiting for model response...';
                      let titleColor = 'var(--color-text-muted)';
                      let rowBg = 'transparent';
                      let borderStyle = 'none';

                      if (status === 'running') {
                        icon = '⚡';
                        statusText = 'Running self-healing checks on string syntax & trailing commas...';
                        titleColor = '#fff';
                        rowBg = 'rgba(59, 130, 246, 0.02)';
                        borderStyle = '1px solid rgba(59, 130, 246, 0.15)';
                      } else if (status === 'success') {
                        icon = '🟢';
                        statusText = 'Schema integrity confirmed. Fixed structural issues via jsonrepair.';
                        titleColor = '#e2e8f0';
                      } else if (status === 'failed') {
                        icon = '🔴';
                        statusText = 'Briefing payload parsing failed strict validation.';
                        titleColor = 'var(--color-bearish)';
                        rowBg = 'rgba(239, 68, 68, 0.02)';
                        borderStyle = '1px solid rgba(239, 68, 68, 0.1)';
                      }

                      return (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '12px 16px', borderRadius: '10px', backgroundColor: rowBg, border: borderStyle, transition: 'all 0.3s ease' }}>
                          <div style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}>
                            {status === 'running' ? <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite alternate' }}>⚡</span> : icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: titleColor }}>Self-Healing Schema Check</div>
                            <span style={{ display: 'block', fontSize: '12px', color: status === 'running' ? 'var(--color-text-secondary)' : status === 'success' ? 'var(--color-accent)' : 'var(--color-text-muted)', marginTop: '2px' }}>
                              {statusText}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Step 6: Finalize */}
                    {(() => {
                      const status = analysisStep.finalize;
                      let icon = '⚪';
                      let statusText = 'Waiting for clean briefing data...';
                      let titleColor = 'var(--color-text-muted)';
                      let rowBg = 'transparent';
                      let borderStyle = 'none';

                      if (status === 'running') {
                        icon = '⚡';
                        statusText = 'Assembling portfolio dials, lists, and risk quadrant parameters...';
                        titleColor = '#fff';
                        rowBg = 'rgba(59, 130, 246, 0.02)';
                        borderStyle = '1px solid rgba(59, 130, 246, 0.15)';
                      } else if (status === 'success') {
                        icon = '🟢';
                        statusText = 'Aegis consensus brief compiled & structured!';
                        titleColor = '#e2e8f0';
                      } else if (status === 'failed') {
                        icon = '🔴';
                        statusText = 'Failed to generate visual briefing panel.';
                        titleColor = 'var(--color-bearish)';
                        rowBg = 'rgba(239, 68, 68, 0.02)';
                        borderStyle = '1px solid rgba(239, 68, 68, 0.1)';
                      }

                      return (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '12px 16px', borderRadius: '10px', backgroundColor: rowBg, border: borderStyle, transition: 'all 0.3s ease' }}>
                          <div style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}>
                            {status === 'running' ? <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite alternate' }}>⚡</span> : icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: titleColor }}>Generate Aegis Briefing</div>
                            <span style={{ display: 'block', fontSize: '12px', color: status === 'running' ? 'var(--color-text-secondary)' : status === 'success' ? 'var(--color-accent)' : 'var(--color-text-muted)', marginTop: '2px' }}>
                              {statusText}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                </div>
              ) : (
                <BriefingPanel synthesis={activeSynthesis} />
              )}

              {/* Related news feed is displayed immediately so the PM can read headlines during syntheses! */}
              {activeArticles && activeArticles.length > 0 && (
                <NewsFeed
                  articles={activeArticles}
                  sentimentEvaluations={activeSynthesis?.newsItemSentiments || []}
                />
              )}
              
            </div>
          )}
        </div>
      </main>

      {/* Connection Settings Modal Config Popover */}
      <ApiKeyModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={settings}
      />

    </div>
  );
}
