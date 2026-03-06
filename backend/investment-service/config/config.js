module.exports = {
  // Key Vault name for fetching secrets
  keyVaultName: process.env.KEY_VAULT_NAME || '',
  
  // MongoDB connection (will be populated from Key Vault at runtime)
  mongoURI: '',
  
  // Server port
  port: process.env.PORT || 3004,
  
  // Cache TTL in seconds (15 minutes for stock data)
  cacheTTL: 900,
  
  // Market configurations (25-30 stocks per market)
  markets: {
    us: {
      name: 'US Market',
      symbols: [
        // Tech Giants
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO', 'ORCL', 'CRM',
        // Finance
        'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'AXP',
        // Consumer & Retail
        'WMT', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT', 'COST',
        // Healthcare
        'JNJ', 'UNH', 'PFE', 'ABBV', 'MRK'
      ]
    },
    finland: {
      name: 'Helsinki (Finland)',
      // Finnish stocks on Helsinki Exchange (Yahoo uses .HE suffix)
      symbols: [
        'NOKIA.HE', 'FORTUM.HE', 'NESTE.HE', 'UPM-KYMMENE.HE', 'SAMPO.HE', 
        'ELISA.HE', 'KONE.HE', 'ORION.HE', 'WARTSILA.HE', 'METSO.HE', 
        'STERV.HE', 'NDA-FI.HE', 'HUH1V.HE', 'KESKOB.HE', 'VALMT.HE', 
        'OUT1V.HE', 'TTALO.HE', 'TOKMAN.HE', 'CGCBV.HE', 'KEMIRA.HE'
      ]
    }
  },
  
  // Default watchlist symbols (for backward compatibility)
  defaultSymbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA']
};
