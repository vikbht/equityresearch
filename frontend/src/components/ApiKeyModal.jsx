import React, { useState, useEffect } from 'react';

/**
 * Upgraded Connection Settings Modal component.
 * Allows users to choose between Google Gemini (Cloud) and Local Ollama (e.g. Gemma/Llama).
 * Stores settings securely in localStorage.
 */
export default function ApiKeyModal({ isOpen, onClose, onSave, currentSettings = {} }) {
  const [provider, setProvider] = useState(currentSettings.provider || 'gemini');
  const [apiKey, setApiKey] = useState(currentSettings.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  
  const [ollamaEndpoint, setOllamaEndpoint] = useState(currentSettings.ollamaEndpoint || 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState(currentSettings.ollamaModel || 'gemma');

  // Sync state if initial settings load after mount
  useEffect(() => {
    if (currentSettings.provider) setProvider(currentSettings.provider);
    if (currentSettings.apiKey) setApiKey(currentSettings.apiKey);
    if (currentSettings.ollamaEndpoint) setOllamaEndpoint(currentSettings.ollamaEndpoint);
    if (currentSettings.ollamaModel) setOllamaModel(currentSettings.ollamaModel);
  }, [currentSettings]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      provider,
      apiKey: apiKey.trim(),
      ollamaEndpoint: ollamaEndpoint.trim(),
      ollamaModel: ollamaModel.trim()
    });
    onClose();
  };

  const handleClear = () => {
    setApiKey('');
    setOllamaEndpoint('http://localhost:11434');
    setOllamaModel('gemma');
    onSave({
      provider: 'gemini',
      apiKey: '',
      ollamaEndpoint: 'http://localhost:11434',
      ollamaModel: 'gemma'
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h3>⚙️ LLM Integration Credentials</h3>
          <p>
            Choose your intelligence engine. Connect to Gemini's cloud API or tap into a local model running on your system via Ollama.
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '20px', gap: '4px' }}>
          <button
            type="button"
            className={`tab-btn ${provider === 'gemini' ? 'active' : ''}`}
            onClick={() => setProvider('gemini')}
            style={{ flex: 1, padding: '10px 0', fontSize: '13px' }}
          >
            ☁️ Google Gemini
          </button>
          <button
            type="button"
            className={`tab-btn ${provider === 'ollama' ? 'active' : ''}`}
            onClick={() => setProvider('ollama')}
            style={{ flex: 1, padding: '10px 0', fontSize: '13px' }}
          >
            💻 Local Ollama (Gemma)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Gemini Fields */}
          {provider === 'gemini' && (
            <div className="form-group" style={{ animation: 'fadeIn 0.2s' }}>
              <label htmlFor="api-key">Google Gemini API Key</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  className="text-input"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{ paddingRight: '45px', color: '#fff' }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showKey ? '👁️' : '🔒'}
                </button>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '8px', display: 'block' }}>
                Create a Gemini API Key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Google AI Studio</a>.
              </span>
            </div>
          )}

          {/* Ollama Fields */}
          {provider === 'ollama' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.2s' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="ollama-endpoint">Ollama Host Connection</label>
                <input
                  id="ollama-endpoint"
                  type="text"
                  className="text-input"
                  placeholder="http://localhost:11434"
                  value={ollamaEndpoint}
                  onChange={(e) => setOllamaEndpoint(e.target.value)}
                  style={{ color: '#fff' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                  Default local endpoint is usually <code>http://localhost:11434</code>.
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="ollama-model">Ollama Model Identifier</label>
                <input
                  id="ollama-model"
                  type="text"
                  className="text-input"
                  placeholder="gemma"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  style={{ color: '#fff' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                  Ensure you ran <code>ollama pull gemma</code> (or <code>gemma:2b</code> / <code>gemma2</code>) in your local terminal first.
                </span>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClear}
              style={{ marginRight: 'auto' }}
            >
              Clear Config
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-accent">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
