param projectBaseName string
param storageAccountName string = replace('${projectBaseName}stor', '-', '')
param keyVaultName string = '${projectBaseName}-kv'
param keyVaultLocation string = 'westeurope'

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
param investmentServiceAppName string = '${projectBaseName}-investment'

// Image tag - override during deployment
param imageTag string = 'latest'

// Deployment timestamp for unique nested deployment names
param deploymentTimestamp string = utcNow('yyyyMMddHHmmss')

module storageAccount 'modular/storage-account.bicep' = {
  name: 'storageAccount-${deploymentTimestamp}'
  params: {
    storageAccountName: storageAccountName
  }
}

module keyVault 'modular/key-vault.bicep' = {
  name: 'keyVault-${deploymentTimestamp}'
  params: {
    keyVaultName: keyVaultName
    location: keyVaultLocation
  }
}

module monitoring 'modular/monitoring.bicep' = {
  name: 'monitoring-${deploymentTimestamp}'
  params: {
    appInsightsName: appInsightsName
    logAnalyticsWorkspaceName: logAnalyticsWorkspaceName
  }
}

module containerApps 'modular/container-apps.bicep' = {
  name: 'containerApps-${deploymentTimestamp}'
  params: {
    environmentName: containerAppsEnvironmentName
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
    dockerHubUsername: dockerHubUsername
    dockerHubPassword: dockerHubPassword
    keyVaultName: keyVaultName
    storageAccountName: storageAccountName
    frontendAppName: frontendAppName
    uploadServiceAppName: uploadServiceAppName
    insightsServiceAppName: insightsServiceAppName
    monitorServiceAppName: monitorServiceAppName
    investmentServiceAppName: investmentServiceAppName
    imageTag: imageTag
  }
}

// Outputs for deployment and configuration
output frontendUrl string = containerApps.outputs.frontendUrl
output uploadServiceFqdn string = containerApps.outputs.uploadServiceFqdn
output insightsServiceFqdn string = containerApps.outputs.insightsServiceFqdn
output monitorServiceFqdn string = containerApps.outputs.monitorServiceFqdn
output investmentServiceFqdn string = containerApps.outputs.investmentServiceFqdn

// Output principal IDs for RBAC assignments
output uploadServicePrincipalId string = containerApps.outputs.uploadServicePrincipalId
output insightsServicePrincipalId string = containerApps.outputs.insightsServicePrincipalId
output monitorServicePrincipalId string = containerApps.outputs.monitorServicePrincipalId
output investmentServicePrincipalId string = containerApps.outputs.investmentServicePrincipalId
