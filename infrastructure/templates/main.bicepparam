using 'main.bicep'

param projectBaseName = 'sale-analysis'

// Docker Hub credentials
param dockerHubUsername = 'longvu224'
param dockerHubPassword = '' // Override via CLI: --parameters dockerHubPassword='YOUR_TOKEN'
