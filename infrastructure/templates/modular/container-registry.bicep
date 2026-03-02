param location string = resourceGroup().location
param containerRegistryName string

@allowed([
  'Basic'
  'Standard'
  'Premium'
])
param sku string = 'Basic'

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: containerRegistryName
  location: location
  sku: {
    name: sku
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
    policies: {
      retentionPolicy: {
        status: 'enabled'
        days: 7
      }
    }
  }
}

output registryId string = containerRegistry.id
output registryName string = containerRegistry.name
output loginServer string = containerRegistry.properties.loginServer
