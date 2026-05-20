import React, { useState } from 'react';

/**
 * Watchlist Sidebar Component.
 * Enables PMs to search and view recent syntheses, select active targets, 
 * and keep track of monitored tickers.
 */
export default function Watchlist({ 
  watchlist = [], 
  activeTicker, 
  onSelectTicker,
  onRemoveTicker,
  onClearWatchlist
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // CRASH-PROOF FILTER: Safely handle null/undefined items and check existence of ticker/name properties
  const filteredList = (watchlist || []).filter(item => {
    if (!item || !item.ticker) return false;
    
    const query = searchQuery.toLowerCase();
    const tickerMatch = String(item.ticker).toLowerCase().includes(query);
    const nameMatch = item.name && String(item.name).toLowerCase().includes(query);
    
    return tickerMatch || nameMatch;
  });

  return (
    <div className="sidebar-list-container" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search watchlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              padding: '8px 12px 8px 30px',
              fontSize: '13px',
              color: '#fff',
              outline: 'none'
            }}
          />
          <span style={{ position: 'absolute', left: '10px', color: 'var(--color-text-muted)', fontSize: '13px' }}>🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="watchlist-container custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 0 0', marginBottom: '12px' }}>
          <h3 className="section-label" style={{ margin: 0 }}>Briefing Watchlist ({filteredList.length})</h3>
          {watchlist.length > 0 && onClearWatchlist && (
            <button
              onClick={onClearWatchlist}
              className="watchlist-clear-btn"
              title="Clear all briefings"
            >
              Clear All
            </button>
          )}
        </div>
        
        {filteredList.length === 0 ? (
          <div style={{ padding: '24px 16px', color: 'var(--color-text-muted)', fontSize: '13px', textAlign: 'center' }}>
            {searchQuery ? 'No matching tickers found.' : 'Search a stock symbol above to begin synthesis.'}
          </div>
        ) : (
          <div className="watchlist-list">
            {filteredList.map((item) => {
              if (!item || !item.ticker) return null;
              
              const isActive = item.ticker === activeTicker;
              
              // CRASH-PROOF OPTIONAL CHAINING: Ensure sentimentClass handles null/undefined values safely
              const label = String(item.sentimentLabel || 'Neutral').toLowerCase();
              const sentimentClass = label.includes('bullish')
                ? 'bullish'
                : label.includes('bearish')
                  ? 'bearish'
                  : 'neutral';

              return (
                <div
                  key={item.ticker}
                  className={`watchlist-card ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTicker(item.ticker)}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                    <span className="watchlist-symbol">{item.ticker}</span>
                    <span 
                      style={{ 
                        display: 'block', 
                        fontSize: '11px', 
                        color: 'var(--color-text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%'
                      }}
                    >
                      {item.name || 'Equity Symbol'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="watchlist-meta">
                      <span className="watchlist-date">
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                      <span className={`watchlist-badge ${sentimentClass}`}>
                        {item.sentimentLabel || 'Neutral'}
                      </span>
                    </div>
                    {onRemoveTicker && (
                      <button
                        className="watchlist-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveTicker(item.ticker);
                        }}
                        title={`Remove ${item.ticker} briefing`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
