const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const config = require('../config/config');
const StockData = require('../models/StockData');
const Watchlist = require('../models/Watchlist');

// Initialize cache with 15 minute TTL
const stockCache = new NodeCache({ stdTTL: config.cacheTTL });

// Yahoo Finance Chart API base URL
const YAHOO_CHART_API = 'https://query1.finance.yahoo.com/v8/finance/chart';
const YAHOO_SEARCH_API = 'https://query1.finance.yahoo.com/v1/finance/search';

// ============================================
// STOCK DATA FETCHING (Using Yahoo Finance Chart API)
// ============================================

/**
 * Fetch stock quote from Yahoo Finance Chart API
 */
async function fetchStockQuote(symbol) {
  try {
    const response = await fetch(`${YAHOO_CHART_API}/${encodeURIComponent(symbol)}?interval=1d&range=1d`);
    
    if (!response.ok) {
      console.error(`Yahoo API error for ${symbol}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      console.error(`No data for ${symbol}`);
      return null;
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    
    if (!meta || !meta.regularMarketPrice) {
      return null;
    }

    return {
      symbol: symbol,
      name: meta.shortName || meta.longName || symbol,
      open: quote?.open?.[0] || meta.regularMarketPrice,
      high: meta.regularMarketDayHigh || meta.regularMarketPrice,
      low: meta.regularMarketDayLow || meta.regularMarketPrice,
      currentPrice: meta.regularMarketPrice || 0,
      volume: meta.regularMarketVolume || 0,
      previousClose: meta.chartPreviousClose || meta.previousClose || 0,
      change: (meta.regularMarketPrice - (meta.chartPreviousClose || meta.regularMarketPrice)),
      changePercent: meta.chartPreviousClose ? ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100) : 0,
      marketCap: meta.marketCap || 0,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error.message);
    return null;
  }
}

/**
 * Fetch historical daily data for trend analysis
 */
async function fetchHistoricalData(symbol) {
  try {
    console.log(`Fetching historical data for ${symbol}`);

    const response = await fetch(`${YAHOO_CHART_API}/${encodeURIComponent(symbol)}?interval=1d&range=3mo`);
    
    if (!response.ok) {
      console.error(`Yahoo API error for ${symbol} historical: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      console.log(`No historical data for ${symbol}`);
      return [];
    }
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    
    if (timestamps.length === 0) {
      return [];
    }

    // Convert to consistent format
    const historical = timestamps.map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      open: quote.open?.[i] || 0,
      high: quote.high?.[i] || 0,
      low: quote.low?.[i] || 0,
      close: quote.close?.[i] || 0,
      volume: quote.volume?.[i] || 0
    })).filter(d => d.close > 0); // Filter out invalid entries

    return historical.slice(-60); // Last 60 days
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error.message);
    return [];
  }
}

// ============================================
// TECHNICAL INDICATORS & SUGGESTIONS
// ============================================

/**
 * Calculate Simple Moving Average
 */
function calculateSMA(prices, period) {
  if (prices.length < period) return 0;
  const slice = prices.slice(-period);
  return slice.reduce((sum, p) => sum + p, 0) / period;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Generate investment suggestion based on technical indicators
 */
function generateSuggestion(stockData) {
  const { currentPrice, sma20, sma50, rsi, changePercent, historicalPrices } = stockData;
  
  let score = 50; // Neutral starting point
  const reasons = [];

  // RSI Analysis (0-100)
  if (rsi < 30) {
    score += 20;
    reasons.push('RSI indicates oversold conditions - potential buying opportunity');
  } else if (rsi > 70) {
    score -= 20;
    reasons.push('RSI indicates overbought conditions - consider taking profits');
  } else if (rsi >= 40 && rsi <= 60) {
    reasons.push('RSI is neutral, indicating balanced momentum');
  }

  // Moving Average Analysis
  if (currentPrice > sma20 && sma20 > sma50) {
    score += 15;
    reasons.push('Price above both SMAs with bullish alignment - uptrend confirmed');
  } else if (currentPrice < sma20 && sma20 < sma50) {
    score -= 15;
    reasons.push('Price below both SMAs with bearish alignment - downtrend warning');
  } else if (currentPrice > sma20) {
    score += 5;
    reasons.push('Price above 20-day SMA - short-term bullish');
  } else if (currentPrice < sma20) {
    score -= 5;
    reasons.push('Price below 20-day SMA - short-term weakness');
  }

  // Recent momentum
  if (changePercent > 3) {
    score += 10;
    reasons.push(`Strong daily gain of ${changePercent.toFixed(2)}% - positive momentum`);
  } else if (changePercent < -3) {
    score -= 10;
    reasons.push(`Significant daily loss of ${changePercent.toFixed(2)}% - caution advised`);
  }

  // Trend analysis (last 5 days)
  if (historicalPrices && historicalPrices.length >= 5) {
    const last5 = historicalPrices.slice(-5);
    const trend = last5[4].close - last5[0].close;
    const trendPercent = (trend / last5[0].close) * 100;
    
    if (trendPercent > 5) {
      score += 10;
      reasons.push(`5-day uptrend of ${trendPercent.toFixed(2)}%`);
    } else if (trendPercent < -5) {
      score -= 10;
      reasons.push(`5-day downtrend of ${trendPercent.toFixed(2)}%`);
    }
  }

  // Determine signal based on score
  let signal;
  if (score >= 75) {
    signal = 'strong_buy';
  } else if (score >= 60) {
    signal = 'buy';
  } else if (score >= 40) {
    signal = 'hold';
  } else if (score >= 25) {
    signal = 'sell';
  } else {
    signal = 'strong_sell';
  }

  return {
    signal,
    confidence: Math.min(100, Math.max(0, score)),
    reasons
  };
}

// ============================================
// API ROUTES
// ============================================

/**
 * GET /api/stocks/quote/:symbol
 * Get real-time quote for a symbol
 */
router.get('/quote/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    
    // Check cache first
    const cached = stockCache.get(`quote_${symbol}`);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const quote = await fetchStockQuote(symbol);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Stock not found or API limit reached' });
    }

    // Cache the result
    stockCache.set(`quote_${symbol}`, quote);

    res.json({ success: true, data: quote });
  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/stocks/analysis/:symbol
 * Get full analysis with trends and suggestion
 */
router.get('/analysis/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    // Check cache
    const cached = stockCache.get(`analysis_${symbol}`);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    // Fetch quote and historical data
    const [quote, historical] = await Promise.all([
      fetchStockQuote(symbol),
      fetchHistoricalData(symbol)
    ]);

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Stock not found or API limit reached' });
    }

    // Calculate technical indicators
    const closePrices = historical.map(d => d.close);
    const sma20 = calculateSMA(closePrices, 20);
    const sma50 = calculateSMA(closePrices, 50);
    const rsi = calculateRSI(closePrices, 14);

    // Build stock data object
    const stockData = {
      ...quote,
      sma20,
      sma50,
      rsi,
      historicalPrices: historical,
      lastUpdated: new Date()
    };

    // Generate investment suggestion
    stockData.suggestion = generateSuggestion(stockData);

    // Save to database
    await StockData.findOneAndUpdate(
      { symbol },
      stockData,
      { upsert: true, new: true }
    );

    // Cache the result
    stockCache.set(`analysis_${symbol}`, stockData);

    res.json({ success: true, data: stockData });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/stocks/trending
 * Get trending stocks (default watchlist)
 */
router.get('/trending', async (req, res) => {
  try {
    const symbols = config.defaultSymbols;
    const results = [];

    for (const symbol of symbols) {
      // Check cache first
      let data = stockCache.get(`quote_${symbol}`);
      
      if (!data) {
        data = await fetchStockQuote(symbol);
        if (data) {
          stockCache.set(`quote_${symbol}`, data);
        }
      }

      if (data) {
        results.push(data);
      }

      // Small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/stocks/market/:marketId
 * Get stocks for a specific market (us, finland)
 */
router.get('/market/:marketId', async (req, res) => {
  try {
    const marketId = req.params.marketId.toLowerCase();
    const market = config.markets[marketId];
    
    if (!market) {
      return res.status(404).json({ 
        success: false, 
        message: 'Market not found. Available markets: us, finland' 
      });
    }

    const results = [];

    for (const symbol of market.symbols) {
      // Check cache first
      let data = stockCache.get(`quote_${symbol}`);
      
      if (!data) {
        data = await fetchStockQuote(symbol);
        if (data) {
          stockCache.set(`quote_${symbol}`, data);
        }
      }

      if (data) {
        results.push(data);
      }

      // Small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    res.json({ 
      success: true, 
      market: market.name,
      data: results 
    });
  } catch (error) {
    console.error('Market error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/stocks/markets
 * Get list of available markets
 */
router.get('/markets', async (req, res) => {
  try {
    const markets = Object.entries(config.markets).map(([id, market]) => ({
      id,
      name: market.name,
      symbolCount: market.symbols.length
    }));
    
    res.json({ success: true, data: markets });
  } catch (error) {
    console.error('Markets list error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/stocks/suggestions
 * Get top investment suggestions
 */
router.get('/suggestions', async (req, res) => {
  try {
    // Get latest analyzed stocks from database
    const stocks = await StockData.find({
      lastUpdated: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })
    .sort({ 'suggestion.confidence': -1 })
    .limit(10);

    // Separate by signal type
    const suggestions = {
      strongBuys: stocks.filter(s => s.suggestion.signal === 'strong_buy'),
      buys: stocks.filter(s => s.suggestion.signal === 'buy'),
      holds: stocks.filter(s => s.suggestion.signal === 'hold'),
      sells: stocks.filter(s => s.suggestion.signal === 'sell' || s.suggestion.signal === 'strong_sell')
    };

    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// WATCHLIST ROUTES
// ============================================

/**
 * GET /api/stocks/watchlist
 * Get user's watchlist
 */
router.get('/watchlist', async (req, res) => {
  try {
    let watchlist = await Watchlist.findOne();
    
    if (!watchlist) {
      // Create default watchlist
      watchlist = new Watchlist({
        name: 'My Watchlist',
        symbols: config.defaultSymbols.slice(0, 5)
      });
      await watchlist.save();
    }

    res.json({ success: true, data: watchlist });
  } catch (error) {
    console.error('Watchlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/stocks/watchlist/add
 * Add symbol to watchlist
 */
router.post('/watchlist/add', async (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) {
      return res.status(400).json({ success: false, message: 'Symbol required' });
    }

    let watchlist = await Watchlist.findOne();
    if (!watchlist) {
      watchlist = new Watchlist({ symbols: [] });
    }

    const upperSymbol = symbol.toUpperCase();
    if (!watchlist.symbols.includes(upperSymbol)) {
      watchlist.symbols.push(upperSymbol);
      await watchlist.save();
    }

    res.json({ success: true, data: watchlist });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/stocks/watchlist/remove
 * Remove symbol from watchlist
 */
router.post('/watchlist/remove', async (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) {
      return res.status(400).json({ success: false, message: 'Symbol required' });
    }

    const watchlist = await Watchlist.findOne();
    if (watchlist) {
      watchlist.symbols = watchlist.symbols.filter(s => s !== symbol.toUpperCase());
      await watchlist.save();
    }

    res.json({ success: true, data: watchlist });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/stocks/search/:query
 * Search for stocks (uses Yahoo Finance search)
 */
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    
    const response = await fetch(`${YAHOO_SEARCH_API}?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`);
    
    if (!response.ok) {
      return res.status(500).json({ success: false, message: 'Search failed' });
    }
    
    const data = await response.json();
    
    const results = (data.quotes || [])
      .filter(q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
      .slice(0, 10)
      .map(q => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        type: q.quoteType,
        exchange: q.exchDisp || q.exchange
      }));

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
