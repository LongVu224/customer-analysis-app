param projectBaseName string
param storageAccountName string = replace('${projectBaseName}storage', '-', '')
param keyVaultName string = '${projectBaseName}-kv'

// monitoring parameters
param appInsightsName string = '${projectBaseName}-ai'
param logAnalyticsWorkspaceName string = '${projectBaseName}-law'

// App Service parameters (backend)
param appServicePlanName string = '${projectBaseName}-asp'
param uploadServiceName string = '${projectBaseName}-upload'
param insightsServiceName string = '${projectBaseName}-insights'
param monitorServiceName string = '${projectBaseName}-monitor'

// Static Web App parameters (frontend)
param staticWebAppName string = '${projectBaseName}-frontend'

module storageAccount 'modular/storage-account.bicep' = {
  params: {
    storageAccountName: storageAccountName
  }
}

module keyVault 'modular/key-vault.bicep' = {
  params: {
    keyVaultName: keyVaultName
  }
}

module monitoring 'modular/monitoring.bicep' = {
  params: {
    appInsightsName: appInsightsName
    logAnalyticsWorkspaceName: logAnalyticsWorkspaceName
  }
}

// Frontend Static Web App (React) - deployed first to get URL for CORS
module staticWebApp 'modular/static-web-app.bicep' = {
  params: {
    staticWebAppName: staticWebAppName
  }
}

// Backend App Services (Node.js microservices) - with CORS for frontend
module appService 'modular/app-service.bicep' = {
  params: {
    appServicePlanName: appServicePlanName
    uploadServiceName: uploadServiceName
    insightsServiceName: insightsServiceName
    monitorServiceName: monitorServiceName
    appInsightsInstrumentationKey: monitoring.outputs.appInsightsInstrumentationKey
    allowedOrigins: [
      staticWebApp.outputs.staticWebAppUrl
      'http://localhost:3000' // For local development
    ]
  }
}

// Outputs for deployment and configuration
output uploadServiceUrl string = appService.outputs.uploadServiceUrl
output insightsServiceUrl string = appService.outputs.insightsServiceUrl
output monitorServiceUrl string = appService.outputs.monitorServiceUrl
output frontendUrl string = staticWebApp.outputs.staticWebAppUrl
