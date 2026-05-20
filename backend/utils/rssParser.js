import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['description', 'pubDate'],
  }
});

/**
 * Fetches the raw RSS headlines for a given equity symbol from Yahoo Finance RSS.
 * Sanitizes and parses them into a standard array format.
 * @param {string} ticker - The stock symbol (e.g., AAPL)
 * @returns {Promise<Array>} List of articles with title, link, pubDate, and summary
 */
export async function fetchNewsForTicker(ticker, daysLimit = 2) {
  if (!ticker || typeof ticker !== 'string') {
    throw new Error('Invalid ticker provided');
  }

  const cleanedTicker = ticker.trim().toUpperCase();
  const url = `https://finance.yahoo.com/rss/headline?s=${encodeURIComponent(cleanedTicker)}`;

  try {
    const feed = await parser.parseURL(url);
    
    if (!feed.items || feed.items.length === 0) {
      return [];
    }

    const timeLimitMs = (daysLimit || 2) * 24 * 60 * 60 * 1000;
    const filterTimeAgo = Date.now() - timeLimitMs;
    const recentItems = feed.items.filter(item => {
      const dateStr = item.pubDate || item.isoDate;
      if (!dateStr) return false;
      const timestamp = Date.parse(dateStr);
      return !isNaN(timestamp) && timestamp >= filterTimeAgo;
    });

    console.log(`[rssParser] ${cleanedTicker}: Retargeted ${feed.items.length} total articles to ${recentItems.length} stories in the last ${daysLimit} days.`);

    return recentItems.map(item => {
      // Clean description html/text if any
      let summary = item.description || item.contentSnippet || '';
      summary = summary.replace(/<[^>]*>/g, '').trim(); // strip html tags

      return {
        title: item.title || 'No Headline',
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        summary: summary || 'No summary available.'
      };
    });
  } catch (error) {
    console.error(`Error fetching RSS feed for ${cleanedTicker}:`, error);
    // Return empty array to let front-end or synthetic fallbacks handle it gracefully
    return [];
  }
}
