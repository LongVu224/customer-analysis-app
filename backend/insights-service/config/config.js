require('dotenv').config();

const config = {};

// Key Vault name for fetching secrets
config.keyVaultName = process.env.KEY_VAULT_NAME || "";

// Storage account name (required)
config.storageName = process.env.STORAGE_NAME || "";
// Storage account URL for identity-based auth (constructed from storage name)
config.storageUrl = process.env.STORAGE_URL || (config.storageName ? `https://${config.storageName}.blob.core.windows.net` : "");

// This will be populated from Key Vault at runtime
config.dbConnectionString = "";

module.exports = config;