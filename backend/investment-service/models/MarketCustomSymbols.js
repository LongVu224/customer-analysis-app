const mongoose = require('mongoose');

const MarketCustomSymbolsSchema = new mongoose.Schema({
  marketId: {
    type: String,
    required: true,
    enum: ['us', 'finland'],
    unique: true
  },
  symbols: [{
    type: String,
    uppercase: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MarketCustomSymbols', MarketCustomSymbolsSchema);
