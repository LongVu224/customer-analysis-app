import { useState, useEffect, useCallback } from "react";
import { FiTrendingUp, FiTrendingDown, FiSearch, FiPlus, FiX, FiRefreshCw, FiDollarSign, FiActivity, FiBarChart2, FiGrid, FiList, FiTable, FiStar, FiInfo } from "react-icons/fi";
import { HiOutlineChartBar, HiOutlineSparkles, HiOutlineLightBulb, HiOutlineGlobeAlt } from "react-icons/hi2";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import StockTable from '../../components/StockTable';
import './Stocks.scss';

const API_BASE = process.env.REACT_APP_STOCK_SERVICE_URL || 'http://localhost:3004';

const Stocks = () => {
  // View mode: 'board' or 'details'
  const [viewMode, setViewMode] = useState('board');
  
  // Market tab: 'us', 'finland', 'watchlist'
  const [activeMarket, setActiveMarket] = useState('us');
  
  // Board view state
  const [usStocks, setUsStocks] = useState([]);
  const [finlandStocks, setFinlandStocks] = useState([]);
  const [watchlistStocks, setWatchlistStocks] = useState([]);
  const [usLoading, setUsLoading] = useState(false);
  const [finlandLoading, setFinlandLoading] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [usLastUpdated, setUsLastUpdated] = useState(null);
  const [finlandLastUpdated, setFinlandLastUpdated] = useState(null);
  const [watchlistLastUpdated, setWatchlistLastUpdated] = useState(null);
  
  // Details view state
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockAnalysis, setStockAnalysis] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch US market stocks
  const fetchUsStocks = useCallback(async () => {
    try {
      setUsLoading(true);
      const response = await fetch(`${API_BASE}/api/stocks/market/us`);
      const data = await response.json();
      if (data.success) {
        setUsStocks(data.data);
        setUsLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch US stocks:', err);
    } finally {
      setUsLoading(false);
    }
  }, []);

  // Fetch Finland market stocks
  const fetchFinlandStocks = useCallback(async () => {
    try {
      setFinlandLoading(true);
      const response = await fetch(`${API_BASE}/api/stocks/market/finland`);
      const data = await response.json();
      if (data.success) {
        setFinlandStocks(data.data);
        setFinlandLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch Finland stocks:', err);;
    } finally {
      setFinlandLoading(false);
    }
  }, []);

  // Fetch watchlist stocks with full data
  const fetchWatchlistStocks = useCallback(async () => {
    try {
      setWatchlistLoading(true);
      // First get the watchlist symbols
      const watchlistResponse = await fetch(`${API_BASE}/api/stocks/watchlist`);
      const watchlistData = await watchlistResponse.json();
      
      if (watchlistData.success && watchlistData.data.symbols?.length > 0) {
        setWatchlist(watchlistData.data.symbols);
        
        // Fetch quotes for each watchlist stock
        const stockPromises = watchlistData.data.symbols.map(async (symbol) => {
          try {
            const quoteResponse = await fetch(`${API_BASE}/api/stocks/quote/${symbol}`);
            const quoteData = await quoteResponse.json();
            return quoteData.success ? quoteData.data : null;
          } catch {
            return null;
          }
        });
        
        const stocks = await Promise.all(stockPromises);
        setWatchlistStocks(stocks.filter(s => s !== null));
        setWatchlistLastUpdated(new Date());
      } else {
        setWatchlist([]);
        setWatchlistStocks([]);
      }
    } catch (err) {
      console.error('Failed to fetch watchlist stocks:', err);
    } finally {
      setWatchlistLoading(false);
    }
  }, []);

  // Fetch trending stocks
  const fetchTrending = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/stocks/trending`);
      const data = await response.json();
      if (data.success) {
        setTrendingStocks(data.data);
      }
    } catch (err) {
      setError('Failed to fetch trending stocks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch watchlist
  const fetchWatchlist = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/stocks/watchlist`);
      const data = await response.json();
      if (data.success) {
        setWatchlist(data.data.symbols || []);
      }
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
    }
  }, []);

  // Fetch stock analysis
  const fetchAnalysis = async (symbol) => {
    try {
      setAnalysisLoading(true);
      setSelectedStock(symbol);
      const response = await fetch(`${API_BASE}/api/stocks/analysis/${symbol}`);
      const data = await response.json();
      if (data.success) {
        setStockAnalysis(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch analysis');
      console.error(err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Search stocks
  const handleSearch = async (query) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/stocks/search/${query}`);
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  // Add to watchlist
  const addToWatchlist = async (symbol) => {
    try {
      const response = await fetch(`${API_BASE}/api/stocks/watchlist/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      const data = await response.json();
      if (data.success) {
        setWatchlist(data.data.symbols);
        // Refresh watchlist stocks if on watchlist tab
        if (activeMarket === 'watchlist') {
          fetchWatchlistStocks();
        }
      }
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    }
  };

  // Remove from watchlist
  const removeFromWatchlist = async (symbol) => {
    try {
      const response = await fetch(`${API_BASE}/api/stocks/watchlist/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      const data = await response.json();
      if (data.success) {
        setWatchlist(data.data.symbols);
        // Refresh watchlist stocks if on watchlist tab
        if (activeMarket === 'watchlist') {
          fetchWatchlistStocks();
        }
      }
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  useEffect(() => {
    fetchTrending();
    fetchWatchlist();
  }, [fetchTrending, fetchWatchlist]);

  // Fetch market data when view mode or active market changes
  useEffect(() => {
    if (viewMode === 'board') {
      if (activeMarket === 'us' && usStocks.length === 0) {
        fetchUsStocks();
      } else if (activeMarket === 'finland' && finlandStocks.length === 0) {
        fetchFinlandStocks();
      } else if (activeMarket === 'watchlist') {
        fetchWatchlistStocks();
      }
    }
  }, [viewMode, activeMarket, fetchUsStocks, fetchFinlandStocks, fetchWatchlistStocks, usStocks.length, finlandStocks.length]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get signal color and label
  const getSignalInfo = (signal) => {
    const signals = {
      strong_buy: { color: '#10b981', label: 'Strong Buy', bg: 'rgba(16, 185, 129, 0.2)' },
      buy: { color: '#34d399', label: 'Buy', bg: 'rgba(52, 211, 153, 0.2)' },
      hold: { color: '#fbbf24', label: 'Hold', bg: 'rgba(251, 191, 36, 0.2)' },
      sell: { color: '#f97316', label: 'Sell', bg: 'rgba(249, 115, 22, 0.2)' },
      strong_sell: { color: '#ef4444', label: 'Strong Sell', bg: 'rgba(239, 68, 68, 0.2)' }
    };
    return signals[signal] || signals.hold;
  };

  return (
    <div className="stocks-root">
      {/* Background */}
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="wrap container">
        <h1 className="stocks-title"><span>Stock Trends</span></h1>

        {/* View Mode Tabs */}
        <div className="view-mode-tabs">
          <button
            className={`view-tab ${viewMode === 'board' ? 'active' : ''}`}
            onClick={() => setViewMode('board')}
          >
            <FiTable /> Market Tables
          </button>
          <button
            className={`view-tab ${viewMode === 'details' ? 'active' : ''}`}
            onClick={() => setViewMode('details')}
          >
            <FiList /> Stock Details
          </button>
        </div>

        {/* Board View - Shows US and Finland Market Tables */}
        {viewMode === 'board' && (
          <div className="market-boards">
            {/* Market Tabs */}
            <div className="market-tabs">
              <button
                className={`market-tab ${activeMarket === 'us' ? 'active' : ''}`}
                onClick={() => setActiveMarket('us')}
              >
                <HiOutlineGlobeAlt /> US Market
              </button>
              <button
                className={`market-tab ${activeMarket === 'finland' ? 'active' : ''}`}
                onClick={() => setActiveMarket('finland')}
              >
                <HiOutlineGlobeAlt /> Helsinki (Finland)
              </button>
              <button
                className={`market-tab ${activeMarket === 'watchlist' ? 'active' : ''}`}
                onClick={() => setActiveMarket('watchlist')}
              >
                <FiStar /> My Watchlist
                {watchlist.length > 0 && <span className="tab-badge">{watchlist.length}</span>}
              </button>
            </div>

            {/* US Market Table */}
            {activeMarket === 'us' && (
              <div className="market-board-section">
                <StockTable
                  stocks={usStocks}
                  loading={usLoading}
                  onRefresh={fetchUsStocks}
                  onSelectStock={(symbol) => {
                    setViewMode('details');
                    fetchAnalysis(symbol);
                  }}
                  marketName="US"
                  watchlist={watchlist}
                  onAddToWatchlist={addToWatchlist}
                  onRemoveFromWatchlist={removeFromWatchlist}
                  lastUpdated={usLastUpdated}
                />
              </div>
            )}

            {/* Finland Market Table */}
            {activeMarket === 'finland' && (
              <div className="market-board-section">
                <StockTable
                  stocks={finlandStocks}
                  loading={finlandLoading}
                  onRefresh={fetchFinlandStocks}
                  onSelectStock={(symbol) => {
                    setViewMode('details');
                    fetchAnalysis(symbol);
                  }}
                  marketName="Finland"
                  watchlist={watchlist}
                  onAddToWatchlist={addToWatchlist}
                  onRemoveFromWatchlist={removeFromWatchlist}
                  lastUpdated={finlandLastUpdated}
                />
              </div>
            )}

            {/* Watchlist Table */}
            {activeMarket === 'watchlist' && (
              <div className="market-board-section">
                <StockTable
                  stocks={watchlistStocks}
                  loading={watchlistLoading}
                  onRefresh={fetchWatchlistStocks}
                  onSelectStock={(symbol) => {
                    setViewMode('details');
                    fetchAnalysis(symbol);
                  }}
                  marketName="Watchlist"
                  watchlist={watchlist}
                  onAddToWatchlist={addToWatchlist}
                  onRemoveFromWatchlist={removeFromWatchlist}
                  isWatchlistView={true}
                  lastUpdated={watchlistLastUpdated}
                />
              </div>
            )}
          </div>
        )}

        {/* Details View - Search, Trending, Watchlist, Analysis */}
        {viewMode === 'details' && (
          <>
            {/* Search Bar */}
            <div className="stocks-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search stocks (e.g., AAPL, MSFT, GOOGL)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((result) => (
                    <div
                      key={result.symbol}
                      className="search-result-item"
                      onClick={() => {
                        fetchAnalysis(result.symbol);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <span className="symbol">{result.symbol}</span>
                      <span className="name">{result.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="stocks-layout">
              {/* Left Panel - Trending & Watchlist */}
              <div className="stocks-sidebar">
                {/* Trending Stocks */}
                <div className="stocks-section">
                  <h3 className="section-title">
                    <FiTrendingUp /> Trending Stocks
                    <button className="refresh-btn" onClick={fetchTrending} title="Refresh">
                      <FiRefreshCw />
                    </button>
                  </h3>
                  {loading ? (
                    <div className="loading-state">Loading...</div>
                  ) : (
                    <div className="stock-list">
                      {trendingStocks.map((stock) => (
                        <div
                          key={stock.symbol}
                          className={`stock-item-wrapper ${!watchlist.includes(stock.symbol) ? 'has-action' : ''}`}
                        >
                        <div
                          className={`stock-item ${selectedStock === stock.symbol ? 'active' : ''}`}
                          onClick={() => fetchAnalysis(stock.symbol)}
                        >
                          <div className="stock-info">
                            <span className="symbol">{stock.symbol}</span>
                            <span className="price">${stock.currentPrice?.toFixed(2)}</span>
                          </div>
                          <div className={`stock-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                            {stock.change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                            {stock.changePercent?.toFixed(2)}%
                          </div>
                        </div>
                        {!watchlist.includes(stock.symbol) && (
                          <button
                            className="add-btn-outside"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToWatchlist(stock.symbol);
                            }}
                            title="Add to watchlist"
                          >
                            <FiPlus />
                          </button>
                        )}
                      </div>
                      ))}
                </div>
              )}
            </div>

            {/* Watchlist */}
            <div className="stocks-section">
              <h3 className="section-title">
                <HiOutlineSparkles /> My Watchlist
              </h3>
              <div className="watchlist">
                {watchlist.length === 0 ? (
                  <div className="empty-state">No stocks in watchlist</div>
                ) : (
                  watchlist.map((symbol) => (
                    <div
                      key={symbol}
                      className={`watchlist-item ${selectedStock === symbol ? 'active' : ''}`}
                      onClick={() => fetchAnalysis(symbol)}
                    >
                      <span className="symbol">{symbol}</span>
                      <button
                        className="remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist(symbol);
                        }}
                        title="Remove"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Stock Analysis */}
          <div className="stocks-main">
            {analysisLoading ? (
              <div className="analysis-loading">
                <FiRefreshCw className="spin" />
                <p>Analyzing {selectedStock}...</p>
              </div>
            ) : stockAnalysis ? (
              <div className="stock-analysis">
                {/* Header */}
                <div className="analysis-header">
                  <div className="stock-identity">
                    <div className="symbol-row">
                      <h2>{stockAnalysis.symbol}</h2>
                      <button
                        className={`watchlist-toggle-btn ${watchlist.includes(stockAnalysis.symbol) ? 'in-watchlist' : ''}`}
                        onClick={() => {
                          if (watchlist.includes(stockAnalysis.symbol)) {
                            removeFromWatchlist(stockAnalysis.symbol);
                          } else {
                            addToWatchlist(stockAnalysis.symbol);
                          }
                        }}
                      >
                        {watchlist.includes(stockAnalysis.symbol) ? (
                          <>
                            <FiX /> Remove from Watchlist
                          </>
                        ) : (
                          <>
                            <FiStar /> Add to Watchlist
                          </>
                        )}
                      </button>
                    </div>
                    <span className="company-name">{stockAnalysis.companyName || stockAnalysis.name}</span>
                  </div>
                  <div className="stock-price-info">
                    <span className="current-price">${stockAnalysis.currentPrice?.toFixed(2)}</span>
                    <span className={`price-change ${stockAnalysis.change >= 0 ? 'positive' : 'negative'}`}>
                      {stockAnalysis.change >= 0 ? '+' : ''}{stockAnalysis.change?.toFixed(2)}
                      ({stockAnalysis.changePercent?.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                {/* Investment Suggestion */}
                {stockAnalysis.suggestion && (
                  <div className="suggestion-card" style={{ borderColor: getSignalInfo(stockAnalysis.suggestion.signal).color }}>
                    <div className="suggestion-header">
                      <HiOutlineLightBulb className="suggestion-icon" />
                      <h3>Investment Suggestion</h3>
                    </div>
                    <div className="suggestion-content">
                      <div
                        className="signal-badge"
                        style={{
                          backgroundColor: getSignalInfo(stockAnalysis.suggestion.signal).bg,
                          color: getSignalInfo(stockAnalysis.suggestion.signal).color
                        }}
                      >
                        {getSignalInfo(stockAnalysis.suggestion.signal).label}
                      </div>
                      <div className="confidence">
                        <span className="label">Confidence</span>
                        <div className="confidence-bar">
                          <div
                            className="confidence-fill"
                            style={{
                              width: `${stockAnalysis.suggestion.confidence}%`,
                              backgroundColor: getSignalInfo(stockAnalysis.suggestion.signal).color
                            }}
                          ></div>
                        </div>
                        <span className="value">{stockAnalysis.suggestion.confidence}%</span>
                      </div>
                      <div className="reasons">
                        {stockAnalysis.suggestion.reasons?.map((reason, idx) => (
                          <div key={idx} className="reason-item">
                            <span className="bullet">•</span>
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Technical Indicators */}
                <div className="indicators-grid">
                  <div className="indicator-card">
                    <FiActivity className="indicator-icon" />
                    <div className="indicator-content">
                      <span className="label">
                        RSI (14)
                        <span className="info-tooltip">
                          <FiInfo className="info-icon" />
                          <span className="tooltip-text">Relative Strength Index (RSI) measures momentum on a scale of 0-100. Below 30 suggests oversold (potential buy), above 70 suggests overbought (potential sell).</span>
                        </span>
                      </span>
                      <span className="value">{stockAnalysis.rsi?.toFixed(2)}</span>
                      <span className={`status ${stockAnalysis.rsi < 30 ? 'oversold' : stockAnalysis.rsi > 70 ? 'overbought' : 'neutral'}`}>
                        {stockAnalysis.rsi < 30 ? 'Oversold' : stockAnalysis.rsi > 70 ? 'Overbought' : 'Neutral'}
                      </span>
                    </div>
                  </div>
                  <div className="indicator-card">
                    <HiOutlineChartBar className="indicator-icon" />
                    <div className="indicator-content">
                      <span className="label">
                        SMA 20
                        <span className="info-tooltip">
                          <FiInfo className="info-icon" />
                          <span className="tooltip-text">Simple Moving Average (20-day) shows the average closing price over 20 days. Price above SMA20 indicates short-term bullish trend.</span>
                        </span>
                      </span>
                      <span className="value">${stockAnalysis.sma20?.toFixed(2)}</span>
                      <span className={`status ${stockAnalysis.currentPrice > stockAnalysis.sma20 ? 'bullish' : 'bearish'}`}>
                        {stockAnalysis.currentPrice > stockAnalysis.sma20 ? 'Above' : 'Below'}
                      </span>
                    </div>
                  </div>
                  <div className="indicator-card">
                    <FiBarChart2 className="indicator-icon" />
                    <div className="indicator-content">
                      <span className="label">
                        SMA 50
                        <span className="info-tooltip">
                          <FiInfo className="info-icon" />
                          <span className="tooltip-text">Simple Moving Average (50-day) shows the average closing price over 50 days. Price above SMA50 indicates medium-term bullish trend.</span>
                        </span>
                      </span>
                      <span className="value">${stockAnalysis.sma50?.toFixed(2)}</span>
                      <span className={`status ${stockAnalysis.currentPrice > stockAnalysis.sma50 ? 'bullish' : 'bearish'}`}>
                        {stockAnalysis.currentPrice > stockAnalysis.sma50 ? 'Above' : 'Below'}
                      </span>
                    </div>
                  </div>
                  <div className="indicator-card">
                    <FiDollarSign className="indicator-icon" />
                    <div className="indicator-content">
                      <span className="label">
                        Volume
                        <span className="info-tooltip">
                          <FiInfo className="info-icon" />
                          <span className="tooltip-text">Trading volume shows the total number of shares traded during the day. High volume often indicates strong interest and can confirm price trends.</span>
                        </span>
                      </span>
                      <span className="value">{(stockAnalysis.volume / 1000000)?.toFixed(2)}M</span>
                      <span className="status neutral">Daily</span>
                    </div>
                  </div>
                </div>

                {/* Price Chart */}
                {stockAnalysis.historicalPrices?.length > 0 && (
                  <div className="chart-section">
                    <h3 className="section-title">
                      <HiOutlineChartBar /> Price Trend (60 Days)
                    </h3>
                    <div className="price-chart">
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={stockAnalysis.historicalPrices}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis
                            dataKey="date"
                            stroke="rgba(255,255,255,0.5)"
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                            tickFormatter={(date) => date.slice(5)}
                          />
                          <YAxis
                            domain={['auto', 'auto']}
                            stroke="rgba(255,255,255,0.5)"
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(30, 41, 59, 0.95)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              color: 'white'
                            }}
                            formatter={(value) => [`$${value.toFixed(2)}`, 'Close']}
                          />
                          <Area
                            type="monotone"
                            dataKey="close"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Day Stats */}
                <div className="day-stats">
                  <div className="stat">
                    <span className="label">Open</span>
                    <span className="value">${stockAnalysis.open?.toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="label">High</span>
                    <span className="value">${stockAnalysis.high?.toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Low</span>
                    <span className="value">${stockAnalysis.low?.toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Prev Close</span>
                    <span className="value">${stockAnalysis.previousClose?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-analysis">
                <HiOutlineChartBar className="empty-icon" />
                <h3>Select a Stock</h3>
                <p>Click on any stock from the list or search to view detailed analysis and investment suggestions</p>
              </div>
            )}
          </div>
        </div>
          </>
        )}

        {/* Disclaimer */}
        <div className="disclaimer">
          <strong>Disclaimer:</strong> Investment suggestions are based on technical analysis and should not be considered as financial advice. 
          Always do your own research and consult with a financial advisor before making investment decisions.
        </div>
      </div>
    </div>
  );
};

export default Stocks;
