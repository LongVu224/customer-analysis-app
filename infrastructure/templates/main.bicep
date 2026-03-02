param projectBaseName string
param storageAccountName string = replace('${projectBaseName}storage', '-', '')
param keyVaultName string = '${projectBaseName}-kv'

// Monitoring parameters
param appInsightsName string = '${projectBaseName}-ai'
param logAnalyticsWorkspaceName string = '${projectBaseName}-law'

// Docker Hub parameters
param dockerHubUsername string
@secure()
param dockerHubPassword string

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

module containerApps 'modular/container-apps.bicep' = {
  params: {
    environmentName: containerAppsEnvironmentName
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
    dockerHubUsername: dockerHubUsername
    dockerHubPassword: dockerHubPassword
    frontendAppName: frontendAppName
    uploadServiceAppName: uploadServiceAppName
    insightsServiceAppName: insightsServiceAppName
    monitorServiceAppName: monitorServiceAppName
    imageTag: imageTag
  }
}

// Outputs for deployment and configuration
output frontendUrl string = containerApps.outputs.frontendUrl
output uploadServiceFqdn string = containerApps.outputs.uploadServiceFqdn
output insightsServiceFqdn string = containerApps.outputs.insightsServiceFqdn
output monitorServiceFqdn string = containerApps.outputs.monitorServiceFqdn
