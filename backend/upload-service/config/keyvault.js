const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

/**
 * Fetches secrets from Azure Key Vault using DefaultAzureCredential.
 * In local development, this uses Azure CLI credentials.
 * In production (Azure), this uses Managed Identity.
 * 
 * @param {string} keyVaultName - The name of the Key Vault (e.g., 'cabbage-app-kv')
 * @returns {Promise<{dbConnectionString: string, uploadPassword: string}>}
 */
async function getSecrets(keyVaultName) {
  if (!keyVaultName) {
    throw new Error("KEY_VAULT_NAME environment variable is required");
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
