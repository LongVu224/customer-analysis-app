require('dotenv').config();

const config = {};

config.storageKey = process.env.STORAGE_KEY || "";
config.storageName = process.env.STORAGE_NAME || "";
config.dbConnectionString = process.env.DB_CONNECTION_STRING || "";

module.exports = config;