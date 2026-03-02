param location string = resourceGroup().location
param environmentName string
param logAnalyticsWorkspaceId string

// Container Registry configuration
param containerRegistryLoginServer string
param containerRegistryName string

// Container App names
param frontendAppName string
param uploadServiceAppName string
param insightsServiceAppName string
param monitorServiceAppName string

// Image tags (default to 'latest', override in pipeline)
param imageTag string = 'latest'

// Reference to existing ACR for role assignment
resource existingAcr 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: containerRegistryName
}

// User-assigned managed identity for pulling images from ACR
resource containerAppIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${environmentName}-identity'
  location: location
}

// Role assignment: AcrPull role for the managed identity
resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(existingAcr.id, containerAppIdentity.id, 'acrpull')
  scope: existingAcr
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
    principalId: containerAppIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Container Apps Environment
resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: environmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: reference(logAnalyticsWorkspaceId, '2022-10-01').customerId
        sharedKey: listKeys(logAnalyticsWorkspaceId, '2022-10-01').primarySharedKey
      }
    }
  }
}

// Upload Service - External ingress (backend API)
resource uploadServiceApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: uploadServiceAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${containerAppIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8000
        transport: 'http'
        allowInsecure: false
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
        }
      }
      registries: [
        {
          server: containerRegistryLoginServer
          identity: containerAppIdentity.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'upload-service'
          image: '${containerRegistryLoginServer}/upload-service:${imageTag}'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '8000'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 5
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
  dependsOn: [
    acrPullRoleAssignment
  ]
}

// Insights Service - External ingress (backend API)
resource insightsServiceApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: insightsServiceAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${containerAppIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 9000
        transport: 'http'
        allowInsecure: false
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
        }
      }
      registries: [
        {
          server: containerRegistryLoginServer
          identity: containerAppIdentity.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'insights-service'
          image: '${containerRegistryLoginServer}/insights-service:${imageTag}'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '9000'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 5
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
  dependsOn: [
    acrPullRoleAssignment
  ]
}

// Monitor Service - External ingress (backend API)
resource monitorServiceApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: monitorServiceAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${containerAppIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8999
        transport: 'http'
        allowInsecure: false
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
        }
      }
      registries: [
        {
          server: containerRegistryLoginServer
          identity: containerAppIdentity.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'monitor-service'
          image: '${containerRegistryLoginServer}/monitor-service:${imageTag}'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '8999'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 5
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
  dependsOn: [
    acrPullRoleAssignment
  ]
}

// Frontend - External ingress (public facing)
resource frontendApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: frontendAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${containerAppIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        allowInsecure: false
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
        }
      }
      registries: [
        {
          server: containerRegistryLoginServer
          identity: containerAppIdentity.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: '${containerRegistryLoginServer}/frontend:${imageTag}'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'REACT_APP_UPLOAD_SERVICE_ENDPOINT'
              value: 'https://${uploadServiceApp.properties.configuration.ingress.fqdn}'
            }
            {
              name: 'REACT_APP_INSIGHTS_SERVICE_ENDPOINT'
              value: 'https://${insightsServiceApp.properties.configuration.ingress.fqdn}'
            }
            {
              name: 'REACT_APP_MONITOR_SERVICE_ENDPOINT'
              value: 'https://${monitorServiceApp.properties.configuration.ingress.fqdn}'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
  dependsOn: [
    acrPullRoleAssignment
  ]
}

output environmentId string = containerAppsEnvironment.id
output frontendUrl string = 'https://${frontendApp.properties.configuration.ingress.fqdn}'
output uploadServiceFqdn string = uploadServiceApp.properties.configuration.ingress.fqdn
output insightsServiceFqdn string = insightsServiceApp.properties.configuration.ingress.fqdn
output monitorServiceFqdn string = monitorServiceApp.properties.configuration.ingress.fqdn
