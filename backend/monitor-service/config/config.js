require('dotenv').config();

const config = {};

config.storageKey = process.env.STORAGE_KEY || "";
config.storageName = process.env.STORAGE_NAME || "";
config.dbConnectionString = process.env.DB_CONNECTION_STRING || "";

// Service endpoints for health checks
// url: internal Docker URL (or localhost for local dev)
// displayUrl: external URL shown in UI (configurable for prod)
config.services = {
  'upload-service': {
    name: 'Upload Service',
    url: process.env.UPLOAD_SERVICE_URL || 'http://localhost:8000',
    displayUrl: process.env.UPLOAD_SERVICE_DISPLAY_URL || 'http://localhost:8000',
    healthEndpoint: '/health'
  },
  'insights-service': {
    name: 'Insights Service',
    url: process.env.INSIGHTS_SERVICE_URL || 'http://localhost:9000',
    displayUrl: process.env.INSIGHTS_SERVICE_DISPLAY_URL || 'http://localhost:9000',
    healthEndpoint: '/health'
  },
  'investment-service': {
    name: 'Investment Service',
    url: process.env.INVESTMENT_SERVICE_URL || 'http://localhost:3004',
    displayUrl: process.env.INVESTMENT_SERVICE_DISPLAY_URL || 'http://localhost:3004',
    healthEndpoint: '/health'
  }
};

module.exports = config;