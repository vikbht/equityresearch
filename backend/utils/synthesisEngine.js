import { GoogleGenerativeAI } from '@google/generative-ai';
import { jsonrepair } from 'jsonrepair';

/**
 * Safely parses JSON output from LLMs, using jsonrepair to fix trailing commas,
 * missing brackets, single quotes, unescaped control chars, or markdown wrappers.
 * 
 * @param {string} text - Raw text to parse
 * @returns {Object} Parsed JSON object
 */
export function safeJSONParse(text) {
  let cleanText = String(text || '').trim();
  
  // 1. Strip markdown code block wrappers if they exist
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  }
  
  try {
    return JSON.parse(cleanText);
  } catch (initialError) {
    console.warn(`[JSON Parse Warning] Initial parse failed: "${initialError.message}". Attempting recovery using jsonrepair...`);
    try {
      const repaired = jsonrepair(cleanText);
      return JSON.parse(repaired);
    } catch (repairError) {
      console.error('[JSON Parse Critical] jsonrepair recovery failed:', repairError.message);
      
      // 2. Custom manual regex fallback for trailing commas in arrays/objects
      try {
        const regexCleaned = cleanText
          .replace(/,\s*([\]}])/g, '$1') // Remove trailing commas
          .replace(/'/g, '"');          // Fix single quotes to double quotes
        return JSON.parse(regexCleaned);
      } catch (regexError) {
        // Return original error with snippet of the malformed content for diagnostics
        const snippet = cleanText.substring(0, 120) + (cleanText.length > 120 ? '...' : '');
        throw new Error(`JSON Syntax Error: "${initialError.message}". Content snippet: "${snippet}".`);
      }
    }
  }
}

/**
 * Unified Synthesis Engine that supports both Google Gemini (Cloud) and Local Ollama (e.g., Gemma).
 * 
 * @param {Object} params
 * @param {string} params.ticker - Equity ticker
 * @param {Array} params.articles - Scraping output articles
 * @param {string} params.provider - 'gemini' | 'ollama'
 * @param {string} [params.apiKey] - Gemini API Key (if cloud)
 * @param {string} [params.ollamaEndpoint] - Ollama API url (if local)
 * @param {string} [params.ollamaModel] - Model name, e.g., 'gemma' or 'gemma2'
 * @returns {Promise<Object>} Synthesized briefing matched to PM schema
 */
export async function synthesizeNewsUnified({
  ticker,
  articles,
  provider = 'gemini',
  apiKey,
  ollamaEndpoint = 'http://localhost:11434',
  ollamaModel = 'gemma'
}) {
  if (!ticker) throw new Error('Ticker is required');
  if (!articles || articles.length === 0) throw new Error('No articles to synthesize');

  const systemInstructions = `
You are a Senior Equity Research Analyst and Portfolio Strategy Advisor writing for a hedge fund Portfolio Manager (PM).
Your job is to synthesize the provided recent news stories for the equity symbol "${ticker.toUpperCase()}" into a highly professional, dense, and actionable portfolio intelligence brief.

Below are the recent headlines and summaries gathered for ${ticker.toUpperCase()}:
${JSON.stringify(articles, null, 2)}

Instructions:
1. Synthesize this raw data into an analytical, objective portfolio write-up.
2. Determine an overall market sentiment rating (0 to 100, where 50 is Neutral, >50 is Bullish, and <50 is Bearish).
3. Assign an appropriate sentiment label ("Strong Bullish", "Bullish", "Neutral", "Bearish", "Strong Bearish").
4. Write a concise, 3-4 sentence "Executive Summary" synthesizing the current consensus.
5. Detail 3-4 highly actionable "Portfolio Actions / Tactical Recommendations" specifically framed for a PM (e.g. buying protection, taking profits, watching key technical overheads, position sizing adjustments).
6. Categorize the drivers into "Market Catalysts" with exact sub-sections: Financials/Earnings, Macro/Sector, Product/Technology, and Regulation/Legal. Include 1-2 points per sub-section. If a sub-section is not mentioned in the news, put a logical structural inference based on broader market knowledge for this company, but mark it clearly.
7. Outline 2-3 prominent "Downside Risks" flagged or implied by the news flow.
8. Assess each individual article's sentiment ("Bullish", "Neutral", "Bearish"), give a brief 1-sentence impact summary, and specify a boolean flag "usedInSynthesis" (set to true if the article contains key catalyst details, downside risks, or PM recommendations synthesized in the main brief; set to false otherwise). Return this in "newsItemSentiments" corresponding exactly to the order of the input articles.

You must output a single, valid JSON object matching the following structure (do NOT include markdown formatting wrappers other than the JSON itself):
{
  "ticker": "${ticker.toUpperCase()}",
  "sentiment": 75,
  "sentimentLabel": "Bullish",
  "executiveSummary": "String",
  "portfolioActions": ["Action Point 1", "Action Point 2"],
  "catalysts": {
    "financials": ["Financial catalyst point 1"],
    "macro": ["Macro/Sector catalyst point 1"],
    "productTech": ["Product/Tech catalyst point 1"],
    "regulation": ["Regulation/Legal catalyst point 1"]
  },
  "risks": ["Risk point 1", "Risk point 2"],
  "newsItemSentiments": [
    {
      "title": "Exact Article Title 1",
      "sentiment": "Bullish",
      "impactSummary": "1-sentence impact explanation",
      "usedInSynthesis": true
    }
  ]
}
`;

  // ----------------------------------------------------
  // PROVIDER 1: Google Gemini (Cloud)
  // ----------------------------------------------------
  if (provider === 'gemini') {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('API_KEY_MISSING');
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const startTime = performance.now();
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemInstructions }] }]
      });
      const response = result.response;
      const text = response.text();
      const endTime = performance.now();

      const parsedJSON = safeJSONParse(text);

      // Extract usage metadata if available
      const usage = response.usageMetadata || {};
      const promptTokens = usage.promptTokenCount || 0;
      const completionTokens = usage.candidatesTokenCount || 0;
      const totalTokens = usage.totalTokenCount || 0;

      const generationTimeSec = Number(((endTime - startTime) / 1000).toFixed(2));
      const tokensPerSecond = generationTimeSec > 0 ? Number((completionTokens / generationTimeSec).toFixed(1)) : 0;

      parsedJSON.performance = {
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        promptTokens,
        completionTokens,
        totalTokens,
        generationTimeSec,
        tokensPerSecond
      };

      return parsedJSON;
    } catch (error) {
      console.error('Gemini synthesis failure:', error);
      throw new Error(`Gemini synthesis failed: ${error.message}`);
    }
  }

  // ----------------------------------------------------
  // PROVIDER 2: Local Ollama (e.g., Gemma)
  // ----------------------------------------------------
  if (provider === 'ollama') {
    const endpoint = (ollamaEndpoint || 'http://localhost:11434').trim().replace(/\/$/, '');
    const modelName = ollamaModel || 'gemma';
    
    console.log(`Connecting to local Ollama [${endpoint}] using model [${modelName}]...`);

    const startTime = performance.now();
    try {
      const response = await fetch(`${endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'user',
              content: systemInstructions
            }
          ],
          format: 'json',
          stream: false,
          options: {
            temperature: 0.2, // Keep temperature lower for strict structure
            num_predict: 2048, // Prevent truncation
            num_ctx: 8192      // Ensure large context window for multiple news articles
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama server returned status HTTP ${response.status}`);
      }

      const responseData = await response.json();
      const endTime = performance.now();
      
      if (!responseData.message || !responseData.message.content) {
        throw new Error('Ollama response returned empty content.');
      }

      const parsedJSON = safeJSONParse(responseData.message.content);

      const promptTokens = responseData.prompt_eval_count || 0;
      const completionTokens = responseData.eval_count || 0;
      const totalTokens = promptTokens + completionTokens;

      // Use Ollama's microsecond-level eval_duration (ns), if available, otherwise elapsed call time
      const generationTimeSec = responseData.eval_duration 
        ? Number((responseData.eval_duration / 1e9).toFixed(2))
        : Number(((endTime - startTime) / 1000).toFixed(2));

      const tokensPerSecond = generationTimeSec > 0 ? Number((completionTokens / generationTimeSec).toFixed(1)) : 0;

      parsedJSON.performance = {
        provider: 'ollama',
        model: modelName,
        promptTokens,
        completionTokens,
        totalTokens,
        generationTimeSec,
        tokensPerSecond
      };

      return parsedJSON;
    } catch (error) {
      console.error('Ollama synthesis failure:', error);
      throw new Error(`Ollama model synthesis failed. Check if Ollama is running and has the model loaded. details: ${error.message}`);
    }
  }

  throw new Error(`Unknown model provider: ${provider}`);
}
