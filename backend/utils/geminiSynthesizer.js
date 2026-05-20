import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Synthesizes news stories using Google's Gemini LLM.
 * Supports a dynamic API key passed from the client, falling back to process.env.GEMINI_API_KEY.
 * Forces the Gemini model to respond in strict JSON matching a PM dashboard schema.
 * 
 * @param {string} ticker - Stock ticker
 * @param {Array} articles - Parsed articles list
 * @param {string} [customApiKey] - User's optional custom API key
 * @returns {Promise<Object>} Synthesized PM briefing in JSON format
 */
export async function synthesizeNews(ticker, articles, customApiKey) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  if (!articles || articles.length === 0) {
    throw new Error('NO_ARTICLES');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-1.5-flash as the fast, efficient, and cost-effective synthesis model
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    }
  });

  const prompt = `
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
8. Assess each individual article's sentiment ("Bullish", "Neutral", "Bearish") and give a brief 1-sentence impact summary. Return this in "newsItemSentiments" corresponding exactly to the order of the input articles.

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
      "impactSummary": "1-sentence impact explanation"
    }
  ]
}
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const response = result.response;
    const text = response.text();
    
    // Parse response
    const jsonOutput = JSON.parse(text);
    return jsonOutput;
  } catch (error) {
    console.error('Gemini synthesis failure:', error);
    throw new Error(`Synthesis failed: ${error.message}`);
  }
}
