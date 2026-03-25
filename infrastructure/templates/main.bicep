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

// Storage Account
module storageAccount 'modular/storage-account.bicep' = {
  name: 'storageAccount-${deploymentTimestamp}'
  params: {
    storageAccountName: storageAccountName
  }
}

// Key Vault
module keyVault 'modular/key-vault.bicep' = {
  name: 'keyVault-${deploymentTimestamp}'
  params: {
    keyVaultName: keyVaultName
    location: keyVaultLocation
  }
}

// Monitoring (App Insights + Log Analytics)
module monitoring 'modular/monitoring.bicep' = {
  name: 'monitoring-${deploymentTimestamp}'
  params: {
    appInsightsName: appInsightsName
    logAnalyticsWorkspaceName: logAnalyticsWorkspaceName
  }
}

// Container Apps Environment
module containerAppsEnvironment 'modular/container-apps-environment.bicep' = {
  name: 'container-apps-env-${deploymentTimestamp}'
  params: {
    name: containerAppsEnvironmentName
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
  }
}

// Container Apps - Backend Services
// Upload Service
module uploadService 'modular/container-app.bicep' = {
  name: 'upload-service-${deploymentTimestamp}'
  params: {
    name: uploadServiceAppName
    environmentId: containerAppsEnvironment.outputs.id
    image: 'docker.io/${dockerHubUsername}/upload-service:${imageTag}'
    port: 8000
    enableManagedIdentity: true
    minReplicas: 0
    maxReplicas: 5
    dockerHubUsername: dockerHubUsername
    dockerHubPassword: dockerHubPassword
    envVars: [
      { name: 'NODE_ENV', value: 'production' }
      { name: 'PORT', value: '8000' }
      { name: 'KEY_VAULT_NAME', value: keyVaultName }
      { name: 'STORAGE_NAME', value: storageAccountName }
    ]
  }
}

// Insights Service
module insightsService 'modular/container-app.bicep' = {
  name: 'insights-service-${deploymentTimestamp}'
  params: {
    name: insightsServiceAppName
    environmentId: containerAppsEnvironment.outputs.id
    image: 'docker.io/${dockerHubUsername}/insights-service:${imageTag}'
    port: 9000
    enableManagedIdentity: true
    minReplicas: 0
    maxReplicas: 5
    dockerHubUsername: dockerHubUsername
    dockerHubPassword: dockerHubPassword
    envVars: [
      { name: 'NODE_ENV', value: 'production' }
      { name: 'PORT', value: '9000' }
      { name: 'KEY_VAULT_NAME', value: keyVaultName }
      { name: 'STORAGE_NAME', value: storageAccountName }
    ]
  }
}

// Investment Service
module investmentService 'modular/container-app.bicep' = {
  name: 'investment-service-${deploymentTimestamp}'
  params: {
    name: investmentServiceAppName
    environmentId: containerAppsEnvironment.outputs.id
    image: 'docker.io/${dockerHubUsername}/investment-service:${imageTag}'
    port: 3004
    enableManagedIdentity: true
    minReplicas: 0
    maxReplicas: 5
    dockerHubUsername: dockerHubUsername
    dockerHubPassword: dockerHubPassword
    envVars: [
      { name: 'NODE_ENV', value: 'production' }
      { name: 'PORT', value: '3004' }
      { name: 'KEY_VAULT_NAME', value: keyVaultName }
    ]
  }
}

// Monitor Service (references other services for health checks)
module monitorService 'modular/container-app.bicep' = {
  name: 'monitor-service-${deploymentTimestamp}'
  params: {
    name: monitorServiceAppName
    environmentId: containerAppsEnvironment.outputs.id
    image: 'docker.io/${dockerHubUsername}/monitor-service:${imageTag}'
    port: 8999
    enableManagedIdentity: true
    minReplicas: 0
    maxReplicas: 5
    dockerHubUsername: dockerHubUsername
    dockerHubPassword: dockerHubPassword
    envVars: [
      { name: 'NODE_ENV', value: 'production' }
      { name: 'PORT', value: '8999' }
      { name: 'KEY_VAULT_NAME', value: keyVaultName }
      { name: 'UPLOAD_SERVICE_URL', value: 'https://${uploadService.outputs.fqdn}' }
      { name: 'INSIGHTS_SERVICE_URL', value: 'https://${insightsService.outputs.fqdn}' }
      { name: 'INVESTMENT_SERVICE_URL', value: 'https://${investmentService.outputs.fqdn}' }
    ]
  }
}

// Container Apps - Frontend
module frontend 'modular/container-app.bicep' = {
  name: 'frontend-${deploymentTimestamp}'
  params: {
    name: frontendAppName
    environmentId: containerAppsEnvironment.outputs.id
    image: 'docker.io/${dockerHubUsername}/frontend:${imageTag}'
    port: 3000
    enableManagedIdentity: false
    minReplicas: 1
    maxReplicas: 3
    dockerHubUsername: dockerHubUsername
    dockerHubPassword: dockerHubPassword
    envVars: []  // React env vars are baked at build time via --build-arg
  }
}

// Outputs
output frontendUrl string = 'https://${frontend.outputs.fqdn}'
output uploadServiceFqdn string = uploadService.outputs.fqdn
output insightsServiceFqdn string = insightsService.outputs.fqdn
output monitorServiceFqdn string = monitorService.outputs.fqdn
output investmentServiceFqdn string = investmentService.outputs.fqdn

// Principal IDs for RBAC assignments
output uploadServicePrincipalId string = uploadService.outputs.principalId
output insightsServicePrincipalId string = insightsService.outputs.principalId
output monitorServicePrincipalId string = monitorService.outputs.principalId
output investmentServicePrincipalId string = investmentService.outputs.principalId
