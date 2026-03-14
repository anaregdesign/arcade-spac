param appName string
param location string = resourceGroup().location
param containerImage string
param containerPort int = 3000
param cpu int = 1
param memory string = '2Gi'
param environmentVariables array = []
param tags object = {}
param vnetAddressPrefix string = '10.0.0.0/16'
param containerAppsInfrastructureSubnetPrefix string = '10.0.0.0/23'
param privateEndpointSubnetPrefix string = '10.0.2.0/24'
param deployAzureSql bool = false
param sqlAdministratorLogin string = ''
@secure()
param sqlAdministratorPassword string = ''
param sqlDatabaseName string = 'app'

var logAnalyticsWorkspaceName = 'law-${appName}'
var applicationInsightsName = 'appi-${appName}'
var managedEnvironmentName = 'cae-${appName}'
var containerAppName = 'ca-${appName}'
var appConfigurationName = take('appcs-${appName}-${uniqueString(resourceGroup().id)}', 50)
var normalizedAppName = toLower(replace(appName, '-', ''))
var keyVaultName = take('kv${normalizedAppName}${uniqueString(subscription().id, resourceGroup().id)}', 24)
var virtualNetworkName = 'vnet-${appName}'
var containerAppsInfrastructureSubnetName = 'snet-cae'
var privateEndpointSubnetName = 'snet-pe'
var sqlServerName = toLower(take('sql-${appName}-${uniqueString(resourceGroup().id)}', 63))
var sqlPrivateEndpointName = 'pep-${sqlServerName}'
var sqlPrivateDnsZoneName = 'privatelink${environment().suffixes.sqlServerHostname}'
var appConfigDataReaderRoleDefinitionId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '516239f1-63e1-4d78-a4de-a74fb236a071')
var keyVaultSecretsUserRoleDefinitionId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: applicationInsightsName
  location: location
  kind: 'web'
  tags: tags
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2024-05-01' = {
  name: virtualNetworkName
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: [
        vnetAddressPrefix
      ]
    }
  }
}

resource containerAppsInfrastructureSubnet 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' = {
  parent: virtualNetwork
  name: containerAppsInfrastructureSubnetName
  properties: {
    addressPrefix: containerAppsInfrastructureSubnetPrefix
    delegations: [
      {
        name: 'container-apps'
        properties: {
          serviceName: 'Microsoft.App/environments'
        }
      }
    ]
  }
}

resource privateEndpointSubnet 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' = {
  parent: virtualNetwork
  name: privateEndpointSubnetName
  properties: {
    addressPrefix: privateEndpointSubnetPrefix
    privateEndpointNetworkPolicies: 'Disabled'
  }
}

resource appConfiguration 'Microsoft.AppConfiguration/configurationStores@2024-05-01' = {
  name: appConfigurationName
  location: location
  tags: tags
  sku: {
    name: 'standard'
  }
  properties: {
    disableLocalAuth: true
    publicNetworkAccess: 'Enabled'
    softDeleteRetentionInDays: 7
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    tenantId: tenant().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enableRbacAuthorization: true
    enablePurgeProtection: true
    publicNetworkAccess: 'Enabled'
    softDeleteRetentionInDays: 90
  }
}

resource managedEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: managedEnvironmentName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: logAnalyticsWorkspace.listKeys().primarySharedKey
      }
    }
    vnetConfiguration: {
      infrastructureSubnetId: containerAppsInfrastructureSubnet.id
      internal: false
    }
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  }
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: managedEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: containerPort
        transport: 'auto'
      }
    }
    template: {
      containers: [
        {
          name: 'web'
          image: containerImage
          env: concat(
            [
              {
                name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
                value: applicationInsights.properties.ConnectionString
              }
              {
                name: 'AZURE_APPCONFIG_ENDPOINT'
                value: appConfiguration.properties.endpoint
              }
              {
                name: 'AZURE_KEY_VAULT_URI'
                value: keyVault.properties.vaultUri
              }
            ],
            environmentVariables
          )
          resources: {
            cpu: cpu
            memory: memory
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

resource sqlServer 'Microsoft.Sql/servers@2021-11-01-preview' = if (deployAzureSql) {
  name: sqlServerName
  location: location
  tags: tags
  properties: {
    administratorLogin: sqlAdministratorLogin
    administratorLoginPassword: sqlAdministratorPassword
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Disabled'
    version: '12.0'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2021-11-01-preview' = if (deployAzureSql) {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  tags: tags
  sku: {
    name: 'GP_S_Gen5_1'
    tier: 'GeneralPurpose'
    capacity: 1
  }
  properties: {
    autoPauseDelay: 60
    minCapacity: 1
    readScale: 'Disabled'
  }
}

resource sqlPrivateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = if (deployAzureSql) {
  name: sqlPrivateDnsZoneName
  location: 'global'
  properties: {}
}

resource sqlPrivateDnsZoneVirtualNetworkLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = if (deployAzureSql) {
  parent: sqlPrivateDnsZone
  name: '${virtualNetworkName}-link'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: virtualNetwork.id
    }
  }
}

resource sqlPrivateEndpoint 'Microsoft.Network/privateEndpoints@2024-05-01' = if (deployAzureSql) {
  name: sqlPrivateEndpointName
  location: location
  tags: tags
  properties: {
    subnet: {
      id: privateEndpointSubnet.id
    }
    privateLinkServiceConnections: [
      {
        name: '${sqlPrivateEndpointName}-connection'
        properties: {
          privateLinkServiceId: sqlServer.id
          groupIds: [
            'sqlServer'
          ]
        }
      }
    ]
  }
}

resource sqlPrivateEndpointDnsZoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-05-01' = if (deployAzureSql) {
  parent: sqlPrivateEndpoint
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'sql'
        properties: {
          privateDnsZoneId: sqlPrivateDnsZone.id
        }
      }
    ]
  }
}

resource appConfigurationDataReaderAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(appConfiguration.id, containerApp.name, appConfigDataReaderRoleDefinitionId)
  scope: appConfiguration
  properties: {
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: appConfigDataReaderRoleDefinitionId
  }
}

resource keyVaultSecretsUserAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, containerApp.name, keyVaultSecretsUserRoleDefinitionId)
  scope: keyVault
  properties: {
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: keyVaultSecretsUserRoleDefinitionId
  }
}

output containerAppName string = containerApp.name
output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
output managedIdentityPrincipalId string = containerApp.identity.principalId
output appConfigurationEndpoint string = appConfiguration.properties.endpoint
output keyVaultUri string = keyVault.properties.vaultUri
output virtualNetworkId string = virtualNetwork.id
output containerAppsInfrastructureSubnetId string = containerAppsInfrastructureSubnet.id
output privateEndpointSubnetId string = privateEndpointSubnet.id
output sqlServerFqdn string = deployAzureSql ? '${sqlServer.name}${environment().suffixes.sqlServerHostname}' : ''
output azureSqlDatabaseName string = deployAzureSql ? sqlDatabase.name : ''
