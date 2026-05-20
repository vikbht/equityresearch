import React, { useState } from 'react';
import SentimentDial from './SentimentDial';

/**
 * BriefingPanel containing synthesized AI intelligence for portfolio managers.
 * Renders tabbed breakdowns for PM actions, catalyst quadrants, and downside risks.
 */
export default function BriefingPanel({ synthesis }) {
  const [activeTab, setActiveTab] = useState('actions');

  if (!synthesis) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h3 style={{ fontSize: '20px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
          Select or Search a Stock Symbol to Begin
        </h3>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '440px', margin: '0 auto', fontSize: '14px' }}>
          Analyze standard hot equities (AAPL, NVDA, TSLA, MSFT) to test instantly, or add your credentials to pull live news briefs.
        </p>
      </div>
    );
  }

  const {
    ticker = 'UNKNOWN',
    name = '',
    sentiment = 50,
    sentimentLabel = 'Neutral',
    portfolioActions = [],
    catalysts = {},
    risks = [],
    executiveSummary = ''
  } = synthesis || {};

  // Ensure robust array and object structures regardless of LLM JSON variations (e.g. nulls)
  const cleanPortfolioActions = Array.isArray(portfolioActions) ? portfolioActions : [];
  const cleanCatalysts = (catalysts && typeof catalysts === 'object') ? catalysts : {};
  const cleanRisks = Array.isArray(risks) ? risks : [];

  const financials = Array.isArray(cleanCatalysts.financials) ? cleanCatalysts.financials : [];
  const macro = Array.isArray(cleanCatalysts.macro) ? cleanCatalysts.macro : [];
  const productTech = Array.isArray(cleanCatalysts.productTech) ? cleanCatalysts.productTech : [];
  const regulation = Array.isArray(cleanCatalysts.regulation) ? cleanCatalysts.regulation : [];

  const label = String(sentimentLabel || 'Neutral').toLowerCase();
  const sentimentClass = label.includes('bullish')
    ? 'bullish'
    : label.includes('bearish')
      ? 'bearish'
      : 'neutral';

  const copyToClipboard = () => {
    // Generate text structure
    const copyText = `[AEGIS EQUITY BRIEF] ${ticker} - ${name || ''}
Sentiment: ${sentimentLabel} (${sentiment}/100)

EXECUTIVE SUMMARY
${executiveSummary || ''}

TACTICAL PM ACTIONS
${cleanPortfolioActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

MARKET CATALYSTS
- Financials: ${financials.join(', ') || 'N/A'}
- Macro/Sector: ${macro.join(', ') || 'N/A'}
- Product/Tech: ${productTech.join(', ') || 'N/A'}
- Regulation/Legal: ${regulation.join(', ') || 'N/A'}

DOWNSIDE RISKS
${cleanRisks.map((r, i) => `- ${r}`).join('\n')}
    `;
    
    navigator.clipboard.writeText(copyText)
      .then(() => alert('Structured brief copied to clipboard.'))
      .catch((err) => console.error('Could not copy briefing:', err));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Glass Panel: Core Sentiment & Exec Summary */}
      <div className="glass-panel" style={{ marginBottom: 0 }}>
        <div className="briefing-summary-grid">
          
          <SentimentDial score={sentiment} />
          
          <div className="summary-box">
            <div className="briefing-header">
              <div className="briefing-title-group">
                <h2 style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  {ticker} 
                  <span style={{ fontSize: '18px', color: 'var(--color-text-secondary)', fontWeight: '400' }}>
                    {name || 'Equity Brief'}
                  </span>
                </h2>
                <div className="briefing-subtitle">
                  News Synthesis • {synthesis.requestedTimeframeDays || 2}-Day Timeframe • Updated {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div className={`briefing-sentiment-label ${sentimentClass}`}>
                {sentimentLabel}
              </div>
            </div>
            <p className="summary-text">{executiveSummary}</p>
            
            {/* Premium LLM Telemetry Performance Stats Bar */}
            {synthesis.performance && (
              <div className="performance-stats-bar">
                <span className="perf-metric" title={`Model provider: ${synthesis.performance.provider} (${synthesis.performance.model})`}>
                  <span className="perf-icon">⚡</span>
                  <span className="perf-label">SPEED:</span>{' '}
                  <span className="perf-value speed-glowing">{synthesis.performance.tokensPerSecond?.toFixed(1) || '0.0'} tok/s</span>
                </span>
                <span className="perf-divider">|</span>
                <span className="perf-metric">
                  <span className="perf-icon">📥</span>
                  <span className="perf-label">PROMPT:</span>{' '}
                  <span className="perf-value">{synthesis.performance.promptTokens?.toLocaleString() || '0'} tok</span>
                </span>
                <span className="perf-divider">|</span>
                <span className="perf-metric">
                  <span className="perf-icon">📤</span>
                  <span className="perf-label">GENERATED:</span>{' '}
                  <span className="perf-value">{synthesis.performance.completionTokens?.toLocaleString() || '0'} tok</span>
                </span>
                <span className="perf-divider">|</span>
                <span className="perf-metric">
                  <span className="perf-icon">⏱️</span>
                  <span className="perf-label">LATENCY:</span>{' '}
                  <span className="perf-value time-glowing">{synthesis.performance.generationTimeSec?.toFixed(1) || '0.0'}s</span>
                </span>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Synthesis Analytical Breakdown Tabs */}
      <div className="glass-panel" style={{ marginBottom: 0 }}>
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
            onClick={() => setActiveTab('actions')}
          >
            🛡️ Tactical PM Actions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'catalysts' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalysts')}
          >
            ⚡ Market Catalysts
          </button>
          <button 
            className={`tab-btn ${activeTab === 'risks' ? 'active' : ''}`}
            onClick={() => setActiveTab('risks')}
          >
            ⚠️ Downside Risks
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={copyToClipboard} style={{ padding: '6px 12px', fontSize: '12px' }}>
              📋 Copy Brief
            </button>
            <button className="btn-secondary" onClick={handlePrint} style={{ padding: '6px 12px', fontSize: '12px' }}>
              🖨️ Export PDF
            </button>
          </div>
        </div>

        {/* Tab 1: Tactical Portfolio Actions */}
        {activeTab === 'actions' && (
          <div className="tab-pane">
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', fontWeight: '500' }}>
              PROPOSED TACTICAL RECOMMENDATIONS AND EXPOSURE STRATEGIES:
            </p>
            {cleanPortfolioActions.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No tactical suggestions provided.</p>
            ) : (
              cleanPortfolioActions.map((action, i) => (
                <div key={i} className="brief-list-item action">
                  <div className="bullet-icon">🛡️</div>
                  <p>{action}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: 4-Quadrant Catalysts */}
        {activeTab === 'catalysts' && (
          <div className="tab-pane">
            <div className="catalysts-grid">
              
              <div className="catalyst-card financials">
                <h4>📊 Financials & Earnings</h4>
                <ul className="catalyst-list">
                  {financials.length > 0 ? (
                    financials.map((pt, i) => <li key={i}>{pt}</li>)
                  ) : (
                    <li>No direct earnings consensus updates flagged.</li>
                  )}
                </ul>
              </div>

              <div className="catalyst-card macro">
                <h4>🌍 Macro & Sector</h4>
                <ul className="catalyst-list">
                  {macro.length > 0 ? (
                    macro.map((pt, i) => <li key={i}>{pt}</li>)
                  ) : (
                    <li>No direct macro-driven impacts reported.</li>
                  )}
                </ul>
              </div>

              <div className="catalyst-card productTech">
                <h4>💻 Product & Tech Innovation</h4>
                <ul className="catalyst-list">
                  {productTech.length > 0 ? (
                    productTech.map((pt, i) => <li key={i}>{pt}</li>)
                  ) : (
                    <li>No product rollouts or R&D advancements reported.</li>
                  )}
                </ul>
              </div>

              <div className="catalyst-card regulation">
                <h4>⚖️ Regulation & Legal</h4>
                <ul className="catalyst-list">
                  {regulation.length > 0 ? (
                    regulation.map((pt, i) => <li key={i}>{pt}</li>)
                  ) : (
                    <li>No legal disputes or regulatory blocks registered.</li>
                  )}
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Downside Risks */}
        {activeTab === 'risks' && (
          <div className="tab-pane">
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', fontWeight: '500' }}>
              CRITICAL DOWNSIDE THREATS AND POTENTIAL HEADWINDS IDENTIFIED:
            </p>
            {cleanRisks.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No high-impact risks flagged in raw news stream.</p>
            ) : (
              cleanRisks.map((risk, i) => (
                <div key={i} className="brief-list-item risk">
                  <div className="bullet-icon">⚠️</div>
                  <p>{risk}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
