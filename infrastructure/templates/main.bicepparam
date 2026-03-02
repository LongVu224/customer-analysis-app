using 'main.bicep'

param projectBaseName = 'customer-analysis'

// Docker Hub credentials
param dockerHubUsername = 'longvu224'
param dockerHubPassword = '' // Override via CLI: --parameters dockerHubPassword='YOUR_TOKEN'
