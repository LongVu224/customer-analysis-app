require('dotenv').config();

const config = {};

// Storage account name (required)
config.storageName = process.env.STORAGE_NAME || "";
// Storage account URL for identity-based auth (constructed from storage name)
config.storageUrl = process.env.STORAGE_URL || (config.storageName ? `https://${config.storageName}.blob.core.windows.net` : "");
// Storage key is optional - if not provided, will use DefaultAzureCredential
config.storageKey = process.env.STORAGE_KEY || "";
config.dbConnectionString = process.env.DB_CONNECTION_STRING || "";
config.uploadPassword = process.env.UPLOAD_PASSWORD || "";

module.exports = config;