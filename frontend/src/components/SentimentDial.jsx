import React, { useEffect, useState } from 'react';

/**
 * Animated SVG Sentiment Dial component representing a 0-100 score.
 * Animates the ring drawing and the score number upward upon render.
 */
export default function SentimentDial({ score = 50 }) {
  const [displayScore, setDisplayScore] = useState(0);

  // Circumference of our SVG circle (2 * PI * R) where R is 70
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  // Animate the score counting up on load/update
  useEffect(() => {
    let start = 0;
    const safeScore = Number.isFinite(Number(score)) ? Number(score) : 50;
    const end = Math.min(Math.max(Math.round(safeScore), 0), 100);
    if (start === end) {
      setDisplayScore(end);
      return;
    }

    const duration = 800; // ms
    const incrementTime = Math.abs(Math.floor(duration / end));
    
    const timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, Math.max(incrementTime, 8));

    return () => clearInterval(timer);
  }, [score]);

  // Determine sentiment color token dynamically
  let color = 'var(--color-neutral)';
  if (score > 60) color = 'var(--color-bullish)';
  if (score < 40) color = 'var(--color-bearish)';

  // Calculate dash offset based on circumference
  const strokeDashoffset = circumference - (circumference * displayScore) / 100;

  return (
    <div className="dial-container">
      <svg className="dial-svg" viewBox="0 0 170 170">
        {/* Track Ring */}
        <circle
          className="dial-bg"
          cx="85"
          cy="85"
          r={radius}
        />
        {/* Animated Sentiment Fill Ring */}
        <circle
          className="dial-fill"
          cx="85"
          cy="85"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      {/* Centered Stats Callout */}
      <div className="dial-text">
        <span className="dial-score" style={{ color }}>
          {displayScore}
        </span>
        <span className="dial-label">Score</span>
      </div>
    </div>
  );
}
