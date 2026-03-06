const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const config = require('./config/config');
const { getSecrets } = require('./config/keyvault');
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
  res.json({ status: 'healthy', service: 'investment-service', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Async startup: fetch secrets from Key Vault, then connect to MongoDB
async function startServer() {
  try {
    // Fetch secrets from Azure Key Vault
    const secrets = await getSecrets(config.keyVaultName);
    config.mongoURI = secrets.dbConnectionString;

    // Connect to MongoDB and start server
    await mongoose.connect(config.mongoURI);
    console.log('✓ Connected to MongoDB');

    app.listen(config.port, () => {
      console.log(`✓ Investment service running on port ${config.port}`);
      console.log(`  - API Base: http://localhost:${config.port}/api/stocks`);
      console.log(`  - Health: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
