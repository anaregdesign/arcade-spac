param appName string = 'arcade'
param location string = resourceGroup().location
param containerImage string
param manageRuntimeRoleAssignments bool = true
param globalNameSuffix string = ''
param resourceNameSuffix string = ''
param logAnalyticsWorkspaceResourceName string = ''
param applicationInsightsResourceName string = ''
param virtualNetworkResourceName string = ''
param managedEnvironmentResourceName string = ''
param containerAppResourceName string = ''
param sqlMigrationIdentityResourceName string = ''
param sqlBootstrapIdentityResourceName string = ''
param frontDoorProfileResourceName string = ''
param frontDoorEndpointResourceName string = ''
param frontDoorOriginGroupResourceName string = ''
param appConfigurationName string = ''
param keyVaultName string = ''
param existingSqlServerName string = ''
param sqlAdministratorLogin string = ''
@secure()
param sqlAdministratorPassword string = ''

// Shared naming helpers and canonical Azure state strings.
// Lower-cased app name fragment for resources with stricter naming rules.
var scopedAppName = empty(resourceNameSuffix) ? appName : '${appName}-${resourceNameSuffix}'
var normalizedScopedAppName = toLower(replace(scopedAppName, '-', ''))
// Azure global region used by globally scoped resources.
var globalLocation = 'global'
// Canonical enabled state string reused across Azure resource contracts.
var enabledState = 'Enabled'
// Canonical disabled state string reused across Azure resource contracts.
var disabledState = 'Disabled'

// Resource names derived from the app name and deployment scope.
// Log Analytics workspace resource name.
var defaultLogAnalyticsWorkspaceName = 'law-${scopedAppName}'
var resolvedLogAnalyticsWorkspaceName = empty(logAnalyticsWorkspaceResourceName) ? defaultLogAnalyticsWorkspaceName : logAnalyticsWorkspaceResourceName
// Application Insights component resource name.
var defaultApplicationInsightsName = 'appi-${scopedAppName}'
var resolvedApplicationInsightsName = empty(applicationInsightsResourceName) ? defaultApplicationInsightsName : applicationInsightsResourceName
// Virtual network resource name.
var defaultVirtualNetworkName = 'vnet-${scopedAppName}'
var resolvedVirtualNetworkName = empty(virtualNetworkResourceName) ? defaultVirtualNetworkName : virtualNetworkResourceName
// Azure tenant id used across runtime env vars and SQL admin configuration.
var entraTenantId = tenant().tenantId
// Delegated subnet name for the Container Apps environment.
var containerAppsInfrastructureSubnetName = 'snet-cae'
// Private endpoint subnet name for private-link resources.
var privateEndpointSubnetName = 'snet-pe'
// Container Apps managed environment resource name.
var defaultManagedEnvironmentName = 'cae-${scopedAppName}'
var resolvedManagedEnvironmentName = empty(managedEnvironmentResourceName) ? defaultManagedEnvironmentName : managedEnvironmentResourceName
// Container App resource name derived from the canonical app name contract.
var defaultContainerAppName = 'ca-${scopedAppName}'
var resolvedContainerAppName = empty(containerAppResourceName) ? defaultContainerAppName : containerAppResourceName
// Optional operator-managed suffix that can rotate global resource names for clean-slate recovery.
var sanitizedGlobalNameSuffix = toLower(replace(globalNameSuffix, '-', ''))
// App Configuration suffix keeps backward-compatible naming when no override is provided.
var appConfigurationNameSuffix = empty(globalNameSuffix) ? uniqueString(resourceGroup().id) : toLower(globalNameSuffix)
// Key Vault suffix keeps backward-compatible naming when no override is provided.
var keyVaultNameSuffix = empty(globalNameSuffix) ? uniqueString(subscription().id, resourceGroup().id) : sanitizedGlobalNameSuffix
// App Configuration store resource name.
var defaultAppConfigurationName = take('appcs-${scopedAppName}-${appConfigurationNameSuffix}', 50)
var resolvedAppConfigurationName = empty(appConfigurationName) ? defaultAppConfigurationName : appConfigurationName
// Key Vault resource name constrained by global naming rules.
var defaultKeyVaultName = take('kv${normalizedScopedAppName}${keyVaultNameSuffix}', 24)
var resolvedKeyVaultName = empty(keyVaultName) ? defaultKeyVaultName : keyVaultName
// Azure SQL logical server resource name.
var defaultSqlServerName = toLower(take('sql-${scopedAppName}-${uniqueString(resourceGroup().id)}', 63))
var resolvedSqlServerName = empty(existingSqlServerName) ? defaultSqlServerName : existingSqlServerName
// Azure SQL fully qualified host name exposed to clients.
var sqlServerFqdn = '${resolvedSqlServerName}${environment().suffixes.sqlServerHostname}'
// Private DNS zone name for Azure SQL private-link resolution.
var sqlPrivateDnsZoneName = 'privatelink${environment().suffixes.sqlServerHostname}'
// Azure SQL private endpoint resource name.
var sqlPrivateEndpointName = 'pep-${resolvedSqlServerName}'
// Private DNS virtual network link resource name for the SQL zone.
var sqlPrivateDnsZoneVirtualNetworkLinkName = '${resolvedVirtualNetworkName}-link'
// User-assigned identity name used for startup migrations.
var defaultSqlMigrationIdentityName = 'id-sql-migrate-${scopedAppName}'
var resolvedSqlMigrationIdentityName = empty(sqlMigrationIdentityResourceName) ? defaultSqlMigrationIdentityName : sqlMigrationIdentityResourceName
// User-assigned identity name used for initial SQL bootstrap.
var defaultSqlBootstrapIdentityName = 'id-sql-bootstrap-${scopedAppName}'
var resolvedSqlBootstrapIdentityName = empty(sqlBootstrapIdentityResourceName) ? defaultSqlBootstrapIdentityName : sqlBootstrapIdentityResourceName
// Front Door profile resource name.
var defaultFrontDoorProfileName = 'afd-${scopedAppName}'
var resolvedFrontDoorProfileName = empty(frontDoorProfileResourceName) ? defaultFrontDoorProfileName : frontDoorProfileResourceName
// Front Door endpoint resource name constrained by global uniqueness rules.
var defaultFrontDoorEndpointName = toLower(take('afd-${normalizedScopedAppName}-${uniqueString(subscription().id, resourceGroup().id)}', 50))
var resolvedFrontDoorEndpointName = empty(frontDoorEndpointResourceName) ? defaultFrontDoorEndpointName : frontDoorEndpointResourceName
// Front Door origin group resource name.
var defaultFrontDoorOriginGroupName = 'og-${scopedAppName}'
var resolvedFrontDoorOriginGroupName = empty(frontDoorOriginGroupResourceName) ? defaultFrontDoorOriginGroupName : frontDoorOriginGroupResourceName
// Front Door route name for dynamic app traffic.
var frontDoorAppRouteName = 'route-app'
// Front Door route name for static asset traffic.
var frontDoorAssetRouteName = 'route-assets'

// Role definition and principal constants for Azure RBAC resources.
// Built-in role definition id for App Configuration data reads.
var appConfigDataReaderRoleDefinitionId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '516239f1-63e1-4d78-a4de-a74fb236a071')
// Built-in role definition id for Key Vault secret reads.
var keyVaultSecretsUserRoleDefinitionId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
// Principal type recorded on RBAC assignments created by this template.
var roleAssignmentPrincipalType = 'ServicePrincipal'

// Shared platform contract constants for hosted Azure services.
// Virtual network address space for the hosted platform.
var vnetAddressPrefix = '10.0.0.0/16'
// Delegated subnet prefix for the Container Apps environment.
var containerAppsInfrastructureSubnetPrefix = '10.0.0.0/23'
// Private endpoint subnet prefix for private-link resources.
var privateEndpointSubnetPrefix = '10.0.2.0/24'
// Log Analytics SKU for the workspace backing the app environment.
var logAnalyticsSkuName = 'PerGB2018'
// Application Insights kind for the web application component.
var applicationInsightsKind = 'web'
// Application Insights application type for the web workload.
var applicationInsightsType = 'web'
// Delegation name recorded on the Container Apps infrastructure subnet.
var containerAppsDelegationName = 'container-apps'
// Delegated service name required by Container Apps environments.
var containerAppsDelegationServiceName = 'Microsoft.App/environments'
// App Configuration pricing tier for the hosted store.
var appConfigurationSkuName = 'standard'
// Key Vault SKU family for the hosted vault.
var keyVaultSkuFamily = 'A'
// Key Vault SKU name for the hosted vault.
var keyVaultSkuName = 'standard'
// Managed environment log destination type for Log Analytics.
var logAnalyticsDestination = 'log-analytics'
// Workload profile name used by the Container Apps environment.
var managedEnvironmentWorkloadProfileName = 'Consumption'
// Workload profile type used by the Container Apps environment.
var managedEnvironmentWorkloadProfileType = 'Consumption'

// Front Door routing and edge-delivery contract constants.
// Private-link request description expected when Front Door connects to Container Apps.
var frontDoorPrivateLinkRequestMessage = 'AFD Private Link Request'
// Front Door SKU name for private-link origin support.
var frontDoorSkuName = 'Premium_AzureFrontDoor'
// Forwarding protocol enforced on Front Door routes.
var frontDoorForwardingProtocol = 'HttpsOnly'
// Health probe protocol used by the Front Door origin group.
var frontDoorProbeProtocol = 'Https'
// Health probe request method used by the Front Door origin group.
var frontDoorProbeRequestType = 'GET'
// Private-link group id used for Container Apps managed environments.
var frontDoorOriginPrivateLinkGroupId = 'managedEnvironments'
// Supported protocols exposed on Front Door routes.
var frontDoorSupportedProtocols = [
  'Http'
  'Https'
]
// Path patterns routed to the dynamic application endpoint.
var frontDoorAppPatternsToMatch = [
  '/*'
]
// Path patterns routed to the static asset endpoint.
var frontDoorAssetPatternsToMatch = [
  '/assets/*'
]
// Query string caching mode for Front Door asset delivery.
var frontDoorQueryStringCachingBehavior = 'IgnoreQueryString'
// MIME types compressed and cached by the Front Door asset route.
var frontDoorAssetCacheContentTypes = [
  'application/javascript'
  'application/json'
  'application/wasm'
  'font/woff2'
  'image/svg+xml'
  'text/css'
  'text/javascript'
  'text/plain'
]

// Container App runtime contract constants.
// Identity type assigned to the Container App resource.
var containerAppIdentityType = 'SystemAssigned,UserAssigned'
// Ingress transport mode exposed by the Container App.
var containerAppIngressTransport = 'auto'
// Ingress target port exposed by the Container App.
var containerPort = 3000
// Container name inside the Container App template.
var containerAppContainerName = 'web'
// CPU allocation for the Container App workload.
var containerAppCpu = 1
// Memory allocation for the Container App workload.
var containerAppMemory = '2Gi'
// Health endpoint path reused by probes and Front Door.
var healthProbePath = '/health'
// Env var name for the Application Insights connection string.
var appInsightsConnectionStringEnvironmentVariableName = 'APPLICATIONINSIGHTS_CONNECTION_STRING'
// Env var name for the app name exposed to the container runtime.
var azureAppNameEnvironmentVariableName = 'AZURE_APP_NAME'
// Env var name for the App Configuration endpoint.
var azureAppConfigEndpointEnvironmentVariableName = 'AZURE_APPCONFIG_ENDPOINT'
// Env var name for the Key Vault URI.
var azureKeyVaultUriEnvironmentVariableName = 'AZURE_KEY_VAULT_URI'
// Env var name for the Azure tenant id exposed to the runtime.
var azureTenantIdEnvironmentVariableName = 'AZURE_TENANT_ID'
// Env var name for the user-assigned migration identity client id.
var azureSqlMigrationClientIdEnvironmentVariableName = 'AZURE_SQL_MIGRATION_CLIENT_ID'
// Env var name for the startup migration database URL.
var startupMigrationDatabaseUrlEnvironmentVariableName = 'STARTUP_MIGRATION_DATABASE_URL'
// Probe type label for startup health checks.
var startupProbeType = 'Startup'
// Probe type label for readiness health checks.
var readinessProbeType = 'Readiness'
// Probe type label for liveness health checks.
var livenessProbeType = 'Liveness'
// Default non-secret environment variables injected into the Container App.
var defaultContainerEnvironmentVariables = [
  {
    name: 'NODE_ENV'
    value: 'production'
  }
  {
    name: 'PORT'
    value: string(containerPort)
  }
]
// Minimum replica count for the Container App.
var containerAppScaleMinReplicas = 1
// Maximum replica count for the Container App.
var containerAppScaleMaxReplicas = 3

// Azure SQL hosting and private-connectivity contract constants.
// Database name used by the hosted Azure SQL deployment.
var sqlDatabaseName = 'arcade'
// Minimum TLS version enforced by the SQL server.
var sqlMinimalTlsVersion = '1.2'
// Azure SQL engine version for the logical server.
var sqlServerVersion = '12.0'
// Administrator type used for the SQL Entra admin contract.
var sqlAdministratorType = 'ActiveDirectory'
// Always enforce Entra-only authentication on the hosted Azure SQL server.
var sqlEnableEntraOnlyAuthentication = true
// Principal type used by the SQL bootstrap identity.
var applicationPrincipalType = 'Application'
// SKU name for the serverless SQL database.
var sqlDatabaseSkuName = 'GP_S_Gen5_1'
// SKU tier for the serverless SQL database.
var sqlDatabaseSkuTier = 'GeneralPurpose'
// Read scale mode for the serverless SQL database.
var sqlDatabaseReadScale = disabledState
// DefaultAzureCredential-based database URL injected for startup migrations.
var sqlStartupMigrationDatabaseUrl = 'sqlserver://${sqlServerFqdn};database=${sqlDatabaseName};authentication=DefaultAzureCredential;encrypt=true;trustServerCertificate=false'
// Private endpoint connection resource name for the SQL server.
var sqlPrivateEndpointConnectionName = '${sqlPrivateEndpointName}-connection'
// Private-link group ids used by the SQL private endpoint.
var sqlPrivateEndpointGroupIds = [
  'sqlServer'
]
// Private DNS zone group resource name attached to the SQL private endpoint.
var defaultPrivateDnsZoneGroupName = 'default'
// Private DNS zone config name recorded in the SQL zone group.
var sqlPrivateDnsZoneConfigName = 'sql'

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: resolvedLogAnalyticsWorkspaceName
  location: location
  properties: {
    sku: {
      name: logAnalyticsSkuName
    }
    retentionInDays: 30
  }
}

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: resolvedApplicationInsightsName
  location: location
  kind: applicationInsightsKind
  properties: {
    Application_Type: applicationInsightsType
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2024-05-01' = {
  name: resolvedVirtualNetworkName
  location: location
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
        name: containerAppsDelegationName
        properties: {
          serviceName: containerAppsDelegationServiceName
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
    privateEndpointNetworkPolicies: disabledState
  }
}

resource appConfiguration 'Microsoft.AppConfiguration/configurationStores@2024-05-01' = {
  name: resolvedAppConfigurationName
  location: location
  sku: {
    name: appConfigurationSkuName
  }
  properties: {
    disableLocalAuth: true
    publicNetworkAccess: enabledState
    softDeleteRetentionInDays: 7
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: resolvedKeyVaultName
  location: location
  properties: {
    tenantId: tenant().tenantId
    sku: {
      family: keyVaultSkuFamily
      name: keyVaultSkuName
    }
    enableRbacAuthorization: true
    enablePurgeProtection: true
    publicNetworkAccess: enabledState
    softDeleteRetentionInDays: 90
  }
}

resource sqlMigrationIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: resolvedSqlMigrationIdentityName
  location: location
}

resource sqlBootstrapIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: resolvedSqlBootstrapIdentityName
  location: location
}

resource managedEnvironment 'Microsoft.App/managedEnvironments@2025-10-02-preview' = {
  name: resolvedManagedEnvironmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: logAnalyticsDestination
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: logAnalyticsWorkspace.listKeys().primarySharedKey
      }
    }
    publicNetworkAccess: disabledState
    vnetConfiguration: {
      infrastructureSubnetId: containerAppsInfrastructureSubnet.id
      internal: false
    }
    workloadProfiles: [
      {
        name: managedEnvironmentWorkloadProfileName
        workloadProfileType: managedEnvironmentWorkloadProfileType
      }
    ]
  }
}

resource frontDoorProfile 'Microsoft.Cdn/profiles@2021-06-01' = {
  name: resolvedFrontDoorProfileName
  location: globalLocation
  sku: {
    name: frontDoorSkuName
  }
  properties: {
    originResponseTimeoutSeconds: 60
  }
}

resource frontDoorEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2021-06-01' = {
  parent: frontDoorProfile
  name: resolvedFrontDoorEndpointName
  location: globalLocation
  properties: {
    enabledState: enabledState
  }
}

resource frontDoorOriginGroup 'Microsoft.Cdn/profiles/originGroups@2021-06-01' = {
  parent: frontDoorProfile
  name: resolvedFrontDoorOriginGroupName
  properties: {
    healthProbeSettings: {
      probeIntervalInSeconds: 120
      probePath: healthProbePath
      probeProtocol: frontDoorProbeProtocol
      probeRequestType: frontDoorProbeRequestType
    }
    loadBalancingSettings: {
      additionalLatencyInMilliseconds: 0
      sampleSize: 4
      successfulSamplesRequired: 3
    }
    sessionAffinityState: disabledState
  }
}

resource frontDoorOrigin 'Microsoft.Cdn/profiles/originGroups/origins@2021-06-01' = {
  parent: frontDoorOriginGroup
  name: resolvedContainerAppName
  properties: {
    enabledState: enabledState
    enforceCertificateNameCheck: true
    hostName: containerApp.properties.configuration.ingress.fqdn
    httpPort: 80
    httpsPort: 443
    originHostHeader: containerApp.properties.configuration.ingress.fqdn
    priority: 1
    sharedPrivateLinkResource: {
      groupId: frontDoorOriginPrivateLinkGroupId
      privateLink: {
        id: managedEnvironment.id
      }
      privateLinkLocation: location
      requestMessage: frontDoorPrivateLinkRequestMessage
    }
    weight: 1000
  }
}

resource frontDoorAppRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2021-06-01' = {
  parent: frontDoorEndpoint
  name: frontDoorAppRouteName
  properties: {
    enabledState: enabledState
    forwardingProtocol: frontDoorForwardingProtocol
    httpsRedirect: enabledState
    linkToDefaultDomain: enabledState
    originGroup: {
      id: frontDoorOriginGroup.id
    }
    patternsToMatch: frontDoorAppPatternsToMatch
    supportedProtocols: frontDoorSupportedProtocols
  }
  dependsOn: [
    frontDoorOrigin
  ]
}

resource frontDoorAssetRoute 'Microsoft.Cdn/profiles/afdEndpoints/routes@2021-06-01' = {
  parent: frontDoorEndpoint
  name: frontDoorAssetRouteName
  properties: {
    cacheConfiguration: {
      compressionSettings: {
        contentTypesToCompress: frontDoorAssetCacheContentTypes
        isCompressionEnabled: true
      }
      queryStringCachingBehavior: frontDoorQueryStringCachingBehavior
    }
    enabledState: enabledState
    forwardingProtocol: frontDoorForwardingProtocol
    httpsRedirect: enabledState
    linkToDefaultDomain: enabledState
    originGroup: {
      id: frontDoorOriginGroup.id
    }
    patternsToMatch: frontDoorAssetPatternsToMatch
    supportedProtocols: frontDoorSupportedProtocols
  }
  dependsOn: [
    frontDoorOrigin
  ]
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: resolvedContainerAppName
  location: location
  identity: {
    type: containerAppIdentityType
    userAssignedIdentities: {
      '${sqlMigrationIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: managedEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: containerPort
        transport: containerAppIngressTransport
      }
    }
    template: {
      containers: [
        {
          name: containerAppContainerName
          image: containerImage
          env: concat(
            [
              {
                name: appInsightsConnectionStringEnvironmentVariableName
                value: applicationInsights.properties.ConnectionString
              }
              {
                name: azureAppNameEnvironmentVariableName
                value: appName
              }
              {
                name: azureAppConfigEndpointEnvironmentVariableName
                value: appConfiguration.properties.endpoint
              }
              {
                name: azureKeyVaultUriEnvironmentVariableName
                value: keyVault.properties.vaultUri
              }
              {
                name: azureTenantIdEnvironmentVariableName
                value: entraTenantId
              }
              {
                name: azureSqlMigrationClientIdEnvironmentVariableName
                value: sqlMigrationIdentity.properties.clientId
              }
              {
                name: startupMigrationDatabaseUrlEnvironmentVariableName
                value: sqlStartupMigrationDatabaseUrl
              }
            ],
            defaultContainerEnvironmentVariables
          )
          probes: [
            {
              type: startupProbeType
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
              type: readinessProbeType
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
              type: livenessProbeType
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
            cpu: containerAppCpu
            memory: containerAppMemory
          }
        }
      ]
      scale: {
        minReplicas: containerAppScaleMinReplicas
        maxReplicas: containerAppScaleMaxReplicas
      }
    }
  }
}

resource existingSqlServer 'Microsoft.Sql/servers@2021-11-01-preview' existing = if (!empty(existingSqlServerName)) {
  name: existingSqlServerName
}

resource sqlServer 'Microsoft.Sql/servers@2021-11-01-preview' = if (empty(existingSqlServerName)) {
  name: resolvedSqlServerName
  location: location
  properties: union(
    union(
      {
        minimalTlsVersion: sqlMinimalTlsVersion
        publicNetworkAccess: disabledState
        version: sqlServerVersion
        administrators: {
          administratorType: sqlAdministratorType
          azureADOnlyAuthentication: sqlEnableEntraOnlyAuthentication
          login: sqlBootstrapIdentity.name
          principalType: applicationPrincipalType
          sid: sqlBootstrapIdentity.properties.principalId
          tenantId: tenant().tenantId
        }
      },
      empty(sqlAdministratorLogin)
        ? {}
        : {
            administratorLogin: sqlAdministratorLogin
          }
    ),
    empty(sqlAdministratorPassword)
      ? {}
      : {
          administratorLoginPassword: sqlAdministratorPassword
        }
  )
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2021-11-01-preview' = {
  name: '${resolvedSqlServerName}/${sqlDatabaseName}'
  location: location
  sku: {
    name: sqlDatabaseSkuName
    tier: sqlDatabaseSkuTier
    capacity: 1
  }
  properties: {
    autoPauseDelay: 60
    minCapacity: 1
    readScale: sqlDatabaseReadScale
  }
}

resource sqlPrivateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: sqlPrivateDnsZoneName
  location: globalLocation
  properties: {}
}

resource sqlPrivateDnsZoneVirtualNetworkLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  parent: sqlPrivateDnsZone
  name: sqlPrivateDnsZoneVirtualNetworkLinkName
  location: globalLocation
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: virtualNetwork.id
    }
  }
}

resource sqlPrivateEndpoint 'Microsoft.Network/privateEndpoints@2024-05-01' = {
  name: sqlPrivateEndpointName
  location: location
  properties: {
    subnet: {
      id: privateEndpointSubnet.id
    }
    privateLinkServiceConnections: [
      {
        name: sqlPrivateEndpointConnectionName
        properties: {
          privateLinkServiceId: empty(existingSqlServerName) ? sqlServer.id : existingSqlServer.id
          groupIds: sqlPrivateEndpointGroupIds
        }
      }
    ]
  }
}

resource sqlPrivateEndpointDnsZoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-05-01' = {
  parent: sqlPrivateEndpoint
  name: defaultPrivateDnsZoneGroupName
  properties: {
    privateDnsZoneConfigs: [
      {
        name: sqlPrivateDnsZoneConfigName
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
    principalType: roleAssignmentPrincipalType
    roleDefinitionId: appConfigDataReaderRoleDefinitionId
  }
}

resource keyVaultSecretsUserAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (manageRuntimeRoleAssignments) {
  name: guid(keyVault.id, containerApp.name, keyVaultSecretsUserRoleDefinitionId)
  scope: keyVault
  properties: {
    principalId: containerApp.identity.principalId
    principalType: roleAssignmentPrincipalType
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
output frontDoorProfileName string = frontDoorProfile.name
output frontDoorEndpointHostName string = frontDoorEndpoint.properties.hostName
output privateEndpointSubnetId string = privateEndpointSubnet.id
output sqlServerName string = resolvedSqlServerName
output sqlServerFullyQualifiedDomainName string = sqlServerFqdn
output sqlDatabaseName string = sqlDatabaseName
output sqlRuntimeIdentityPrincipalId string = containerApp.identity.principalId
output sqlMigrationIdentityPrincipalId string = sqlMigrationIdentity.properties.principalId
output sqlMigrationIdentityClientId string = sqlMigrationIdentity.properties.clientId
output sqlBootstrapIdentityPrincipalId string = sqlBootstrapIdentity.properties.principalId
output sqlBootstrapIdentityClientId string = sqlBootstrapIdentity.properties.clientId
