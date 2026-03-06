const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

/**
 * Gets secrets from environment variables (local dev) or Azure Key Vault (production).
 * 
 * Local development: Set DB_CONNECTION_STRING in .env
 * Production (Azure): Set KEY_VAULT_NAME, uses Managed Identity automatically
 * 
 * @param {string} keyVaultName - The name of the Key Vault (optional for local dev)
 * @returns {Promise<{dbConnectionString: string}>}
 */
async function getSecrets(keyVaultName) {
  // Check for environment variables first (local development)
  const envDbConnectionString = process.env.DB_CONNECTION_STRING;

  if (envDbConnectionString) {
    console.log("✓ Using secrets from environment variables (local development)");
    return {
      dbConnectionString: envDbConnectionString
    };
  }

  // Fall back to Key Vault (production)
  if (!keyVaultName) {
    throw new Error("Either set DB_CONNECTION_STRING env var (local) or KEY_VAULT_NAME (production)");
  }

  const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;
  const credential = new DefaultAzureCredential();
  const client = new SecretClient(keyVaultUrl, credential);

  console.log(`Fetching secrets from Key Vault: ${keyVaultName}`);

  try {
    const dbConnectionStringSecret = await client.getSecret("db-connection-string");

    console.log("✓ Secrets successfully fetched from Key Vault");

    return {
      dbConnectionString: dbConnectionStringSecret.value
    };
  } catch (error) {
    console.error("✗ Failed to fetch secrets from Key Vault:", error.message);
    throw error;
  }
}

module.exports = { getSecrets };
