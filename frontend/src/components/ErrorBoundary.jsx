import React from 'react';

/**
 * Premium ErrorBoundary Component.
 * Catches unhandled React rendering errors, preventing blank screens,
 * and provides a high-fidelity glassmorphism crash recovery panel
 * with an instant button to clear saved state / local cache and reload.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Aegis Equity Uncaught Render Error:', error, errorInfo);
  }

  handleResetAndClear = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear local storage:', e);
      window.location.reload();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0a0b0d',
          backgroundImage: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.05), transparent 600px), radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.05), transparent 600px)',
          fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
          color: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(20px)',
            webkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '560px',
            width: '100%',
            boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛡️</div>
            
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff 30%, var(--color-text-secondary, #94a3b8))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Aegis System Overload
            </h2>
            
            <p style={{ color: '#94a3b8', fontSize: '14.5px', lineHeight: '1.6', marginBottom: '28px' }}>
              An unexpected layout or state visualization error occurred during rendering. This is usually caused by outdated or malformed data loaded from cache.
            </p>

            {this.state.error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.03)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '28px',
                textAlign: 'left',
                overflowX: 'auto',
                maxHeight: '120px'
              }}>
                <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#ef4444', fontWeight: '700', marginBottom: '4px', letterSpacing: '0.05em' }}>
                  Diagnostics Trace
                </span>
                <code style={{ fontSize: '12px', color: '#fca5a5', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              >
                Force Reload
              </button>
              
              <button
                onClick={this.handleResetAndClear}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Clear Cache & Reset Aegis
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
