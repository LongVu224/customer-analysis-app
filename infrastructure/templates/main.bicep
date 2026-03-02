param projectBaseName string
param storageAccountName string = replace('${projectBaseName}storage', '-', '')
param keyVaultName string = '${projectBaseName}-kv'

// Monitoring parameters
param appInsightsName string = '${projectBaseName}-ai'
param logAnalyticsWorkspaceName string = '${projectBaseName}-law'

// Container Registry parameters
param containerRegistryName string = replace('${projectBaseName}acr', '-', '')

// Container Apps parameters
param containerAppsEnvironmentName string = '${projectBaseName}-env'
param frontendAppName string = '${projectBaseName}-frontend'
param uploadServiceAppName string = '${projectBaseName}-upload'
param insightsServiceAppName string = '${projectBaseName}-insights'
param monitorServiceAppName string = '${projectBaseName}-monitor'

// Image tag - override during deployment
param imageTag string = 'latest'

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

module containerRegistry 'modular/container-registry.bicep' = {
  params: {
    containerRegistryName: containerRegistryName
  }
}

module containerApps 'modular/container-apps.bicep' = {
  params: {
    environmentName: containerAppsEnvironmentName
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
    containerRegistryLoginServer: containerRegistry.outputs.loginServer
    containerRegistryName: containerRegistry.outputs.registryName
    frontendAppName: frontendAppName
    uploadServiceAppName: uploadServiceAppName
    insightsServiceAppName: insightsServiceAppName
    monitorServiceAppName: monitorServiceAppName
    imageTag: imageTag
  }
}

// Outputs for deployment and configuration
output containerRegistryLoginServer string = containerRegistry.outputs.loginServer
output containerRegistryName string = containerRegistry.outputs.registryName
output frontendUrl string = containerApps.outputs.frontendUrl
output uploadServiceFqdn string = containerApps.outputs.uploadServiceFqdn
output insightsServiceFqdn string = containerApps.outputs.insightsServiceFqdn
output monitorServiceFqdn string = containerApps.outputs.monitorServiceFqdn
