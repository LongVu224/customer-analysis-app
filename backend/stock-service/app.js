const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const config = require('./config/config');
const stockRoutes = require('./routes/stock.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/stocks', stockRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'stock-service', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Connect to MongoDB and start server
mongoose.connect(config.mongoURI)
  .then(() => {
    console.log('✓ Connected to MongoDB');
    app.listen(config.port, () => {
      console.log(`✓ Stock service running on port ${config.port}`);
      console.log(`  - API Base: http://localhost:${config.port}/api/stocks`);
      console.log(`  - Health: http://localhost:${config.port}/health`);
    });
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
