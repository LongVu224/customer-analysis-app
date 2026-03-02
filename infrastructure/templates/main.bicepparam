using 'main.bicep'

param projectBaseName = 'customer-analysis'

// Docker Hub credentials - passed from pipeline as secrets
param dockerHubUsername = 'longvu224'
// param dockerHubPassword is passed via --parameters in pipeline (secret)
