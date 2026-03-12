param appName string = 'arcade'
param location string = resourceGroup().location
param containerImage string
param publicAppUrl string
@allowed([
  'local'
  'entra'
])
param authMode string = 'entra'
param deploySql bool = false
param sqlDatabaseName string = 'arcade'
param sqlAdministratorLogin string = 'arcadeadmin'
@secure()
param sqlAdministratorPassword string = ''
param sqlEntraAdminLogin string = ''
param sqlEntraAdminObjectId string = ''
param entraClientId string = ''
param entraTenantId string = tenant().tenantId
@secure()
param entraClientSecret string = ''
@secure()
param databaseUrl string
@secure()
param sessionSecret string
param containerPort int = 3000
param cpu int = 1
param memory string = '2Gi'
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
var sqlServerName = take('sql-${appName}-${uniqueString(resourceGroup().id)}', 63)
var sqlMigrationIdentityName = take('id-sql-migrate-${appName}', 24)
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

resource sqlMigrationIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = if (deploySql) {
  name: sqlMigrationIdentityName
  location: location
  tags: tags
}

resource sqlServer 'Microsoft.Sql/servers@2024-11-01-preview' = if (deploySql) {
  name: sqlServerName
  location: location
  tags: tags
  properties: {
    administratorLogin: sqlAdministratorLogin
    administratorLoginPassword: sqlAdministratorPassword
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
    restrictOutboundNetworkAccess: 'Disabled'
    version: '12.0'
  }
}

resource sqlServerEntraAdministrator 'Microsoft.Sql/servers/administrators@2024-11-01-preview' = if (deploySql) {
  parent: sqlServer
  name: 'ActiveDirectory'
  properties: {
    administratorType: 'ActiveDirectory'
    login: sqlEntraAdminLogin
    sid: sqlEntraAdminObjectId
    tenantId: tenant().tenantId
  }
}

resource sqlServerAdOnlyAuthentication 'Microsoft.Sql/servers/azureADOnlyAuthentications@2024-11-01-preview' = if (deploySql) {
  parent: sqlServer
  name: 'Default'
  properties: {
    azureADOnlyAuthentication: true
  }
  dependsOn: [
    sqlServerEntraAdministrator
  ]
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2024-11-01-preview' = if (deploySql) {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  tags: tags
  sku: {
    name: 'GP_S_Gen5_2'
    tier: 'GeneralPurpose'
    family: 'Gen5'
    capacity: 2
  }
  properties: {
    autoPauseDelay: 60
    minCapacity: 1
    maintenanceConfigurationId: resourceId('Microsoft.Maintenance/publicMaintenanceConfigurations', 'SQL_Default')
    readScale: 'Disabled'
    requestedBackupStorageRedundancy: 'Local'
    zoneRedundant: false
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
      secrets: concat(
        [
          {
            name: 'arcade-session-secret'
            value: sessionSecret
          }
          {
            name: 'database-url'
            value: databaseUrl
          }
        ],
        authMode == 'entra'
          ? [
              {
                name: 'azure-client-secret'
                value: entraClientSecret
              }
            ]
          : []
      )
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
              {
                name: 'ARCADE_AUTH_MODE'
                value: authMode
              }
              {
                name: 'PUBLIC_APP_URL'
                value: publicAppUrl
              }
              {
                name: 'AZURE_CLIENT_ID'
                value: entraClientId
              }
              {
                name: 'AZURE_TENANT_ID'
                value: entraTenantId
              }
              {
                name: 'ARCADE_SESSION_SECRET'
                secretRef: 'arcade-session-secret'
              }
              {
                name: 'DATABASE_URL'
                secretRef: 'database-url'
              }
            ],
            authMode == 'entra'
              ? [
                  {
                    name: 'AZURE_CLIENT_SECRET'
                    secretRef: 'azure-client-secret'
                  }
                ]
              : [],
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
output sqlServerName string = deploySql ? sqlServer!.name : ''
output sqlServerFullyQualifiedDomainName string = deploySql ? sqlServer!.properties.fullyQualifiedDomainName : ''
output sqlDatabaseName string = deploySql ? sqlDatabase!.name : ''
output sqlRuntimeIdentityPrincipalId string = deploySql ? containerApp.identity.principalId : ''
output sqlMigrationIdentityPrincipalId string = deploySql ? sqlMigrationIdentity!.properties.principalId : ''
output sqlMigrationIdentityClientId string = deploySql ? sqlMigrationIdentity!.properties.clientId : ''
