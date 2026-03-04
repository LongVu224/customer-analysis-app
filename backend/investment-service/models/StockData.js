const mongoose = require('mongoose');

const StockDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  companyName: {
    type: String,
    default: ''
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  previousClose: {
    type: Number,
    default: 0
  },
  change: {
    type: Number,
    default: 0
  },
  changePercent: {
    type: Number,
    default: 0
  },
  high: {
    type: Number,
    default: 0
  },
  low: {
    type: Number,
    default: 0
  },
  open: {
    type: Number,
    default: 0
  },
  volume: {
    type: Number,
    default: 0
  },
  marketCap: {
    type: Number,
    default: 0
  },
  // Technical indicators
  sma20: {
    type: Number,
    default: 0
  },
  sma50: {
    type: Number,
    default: 0
  },
  rsi: {
    type: Number,
    default: 50
  },
  // Historical data for trends
  historicalPrices: [{
    date: String,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number
  }],
  // Investment suggestion
  suggestion: {
    signal: {
      type: String,
      enum: ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell'],
      default: 'hold'
    },
    confidence: {
      type: Number,
      default: 50
    },
    reasons: [String]
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
StockDataSchema.index({ symbol: 1, lastUpdated: -1 });

module.exports = mongoose.model('StockData', StockDataSchema);
