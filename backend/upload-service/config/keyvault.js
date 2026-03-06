const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

/**
 * Gets secrets from environment variables (local dev) or Azure Key Vault (production).
 * 
 * Local development: Set DB_CONNECTION_STRING and UPLOAD_PASSWORD in .env
 * Production (Azure): Set KEY_VAULT_NAME, uses Managed Identity automatically
 * 
 * @param {string} keyVaultName - The name of the Key Vault (optional for local dev)
 * @returns {Promise<{dbConnectionString: string, uploadPassword: string}>}
 */
async function getSecrets(keyVaultName) {
  // Check for environment variables first (local development)
  const envDbConnectionString = process.env.DB_CONNECTION_STRING;
  const envUploadPassword = process.env.UPLOAD_PASSWORD;

  if (envDbConnectionString && envUploadPassword) {
    console.log("✓ Using secrets from environment variables (local development)");
    return {
      dbConnectionString: envDbConnectionString,
      uploadPassword: envUploadPassword
    };
  }

  // Fall back to Key Vault (production)
  if (!keyVaultName) {
    throw new Error("Either set DB_CONNECTION_STRING/UPLOAD_PASSWORD env vars (local) or KEY_VAULT_NAME (production)");
  }

  const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;
  const credential = new DefaultAzureCredential();
  const client = new SecretClient(keyVaultUrl, credential);

  console.log(`Fetching secrets from Key Vault: ${keyVaultName}`);

  try {
    // Fetch both secrets in parallel
    const [dbConnectionStringSecret, uploadPasswordSecret] = await Promise.all([
      client.getSecret("db-connection-string"),
      client.getSecret("upload-password")
    ]);

    console.log("✓ Secrets successfully fetched from Key Vault");

    return {
      dbConnectionString: dbConnectionStringSecret.value,
      uploadPassword: uploadPasswordSecret.value
    };
  } catch (error) {
    console.error("✗ Failed to fetch secrets from Key Vault:", error.message);
    throw error;
  }
}

module.exports = { getSecrets };
