import { FiTrendingUp, FiTrendingDown, FiRefreshCw } from "react-icons/fi";
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import './StockBoard.scss';

const StockBoard = ({ stocks, loading, onRefresh, onSelectStock, marketName }) => {
  // Generate mini sparkline data from price (simulated trend)
  const generateSparklineData = (stock) => {
    // Create a simple trend based on change direction
    const basePrice = stock.previousClose || stock.currentPrice;
    const currentPrice = stock.currentPrice;
    const points = 10;
    const data = [];
    
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      const price = basePrice + (currentPrice - basePrice) * progress;
      // Add some variation
      const variation = (Math.random() - 0.5) * Math.abs(currentPrice - basePrice) * 0.3;
      data.push({ value: price + variation });
    }
    data.push({ value: currentPrice }); // Ensure last point is current price
    return data;
  };

  if (loading) {
    return (
      <div className="stock-board stock-board--loading">
        <FiRefreshCw className="spin" />
        <p>Loading {marketName} stocks...</p>
      </div>
    );
  }

  if (!stocks || stocks.length === 0) {
    return (
      <div className="stock-board stock-board--empty">
        <p>No stock data available for {marketName}</p>
        <button onClick={onRefresh} className="refresh-button">
          <FiRefreshCw /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="stock-board">
      <div className="stock-board__header">
        <h3>{marketName}</h3>
        <button onClick={onRefresh} className="refresh-button" title="Refresh">
          <FiRefreshCw />
        </button>
      </div>
      
      <div className="stock-board__grid">
        {stocks.map((stock) => {
          const isPositive = stock.change >= 0;
          const sparklineData = generateSparklineData(stock);
          
          return (
            <div
              key={stock.symbol}
              className={`stock-board__card ${isPositive ? 'positive' : 'negative'}`}
              onClick={() => onSelectStock && onSelectStock(stock.symbol)}
            >
              <div className="card-header">
                <span className="symbol">{stock.symbol?.replace('.HEL', '')}</span>
                <span className={`change-badge ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
                  {isPositive ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                </span>
              </div>
              
              <div className="card-price">
                <span className="current">${stock.currentPrice?.toFixed(2)}</span>
                <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? '+' : ''}{stock.change?.toFixed(2)}
                </span>
              </div>
              
              <div className="card-chart">
                <ResponsiveContainer width="100%" height={40}>
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id={`gradient-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop 
                          offset="5%" 
                          stopColor={isPositive ? '#10b981' : '#ef4444'} 
                          stopOpacity={0.3}
                        />
                        <stop 
                          offset="95%" 
                          stopColor={isPositive ? '#10b981' : '#ef4444'} 
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={isPositive ? '#10b981' : '#ef4444'}
                      strokeWidth={1.5}
                      fill={`url(#gradient-${stock.symbol})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="card-stats">
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StockBoard;
