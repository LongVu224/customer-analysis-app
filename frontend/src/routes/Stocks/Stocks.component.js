import { useState, useEffect, useCallback } from "react";
import { FiTrendingUp, FiTrendingDown, FiSearch, FiPlus, FiX, FiRefreshCw, FiDollarSign, FiActivity, FiBarChart2, FiGrid, FiList, FiTable } from "react-icons/fi";
import { HiOutlineChartBar, HiOutlineSparkles, HiOutlineLightBulb, HiOutlineGlobeAlt } from "react-icons/hi2";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import StockTable from '../../components/StockTable';
import './Stocks.scss';

const API_BASE = process.env.REACT_APP_STOCK_SERVICE_URL || 'http://localhost:3004';

const Stocks = () => {
  // View mode: 'board' or 'details'
  const [viewMode, setViewMode] = useState('board');
  
  // Board view state
  const [usStocks, setUsStocks] = useState([]);
  const [finlandStocks, setFinlandStocks] = useState([]);
  const [usLoading, setUsLoading] = useState(true);
  const [finlandLoading, setFinlandLoading] = useState(true);
  
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
      }
    } catch (err) {
      console.error('Failed to fetch Finland stocks:', err);
    } finally {
      setFinlandLoading(false);
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
      }
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  useEffect(() => {
    fetchTrending();
    fetchWatchlist();
  }, [fetchTrending, fetchWatchlist]);

  // Fetch board data when view mode changes
  useEffect(() => {
    if (viewMode === 'board') {
      fetchUsStocks();
      fetchFinlandStocks();
    }
  }, [viewMode, fetchUsStocks, fetchFinlandStocks]);

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
            <div className="market-board-section">
              <h2 className="market-title">
                <HiOutlineGlobeAlt /> US Market
              </h2>
              <StockTable
                stocks={usStocks}
                loading={usLoading}
                onRefresh={fetchUsStocks}
                onSelectStock={(symbol) => {
                  setViewMode('details');
                  fetchAnalysis(symbol);
                }}
                marketName="US"
              />
            </div>

            <div className="market-board-section">
              <h2 className="market-title">
                <HiOutlineGlobeAlt /> Helsinki (Finland) Market
              </h2>
              <StockTable
                stocks={finlandStocks}
                loading={finlandLoading}
                onRefresh={fetchFinlandStocks}
                onSelectStock={(symbol) => {
                  setViewMode('details');
                  fetchAnalysis(symbol);
                }}
                marketName="Finland"
              />
            </div>
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
                    <h2>{stockAnalysis.symbol}</h2>
                    <span className="company-name">{stockAnalysis.companyName}</span>
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
                      <span className="label">RSI (14)</span>
                      <span className="value">{stockAnalysis.rsi?.toFixed(2)}</span>
                      <span className={`status ${stockAnalysis.rsi < 30 ? 'oversold' : stockAnalysis.rsi > 70 ? 'overbought' : 'neutral'}`}>
                        {stockAnalysis.rsi < 30 ? 'Oversold' : stockAnalysis.rsi > 70 ? 'Overbought' : 'Neutral'}
                      </span>
                    </div>
                  </div>
                  <div className="indicator-card">
                    <HiOutlineChartBar className="indicator-icon" />
                    <div className="indicator-content">
                      <span className="label">SMA 20</span>
                      <span className="value">${stockAnalysis.sma20?.toFixed(2)}</span>
                      <span className={`status ${stockAnalysis.currentPrice > stockAnalysis.sma20 ? 'bullish' : 'bearish'}`}>
                        {stockAnalysis.currentPrice > stockAnalysis.sma20 ? 'Above' : 'Below'}
                      </span>
                    </div>
                  </div>
                  <div className="indicator-card">
                    <FiBarChart2 className="indicator-icon" />
                    <div className="indicator-content">
                      <span className="label">SMA 50</span>
                      <span className="value">${stockAnalysis.sma50?.toFixed(2)}</span>
                      <span className={`status ${stockAnalysis.currentPrice > stockAnalysis.sma50 ? 'bullish' : 'bearish'}`}>
                        {stockAnalysis.currentPrice > stockAnalysis.sma50 ? 'Above' : 'Below'}
                      </span>
                    </div>
                  </div>
                  <div className="indicator-card">
                    <FiDollarSign className="indicator-icon" />
                    <div className="indicator-content">
                      <span className="label">Volume</span>
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
