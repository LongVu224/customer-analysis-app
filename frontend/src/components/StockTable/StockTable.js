import { useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiRefreshCw, FiChevronUp, FiChevronDown, FiPlus, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import './StockTable.scss';

const StockTable = ({ stocks, loading, onRefresh, onSelectStock, marketName }) => {
  const [sortField, setSortField] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');
  const [hoveredStock, setHoveredStock] = useState(null);

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
        <p>No stock data available</p>
        <button className="refresh-btn" onClick={onRefresh}>
          <FiRefreshCw /> Retry
        </button>
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
                  <div 
                    className="view-btn-wrapper"
                    onMouseEnter={() => setHoveredStock(stock)}
                    onMouseLeave={() => setHoveredStock(null)}
                  >
                    <button 
                      className="view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(stock.symbol);
                      }}
                    >
                      View
                    </button>
                    {hoveredStock?.symbol === stock.symbol && (
                      <div className="stock-preview">
                        <div className="preview-header">
                          <span className="preview-symbol">{stock.symbol}</span>
                          <span className={`preview-change ${stock.changePercent >= 0 ? 'positive' : 'negative'}`}>
                            {stock.changePercent >= 0 ? <FiArrowUp /> : <FiArrowDown />}
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                          </span>
                        </div>
                        <div className="preview-name">{stock.name || stock.symbol}</div>
                        <div className="preview-price">${stock.currentPrice?.toFixed(2)}</div>
                        <div className="preview-stats">
                          <div className="stat">
                            <span className="label">Open</span>
                            <span className="value">${stock.open?.toFixed(2)}</span>
                          </div>
                          <div className="stat">
                            <span className="label">High</span>
                            <span className="value">${stock.high?.toFixed(2)}</span>
                          </div>
                          <div className="stat">
                            <span className="label">Low</span>
                            <span className="value">${stock.low?.toFixed(2)}</span>
                          </div>
                          <div className="stat">
                            <span className="label">Prev Close</span>
                            <span className="value">${stock.previousClose?.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="preview-footer">Click to view full analysis</div>
                      </div>
                    )}
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
