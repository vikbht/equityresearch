import React, { useState } from 'react';

/**
 * NewsFeed Accordion Component.
 * Displays analyzed source news stories, providing dynamic expansion parameters, 
 * article sentiment ratings, and publishing metadata.
 */
export default function NewsFeed({ articles = [], sentimentEvaluations = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (!articles || articles.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
        No source articles loaded. Check standard ticker lookups.
      </div>
    );
  }

  return (
    <div className="glass-panel">
      <div className="news-header">
        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>📰 Analyzed Sources Feed</h3>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px' }}>
          {articles.length} stories processed
        </span>
      </div>

      <div className="news-list">
        {articles.map((article, index) => {
          const isExpanded = expandedIndex === index;
          
          // Match article evaluation details if available from Gemini synthesis
          const evaluationsArray = Array.isArray(sentimentEvaluations) ? sentimentEvaluations : [];
          const evaluation = evaluationsArray.find(
            item => item && typeof item === 'object' && String(item.title || '').toLowerCase() === String(article.title || '').toLowerCase()
          ) || evaluationsArray[index] || {};

          const sentimentVal = evaluation.sentiment || 'Neutral';
          const sentimentStr = String(sentimentVal);
          const sentimentClass = sentimentStr.toLowerCase().includes('bullish') 
            ? 'bullish' 
            : sentimentStr.toLowerCase().includes('bearish') 
              ? 'bearish' 
              : 'neutral';

          const impactSummary = evaluation?.impactSummary || 'No specific impact details loaded.';

          // Format pubDate
          const formattedDate = () => {
            try {
              return new Date(article.pubDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            } catch (e) {
              return article.pubDate;
            }
          };

          return (
            <div 
              key={index} 
              className={`news-item ${isExpanded ? 'expanded' : ''}`}
            >
              <div 
                className="news-item-summary-bar"
                onClick={() => toggleAccordion(index)}
              >
                <div>
                  <span className={`news-item-sentiment-badge ${sentimentClass}`}>
                    {sentimentVal}
                  </span>
                </div>
                <div style={{ paddingRight: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <h4 className="news-item-title" style={{ margin: 0 }}>{article.title}</h4>
                    {evaluation.usedInSynthesis && (
                      <span className="used-in-synthesis-tag">
                        ✓ Key Catalyst Source
                      </span>
                    )}
                  </div>
                  <div className="news-item-meta">
                    <span>{formattedDate()}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--color-accent)' }}>
                      {article.link ? new URL(article.link).hostname.replace('www.', '') : 'Financial News'}
                    </span>
                  </div>
                </div>
                <div className="news-item-toggle">
                  {isExpanded ? '▼' : '▶'}
                </div>
              </div>

              {isExpanded && (
                <div className="news-item-details">
                  <div className="news-item-snippet" style={{ marginBottom: '14px' }}>
                    <h5 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px', letterSpacing: '0.05em' }}>Raw Summary Excerpt</h5>
                    <p>{article.summary}</p>
                  </div>
                  
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '6px', borderLeft: '3px solid var(--color-accent)', marginBottom: '14px' }}>
                    <h5 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '4px', letterSpacing: '0.05em' }}>PM Synthesis Impact</h5>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{impactSummary}</p>
                  </div>

                  {article.link && (
                    <a 
                      href={article.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="news-item-link"
                    >
                      Read full story on primary publisher ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
