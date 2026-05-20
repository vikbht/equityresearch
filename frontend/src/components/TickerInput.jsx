import React, { useState } from 'react';

/**
 * TickerInput component for stock lookups.
 * Includes hot ticker shortcuts for rapid portfolio navigation.
 */
export default function TickerInput({ onSubmit, isLoading, timeframeDays = 2, setTimeframeDays = () => {} }) {
  const [ticker, setTicker] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTicker = ticker.trim().toUpperCase();

    if (!cleanTicker) {
      setError('Please enter a ticker symbol.');
      return;
    }

    if (!/^[A-Z.]{1,5}$/.test(cleanTicker)) {
      setError('Invalid ticker format. (1-5 alphabetical characters expected)');
      return;
    }

    setError('');
    onSubmit(cleanTicker, timeframeDays);
  };

  const handleHotSelect = (hotTicker) => {
    setError('');
    setTicker(hotTicker);
    onSubmit(hotTicker, timeframeDays);
  };

  const HOT_TICKERS = ['AAPL', 'NVDA', 'TSLA', 'MSFT'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '640px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
        <form onSubmit={handleSubmit} className="ticker-form" style={{ flex: 1 }}>
          <input
            type="text"
            className="ticker-input"
            placeholder="Enter Stock Ticker (e.g. AAPL, AMD)..."
            value={ticker}
            onChange={(e) => {
              setTicker(e.target.value);
              if (error) setError('');
            }}
            disabled={isLoading}
          />
          <button type="submit" className="lookup-btn" disabled={isLoading}>
            {isLoading ? 'Aggregating...' : 'Analyze'}
          </button>
        </form>

        <div className="quick-tags">
          <span className="tag-label">Hot Tickers:</span>
          {HOT_TICKERS.map((t) => (
            <button
              key={t}
              type="button"
              className="ticker-tag"
              onClick={() => handleHotSelect(t)}
              disabled={isLoading}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="timeframe-slider-container" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 12px', marginTop: '4px' }}>
        <label htmlFor="timeframe-range" className="timeframe-label" style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
          📅 News Timeframe:
        </label>
        <input
          id="timeframe-range"
          type="range"
          min="1"
          max="20"
          value={timeframeDays}
          onChange={(e) => setTimeframeDays(parseInt(e.target.value, 10))}
          disabled={isLoading}
          className="timeframe-slider"
          style={{ flex: 1, height: '6px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
        />
        <span className="timeframe-value-badge" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-accent)', padding: '2px 8px', borderRadius: '6px', background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.25)', minWidth: '60px', textAlign: 'center', textShadow: '0 0 8px rgba(0, 212, 255, 0.4)' }}>
          {timeframeDays} {timeframeDays === 1 ? 'Day' : 'Days'}
        </span>
      </div>

      {error && (
        <span style={{ color: 'var(--color-bearish)', fontSize: '12px', fontWeight: '500', paddingLeft: '12px' }}>
          ⚠️ {error}
        </span>
      )}
    </div>
  );
}

