import { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiRefreshCw, FiChevronUp, FiChevronDown, FiStar, FiX, FiClock, FiSearch, FiPlus, FiTrash2 } from 'react-icons/fi';
import './StockTable.scss';

const API_BASE = process.env.REACT_APP_STOCK_SERVICE_URL || 'http://localhost:3004';

// Helper function to get suggestion based on stock performance
const getSuggestion = (stock) => {
  const changePercent = stock.changePercent || 0;
  
  if (changePercent >= 3) return { text: 'Strong Buy', type: 'strong-buy' };
  if (changePercent >= 1) return { text: 'Buy', type: 'buy' };
  if (changePercent >= -1) return { text: 'Hold', type: 'hold' };
  if (changePercent >= -3) return { text: 'Sell', type: 'sell' };
  return { text: 'Strong Sell', type: 'strong-sell' };
};

const StockTable = ({ 
  stocks, 
  loading, 
  onRefresh, 
  onSelectStock, 
  marketName, 
  marketId,
  watchlist = [], 
  onAddToWatchlist, 
  onRemoveFromWatchlist, 
  onAddToMarket,
  onRemoveFromMarket,
  isWatchlistView = false, 
  lastUpdated = null 
}) => {
  const [sortField, setSortField] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchFilter, setSearchFilter] = useState('');
  const [showAddStock, setShowAddStock] = useState(false);
  const [addStockQuery, setAddStockQuery] = useState('');
  const [addStockResults, setAddStockResults] = useState([]);
  const [addStockLoading, setAddStockLoading] = useState(false);

  // Search for stocks to add
  const searchStocksToAdd = async (query) => {
    if (!query || query.length < 1) {
      setAddStockResults([]);
      return;
    }
    try {
      setAddStockLoading(true);
      const response = await fetch(`${API_BASE}/api/stocks/search/${query}`);
      const data = await response.json();
      if (data.success) {
        // Filter out stocks already in the list
        const existingSymbols = stocks.map(s => s.symbol);
        setAddStockResults(data.data.filter(r => !existingSymbols.includes(r.symbol)));
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setAddStockLoading(false);
    }
  };

  // Handle adding stock to market or watchlist
  const handleAddStock = (symbol) => {
    if (isWatchlistView && onAddToWatchlist) {
      onAddToWatchlist(symbol);
    } else if (onAddToMarket) {
      onAddToMarket(symbol);
    }
    setShowAddStock(false);
    setAddStockQuery('');
    setAddStockResults([]);
  };

  // Debounced search for add stock
  useEffect(() => {
    const timer = setTimeout(() => {
      searchStocksToAdd(addStockQuery);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addStockQuery]);

  // Format last updated time
  const formatLastUpdated = (date) => {
    if (!date) return null;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Check if stock is in watchlist
  const isInWatchlist = (symbol) => watchlist.includes(symbol);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter stocks by search query
  const filteredStocks = stocks.filter((stock) => {
    if (!searchFilter) return true;
    const query = searchFilter.toLowerCase();
    return (
      stock.symbol?.toLowerCase().includes(query) ||
      stock.name?.toLowerCase().includes(query)
    );
  });

  // Sort stocks
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  // Get sort icon
  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  if (loading) {
    return (
      <div className="stock-table-loading">
        <div className="loading-spinner"></div>
        <span>Loading {marketName} stocks...</span>
      </div>
    );
  }

  if (!stocks || stocks.length === 0) {
    return (
      <div className="stock-table-empty">
        <p>{isWatchlistView ? 'Your watchlist is empty. Click "Add Stock" to search and add stocks.' : 'No stock data available'}</p>
        {isWatchlistView && onAddToWatchlist && (
          <button className="add-stock-btn" onClick={() => setShowAddStock(true)}>
            <FiPlus /> Add Stock
          </button>
        )}
        {!isWatchlistView && (
          <button className="refresh-btn" onClick={onRefresh}>
            <FiRefreshCw /> Retry
          </button>
        )}
        {/* Add Stock Modal for empty state */}
        {showAddStock && (
          <div className="add-stock-modal">
            <div className="add-stock-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search stocks to add to watchlist..."
                value={addStockQuery}
                onChange={(e) => setAddStockQuery(e.target.value)}
                autoFocus
              />
              <button className="close-modal" onClick={() => {
                setShowAddStock(false);
                setAddStockQuery('');
                setAddStockResults([]);
              }}>
                <FiX />
              </button>
            </div>
            {addStockLoading && (
              <div className="add-stock-loading">Searching...</div>
            )}
            {addStockResults.length > 0 && (
              <div className="add-stock-results">
                {addStockResults.map((result) => (
                  <div 
                    key={result.symbol} 
                    className="add-stock-item"
                    onClick={() => handleAddStock(result.symbol)}
                  >
                    <span className="symbol">{result.symbol}</span>
                    <span className="name">{result.name}</span>
                    <button className="add-btn">
                      <FiPlus /> Add
                    </button>
                  </div>
                ))}
              </div>
            )}
            {addStockQuery && !addStockLoading && addStockResults.length === 0 && (
              <div className="no-results">No stocks found</div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="stock-table-container">
      <div className="table-header">
        <div className="header-left">
          <span className="stock-count">
            {filteredStocks.length}{searchFilter && filteredStocks.length !== stocks.length ? ` of ${stocks.length}` : ''} stocks
          </span>
          <div className="table-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Filter stocks..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            {searchFilter && (
              <button className="clear-search" onClick={() => setSearchFilter('')}>
                <FiX />
              </button>
            )}
          </div>
          {(onAddToMarket || (isWatchlistView && onAddToWatchlist)) && (
            <button 
              className="add-stock-btn" 
              onClick={() => setShowAddStock(!showAddStock)}
              title={isWatchlistView ? 'Add stock to watchlist' : `Add stock to ${marketName} market`}
            >
              <FiPlus /> Add Stock
            </button>
          )}
        </div>
        <div className="header-right">
          {lastUpdated && (
            <span className="last-updated">
              <FiClock /> Updated {formatLastUpdated(lastUpdated)}
            </span>
          )}
          <button className="refresh-btn" onClick={onRefresh} title="Refresh data">
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAddStock && (
        <div className="add-stock-modal">
          <div className="add-stock-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder={isWatchlistView ? 'Search stocks to add to watchlist...' : `Search stocks to add to ${marketName}...`}
              value={addStockQuery}
              onChange={(e) => setAddStockQuery(e.target.value)}
              autoFocus
            />
            <button className="close-modal" onClick={() => {
              setShowAddStock(false);
              setAddStockQuery('');
              setAddStockResults([]);
            }}>
              <FiX />
            </button>
          </div>
          {addStockLoading && (
            <div className="add-stock-loading">Searching...</div>
          )}
          {addStockResults.length > 0 && (
            <div className="add-stock-results">
              {addStockResults.map((result) => (
                <div 
                  key={result.symbol} 
                  className="add-stock-item"
                  onClick={() => handleAddStock(result.symbol)}
                >
                  <span className="symbol">{result.symbol}</span>
                  <span className="name">{result.name}</span>
                  <button className="add-btn">
                    <FiPlus /> Add
                  </button>
                </div>
              ))}
            </div>
          )}
          {addStockQuery && !addStockLoading && addStockResults.length === 0 && (
            <div className="no-results">No stocks found or all matches already added</div>
          )}
        </div>
      )}
      
      <div className="table-wrapper">
        <table className="stock-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('symbol')} className="sortable">
                Symbol <SortIcon field="symbol" />
              </th>
              <th onClick={() => handleSort('name')} className="sortable name-col">
                Company <SortIcon field="name" />
              </th>
              <th onClick={() => handleSort('currentPrice')} className="sortable align-right">
                Price <SortIcon field="currentPrice" />
              </th>
              <th onClick={() => handleSort('change')} className="sortable align-right">
                Change <SortIcon field="change" />
              </th>
              <th onClick={() => handleSort('changePercent')} className="sortable align-right">
                Change % <SortIcon field="changePercent" />
              </th>
              <th onClick={() => handleSort('high')} className="sortable align-right">
                High <SortIcon field="high" />
              </th>
              <th onClick={() => handleSort('low')} className="sortable align-right">
                Low <SortIcon field="low" />
              </th>
              <th onClick={() => handleSort('open')} className="sortable align-right">
                Open <SortIcon field="open" />
              </th>
              <th className="suggestion-col">Suggestion</th>
              {onAddToWatchlist && <th className="watchlist-col">Watchlist</th>}
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedStocks.map((stock) => (
              <tr 
                key={stock.symbol} 
                onClick={() => onSelectStock(stock.symbol)}
                className="stock-row"
              >
                <td className="symbol-cell">
                  <span className="symbol">{stock.symbol}</span>
                </td>
                <td className="name-cell">
                  <span className="company-name">{stock.name || stock.symbol}</span>
                </td>
                <td className="align-right price-cell">
                  ${stock.currentPrice?.toFixed(2)}
                </td>
                <td className={`align-right change-cell ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                  <span className="change-value">
                    {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}
                  </span>
                </td>
                <td className={`align-right percent-cell ${stock.changePercent >= 0 ? 'positive' : 'negative'}`}>
                  <span className="percent-badge">
                    {stock.changePercent >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                  </span>
                </td>
                <td className="align-right">${stock.high?.toFixed(2)}</td>
                <td className="align-right">${stock.low?.toFixed(2)}</td>
                <td className="align-right">${stock.open?.toFixed(2)}</td>
                <td className="suggestion-cell">
                  {(() => {
                    const suggestion = getSuggestion(stock);
                    return (
                      <span className={`suggestion-badge suggestion--${suggestion.type}`}>
                        {suggestion.text}
                      </span>
                    );
                  })()}
                </td>
                {onAddToWatchlist && (
                  <td className="watchlist-cell">
                    <button
                      className={`watchlist-btn ${isInWatchlist(stock.symbol) ? 'in-watchlist' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isInWatchlist(stock.symbol)) {
                          onRemoveFromWatchlist(stock.symbol);
                        } else {
                          onAddToWatchlist(stock.symbol);
                        }
                      }}
                      title={isInWatchlist(stock.symbol) ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                      {isInWatchlist(stock.symbol) ? <FiX /> : <FiStar />}
                    </button>
                  </td>
                )}
                <td className="actions-cell">
                  <button 
                    className="view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStock(stock.symbol);
                    }}
                  >
                    View
                  </button>
                  {onRemoveFromMarket && !isWatchlistView && (
                    <button
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromMarket(stock.symbol);
                      }}
                      title={`Remove from ${marketName}`}
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockTable;
