const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'My Watchlist'
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

module.exports = mongoose.model('Watchlist', WatchlistSchema);
