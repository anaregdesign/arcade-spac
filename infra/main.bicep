param appName string = 'arcade'
param location string = resourceGroup().location
param containerImage string
param manageRuntimeRoleAssignments bool = true
param deploySql bool = false
param sqlDatabaseName string = 'arcade'
param sqlAdministratorLogin string = ''
@secure()
param sqlAdministratorPassword string = ''
param sqlEnableEntraOnlyAuthentication bool = true
param sqlEntraAdminLogin string = ''
param sqlEntraAdminObjectId string = ''
param sqlEntraAdminTenantId string = tenant().tenantId
@allowed([
  'User'
  'Group'
  'Application'
])
param sqlEntraAdminPrincipalType string = 'Group'
param entraTenantId string = tenant().tenantId
param containerPort int = 3000
param cpu int = 1
param memory string = '2Gi'
param healthProbePath string = '/health'
param vnetAddressPrefix string = '10.0.0.0/16'
param containerAppsInfrastructureSubnetPrefix string = '10.0.0.0/23'
param privateEndpointSubnetPrefix string = '10.0.2.0/24'
param enablePrivateConfigStoreEndpoints bool = true
param appConfigurationPrivateDnsZoneName string = 'privatelink.azconfig.io'
param environmentVariables array = [
  {
    name: 'NODE_ENV'
    value: 'production'
  }
  {
    name: 'PORT'
    value: '3000'
  }
]
param tags object = {}

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
var appConfigurationPrivateEndpointName = 'pep-${appConfigurationName}'
var keyVaultPrivateEndpointName = 'pep-${keyVaultName}'
var keyVaultPrivateDnsZoneName = 'privatelink${replace(environment().suffixes.keyvaultDns, '.vault.', '.vaultcore.')}'
var sqlMigrationIdentityName = take('id-sql-migrate-${appName}', 24)
var sqlServerFqdn = '${sqlServerName}${environment().suffixes.sqlServerHostname}'
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
    publicNetworkAccess: enablePrivateConfigStoreEndpoints ? 'Disabled' : 'Enabled'
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
    publicNetworkAccess: enablePrivateConfigStoreEndpoints ? 'Disabled' : 'Enabled'
    softDeleteRetentionInDays: 90
  }
}

resource appConfigurationPrivateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = if (enablePrivateConfigStoreEndpoints) {
  name: appConfigurationPrivateDnsZoneName
  location: 'global'
  properties: {}
}

resource appConfigurationPrivateDnsZoneVirtualNetworkLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = if (enablePrivateConfigStoreEndpoints) {
  parent: appConfigurationPrivateDnsZone
  name: '${virtualNetworkName}-link'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: virtualNetwork.id
    }
  }
}

resource appConfigurationPrivateEndpoint 'Microsoft.Network/privateEndpoints@2024-05-01' = if (enablePrivateConfigStoreEndpoints) {
  name: appConfigurationPrivateEndpointName
  location: location
  tags: tags
  properties: {
    subnet: {
      id: privateEndpointSubnet.id
    }
    privateLinkServiceConnections: [
      {
        name: '${appConfigurationPrivateEndpointName}-connection'
        properties: {
          privateLinkServiceId: appConfiguration.id
          groupIds: [
            'configurationStores'
          ]
        }
      }
    ]
  }
}

resource appConfigurationPrivateEndpointDnsZoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-05-01' = if (enablePrivateConfigStoreEndpoints) {
  parent: appConfigurationPrivateEndpoint
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'appconfig'
        properties: {
          privateDnsZoneId: appConfigurationPrivateDnsZone.id
        }
      }
    ]
  }
}

resource keyVaultPrivateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = if (enablePrivateConfigStoreEndpoints) {
  name: keyVaultPrivateDnsZoneName
  location: 'global'
  properties: {}
}

resource keyVaultPrivateDnsZoneVirtualNetworkLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = if (enablePrivateConfigStoreEndpoints) {
  parent: keyVaultPrivateDnsZone
  name: '${virtualNetworkName}-link'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: virtualNetwork.id
    }
  }
}

resource keyVaultPrivateEndpoint 'Microsoft.Network/privateEndpoints@2024-05-01' = if (enablePrivateConfigStoreEndpoints) {
  name: keyVaultPrivateEndpointName
  location: location
  tags: tags
  properties: {
    subnet: {
      id: privateEndpointSubnet.id
    }
    privateLinkServiceConnections: [
      {
        name: '${keyVaultPrivateEndpointName}-connection'
        properties: {
          privateLinkServiceId: keyVault.id
          groupIds: [
            'vault'
          ]
        }
      }
    ]
  }
}

resource keyVaultPrivateEndpointDnsZoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-05-01' = if (enablePrivateConfigStoreEndpoints) {
  parent: keyVaultPrivateEndpoint
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'keyvault'
        properties: {
          privateDnsZoneId: keyVaultPrivateDnsZone.id
        }
      }
    ]
  }
}

resource sqlMigrationIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = if (deploySql) {
  name: sqlMigrationIdentityName
  location: location
  tags: tags
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
                name: 'AZURE_APP_NAME'
                value: appName
              }
              {
                name: 'AZURE_CONTAINER_APP_NAME'
                value: containerAppName
              }
              {
                name: 'AZURE_APPCONFIG_ENDPOINT'
                value: appConfiguration.properties.endpoint
              }
              {
                name: 'AZURE_KEY_VAULT_URI'
                value: keyVault.properties.vaultUri
              }
              {
                name: 'AZURE_TENANT_ID'
                value: entraTenantId
              }
            ],
            environmentVariables
          )
          probes: [
            {
              type: 'Startup'
              httpGet: {
                path: healthProbePath
                port: containerPort
              }
              initialDelaySeconds: 5
              periodSeconds: 5
              timeoutSeconds: 3
              failureThreshold: 48
            }
            {
              type: 'Readiness'
              httpGet: {
                path: healthProbePath
                port: containerPort
              }
              initialDelaySeconds: 3
              periodSeconds: 10
              timeoutSeconds: 3
              failureThreshold: 6
            }
            {
              type: 'Liveness'
              httpGet: {
                path: healthProbePath
                port: containerPort
              }
              initialDelaySeconds: 10
              periodSeconds: 15
              timeoutSeconds: 3
              failureThreshold: 4
            }
          ]
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

resource sqlServer 'Microsoft.Sql/servers@2021-11-01-preview' = if (deploySql) {
  name: sqlServerName
  location: location
  tags: tags
  properties: union(
    {
      administratorLogin: sqlAdministratorLogin
      minimalTlsVersion: '1.2'
      publicNetworkAccess: 'Disabled'
      version: '12.0'
      administrators: {
        administratorType: 'ActiveDirectory'
        azureADOnlyAuthentication: sqlEnableEntraOnlyAuthentication
        login: sqlEntraAdminLogin
        principalType: sqlEntraAdminPrincipalType
        sid: sqlEntraAdminObjectId
        tenantId: sqlEntraAdminTenantId
      }
    },
    empty(sqlAdministratorPassword)
      ? {}
      : {
          administratorLoginPassword: sqlAdministratorPassword
        }
  )
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2021-11-01-preview' = if (deploySql) {
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

resource sqlPrivateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = if (deploySql) {
  name: sqlPrivateDnsZoneName
  location: 'global'
  properties: {}
}

resource sqlPrivateDnsZoneVirtualNetworkLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = if (deploySql) {
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

resource sqlPrivateEndpoint 'Microsoft.Network/privateEndpoints@2024-05-01' = if (deploySql) {
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

resource sqlPrivateEndpointDnsZoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-05-01' = if (deploySql) {
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

resource appConfigurationDataReaderAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (manageRuntimeRoleAssignments) {
  name: guid(appConfiguration.id, containerApp.name, appConfigDataReaderRoleDefinitionId)
  scope: appConfiguration
  properties: {
    principalId: containerApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: appConfigDataReaderRoleDefinitionId
  }
}

resource keyVaultSecretsUserAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (manageRuntimeRoleAssignments) {
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
output sqlServerName string = deploySql ? sqlServer!.name : ''
output sqlServerFullyQualifiedDomainName string = deploySql ? sqlServerFqdn : ''
output sqlDatabaseName string = deploySql ? sqlDatabase!.name : ''
output sqlRuntimeIdentityPrincipalId string = deploySql ? containerApp.identity.principalId : ''
output sqlMigrationIdentityPrincipalId string = deploySql ? sqlMigrationIdentity!.properties.principalId : ''
output sqlMigrationIdentityClientId string = deploySql ? sqlMigrationIdentity!.properties.clientId : ''
