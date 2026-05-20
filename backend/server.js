import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchNewsForTicker } from './utils/rssParser.js';
import { synthesizeNewsUnified } from './utils/synthesisEngine.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for frontend dev server
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * GET /api/news/:ticker
 * Fetches recent RSS news articles for the stock ticker.
 */
app.get('/api/news/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const daysLimit = parseInt(req.query.days || 2, 10);
  
  if (!ticker) {
    return res.status(400).json({ error: 'Ticker symbol is required' });
  }

  try {
    const articles = await fetchNewsForTicker(ticker, daysLimit);
    res.json({ ticker: ticker.toUpperCase(), articles, requestedTimeframeDays: daysLimit });
  } catch (error) {
    console.error(`Failed to retrieve news for ticker ${ticker}:`, error);
    res.status(500).json({ error: 'Failed to retrieve news stories.' });
  }
});

/**
 * POST /api/synthesize
 * Aggregates and synthesizes news for a ticker into a portfolio brief using Gemini or Ollama.
 */
app.post('/api/synthesize', async (req, res) => {
  const { 
    ticker, 
    articles, 
    provider, 
    apiKey, 
    ollamaEndpoint, 
    ollamaModel,
    requestedTimeframeDays = 2
  } = req.body;

  if (!ticker) {
    return res.status(400).json({ error: 'Ticker symbol is required' });
  }

  let articlesToSynthesize = articles;

  try {
    // If articles were not supplied in the request, fetch them dynamically
    if (!articlesToSynthesize || articlesToSynthesize.length === 0) {
      articlesToSynthesize = await fetchNewsForTicker(ticker, requestedTimeframeDays);
    }

    if (!articlesToSynthesize || articlesToSynthesize.length === 0) {
      return res.status(404).json({
        error: `No news articles could be found for ticker '${ticker.toUpperCase()}' within the last ${requestedTimeframeDays} days. Synthesis aborted.`
      });
    }

    const synthesis = await synthesizeNewsUnified({
      ticker,
      articles: articlesToSynthesize,
      provider: provider || 'gemini',
      apiKey,
      ollamaEndpoint,
      ollamaModel
    });

    synthesis.requestedTimeframeDays = requestedTimeframeDays;

    res.json(synthesis);
  } catch (error) {
    console.error(`Synthesis error for ticker ${ticker}:`, error);
    
    if (error.message === 'API_KEY_MISSING') {
      return res.status(401).json({
        error: 'Gemini API Key is missing.',
        code: 'API_KEY_MISSING',
        message: 'A Gemini API Key is required to run live synthesis. You can provide one in the Settings panel.'
      });
    }

    if (error.message === 'NO_ARTICLES') {
      return res.status(404).json({ error: 'No articles to synthesize.' });
    }

    res.status(500).json({
      error: 'Synthesis failed.',
      message: error.message || 'An internal error occurred during synthesis.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start backend server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  Aegis Equity Backend running on port ${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});
