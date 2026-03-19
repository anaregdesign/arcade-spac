#!/usr/bin/env bash
set -euo pipefail

append_parameter() {
  local output_name="$1"
  local value="${2:-}"

  if [[ -n "$value" ]]; then
    printf '%s=%s\n' "$output_name" "$value"
  fi
}

append_parameter "resourceNameSuffix" "${RESOURCE_NAME_SUFFIX:-}"
append_parameter "logAnalyticsWorkspaceResourceName" "${LOG_ANALYTICS_WORKSPACE_NAME:-}"
append_parameter "applicationInsightsResourceName" "${APPLICATION_INSIGHTS_NAME:-}"
append_parameter "virtualNetworkResourceName" "${VIRTUAL_NETWORK_NAME:-}"
append_parameter "managedEnvironmentResourceName" "${MANAGED_ENVIRONMENT_NAME:-}"
append_parameter "containerAppResourceName" "${CONTAINER_APP_NAME:-}"
append_parameter "sqlRuntimeIdentityResourceName" "${SQL_RUNTIME_IDENTITY_NAME:-}"
append_parameter "sqlMigrationIdentityResourceName" "${SQL_MIGRATION_IDENTITY_NAME:-}"
append_parameter "sqlBootstrapIdentityResourceName" "${SQL_BOOTSTRAP_IDENTITY_NAME:-}"
append_parameter "frontDoorProfileResourceName" "${FRONT_DOOR_PROFILE_NAME:-}"
append_parameter "frontDoorEndpointResourceName" "${FRONT_DOOR_ENDPOINT_NAME:-}"
append_parameter "frontDoorOriginGroupResourceName" "${FRONT_DOOR_ORIGIN_GROUP_NAME:-}"
append_parameter "appConfigurationName" "${APP_CONFIGURATION_NAME:-}"
append_parameter "keyVaultName" "${KEY_VAULT_NAME:-}"
append_parameter "existingSqlServerName" "${EXISTING_SQL_SERVER_NAME:-}"
