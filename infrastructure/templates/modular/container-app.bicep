// Reusable Container App Module
// This module creates a single container app with configurable parameters

@description('Name of the container app')
param name string

@description('Location for the container app')
param location string = resourceGroup().location

@description('Resource ID of the Container Apps Environment')
param environmentId string

@description('Docker image to deploy')
param image string

@description('Container port')
param port int

@description('CPU allocation (e.g., 0.5)')
param cpu string = '0.5'

@description('Memory allocation (e.g., 1Gi)')
param memory string = '1Gi'

@description('Environment variables for the container')
param envVars array = []

@description('Whether to enable external ingress')
param externalIngress bool = true

@description('Whether to enable system-assigned managed identity')
param enableManagedIdentity bool = false

@description('Minimum number of replicas')
param minReplicas int = 0

@description('Maximum number of replicas')
param maxReplicas int = 5

@description('Concurrent requests for scaling')
param concurrentRequests string = '100'

@description('Docker Hub username')
param dockerHubUsername string

@description('Docker Hub password')
@secure()
param dockerHubPassword string

@description('CORS allowed origins')
param corsAllowedOrigins array = ['*']

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: name
  location: location
  identity: enableManagedIdentity ? {
    type: 'SystemAssigned'
  } : null
  properties: {
    managedEnvironmentId: environmentId
    configuration: {
      secrets: [
        {
          name: 'docker-hub-password'
          value: dockerHubPassword
        }
      ]
      ingress: {
        external: externalIngress
        targetPort: port
        transport: 'http'
        allowInsecure: false
        corsPolicy: {
          allowedOrigins: corsAllowedOrigins
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
        }
      }
      registries: [
        {
          server: 'docker.io'
          username: dockerHubUsername
          passwordSecretRef: 'docker-hub-password'
        }
      ]
    }
    template: {
      containers: [
        {
          name: name
          image: image
          resources: {
            cpu: json(cpu)
            memory: memory
          }
          env: envVars
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: concurrentRequests
              }
            }
          }
        ]
      }
    }
  }
}

// Outputs
output id string = containerApp.id
output name string = containerApp.name
output fqdn string = containerApp.properties.configuration.ingress.fqdn
output principalId string = enableManagedIdentity ? containerApp.identity.principalId : ''
