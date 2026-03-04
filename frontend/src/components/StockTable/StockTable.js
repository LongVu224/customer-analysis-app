import { useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiRefreshCw, FiChevronUp, FiChevronDown, FiStar, FiX } from 'react-icons/fi';
import './StockTable.scss';

const StockTable = ({ stocks, loading, onRefresh, onSelectStock, marketName, watchlist = [], onAddToWatchlist, onRemoveFromWatchlist, isWatchlistView = false }) => {
  const [sortField, setSortField] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');

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

  // Sort stocks
  const sortedStocks = [...stocks].sort((a, b) => {
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
        <p>{isWatchlistView ? 'Your watchlist is empty. Add stocks from US or Finland markets.' : 'No stock data available'}</p>
        {!isWatchlistView && (
          <button className="refresh-btn" onClick={onRefresh}>
            <FiRefreshCw /> Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="stock-table-container">
      <div className="table-header">
        <span className="stock-count">{stocks.length} stocks</span>
        <button className="refresh-btn" onClick={onRefresh} title="Refresh data">
          <FiRefreshCw />
        </button>
      </div>
      
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
                <td className="actions-cell">
                  <div className="actions-buttons">
                    {onAddToWatchlist && onRemoveFromWatchlist && (
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
                    )}
                    <button 
                      className="view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(stock.symbol);
                      }}
                    >
                      View
                    </button>
                  </div>
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
