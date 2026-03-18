#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/environment-resource-names.sh"

fail() {
  echo "$*" >&2
  exit 1
}

append_output() {
  local key="$1"
  local value="$2"

  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    printf '%s=%s\n' "$key" "$value" >>"$GITHUB_OUTPUT"
  else
    printf '%s=%s\n' "$key" "$value"
  fi
}

to_lower() {
  printf '%s' "$1" | tr '[:upper:]' '[:lower:]'
}

require_env() {
  local name="$1"
  [[ -n "${!name:-}" ]] || fail "Missing required environment variable ${name}."
}

wait_for_active_resource() {
  local resource_type="$1"
  local resource_name="$2"
  local label="$3"

  for _ in $(seq 1 30); do
    if az resource show \
      --resource-group "$AZURE_RESOURCE_GROUP" \
      --resource-type "$resource_type" \
      --name "$resource_name" \
      --output none >/dev/null 2>&1; then
      return 0
    fi

    sleep 10
  done

  fail "${label} ${resource_name} did not become active in ${AZURE_RESOURCE_GROUP}."
}

maybe_recover_app_configuration() {
  local store_name="$1"
  local deleted_location=""

  deleted_location="$(
    az appconfig list-deleted \
      --query "[?name=='${store_name}'] | [0].location" \
      --output tsv
  )"

  if [[ -z "$deleted_location" ]]; then
    return 1
  fi

  echo "Recovering deleted App Configuration ${store_name} in ${deleted_location}."
  az appconfig recover \
    --name "$store_name" \
    --location "$deleted_location" \
    --yes \
    --output none

  wait_for_active_resource 'Microsoft.AppConfiguration/configurationStores' "$store_name" 'App Configuration store'
}

maybe_recover_key_vault() {
  local vault_name="$1"
  local deleted_location=""

  deleted_location="$(
    az keyvault list-deleted \
      --query "[?name=='${vault_name}'] | [0].properties.location" \
      --output tsv
  )"

  if [[ -z "$deleted_location" ]]; then
    return 1
  fi

  echo "Recovering deleted Key Vault ${vault_name} in ${deleted_location}."
  az keyvault recover \
    --name "$vault_name" \
    --location "$deleted_location" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --output none

  wait_for_active_resource 'Microsoft.KeyVault/vaults' "$vault_name" 'Key Vault'
}

resolve_app_configuration_name() {
  local active_name=""
  local configured_name=""
  local normalized_suffix=""

  active_name="$(resolve_existing_resource_name_by_type 'Microsoft.AppConfiguration/configurationStores' 'App Configuration store')"
  if [[ -n "$active_name" ]]; then
    append_output "app_configuration_name" "$active_name"
    append_output "app_configuration_resolution" "active"
    return 0
  fi

  normalized_suffix="$(to_lower "${AZURE_GLOBAL_NAME_SUFFIX:-}")"
  if [[ -z "$normalized_suffix" ]]; then
    append_output "app_configuration_name" ""
    append_output "app_configuration_resolution" "generated"
    return 0
  fi

  configured_name="appcs-${AZURE_SCOPED_APP_NAME}-${normalized_suffix}"
  if [[ "${AZURE_RECOVER_GLOBAL_RESOURCES:-false}" == "true" ]]; then
    if maybe_recover_app_configuration "$configured_name"; then
      append_output "app_configuration_name" "$configured_name"
      append_output "app_configuration_resolution" "recovered"
      return 0
    fi
  fi

  append_output "app_configuration_name" "$configured_name"
  append_output "app_configuration_resolution" "configured"
}

resolve_key_vault_name() {
  local active_name=""
  local configured_name=""
  local normalized_suffix=""

  active_name="$(resolve_existing_resource_name_by_type 'Microsoft.KeyVault/vaults' 'Key Vault')"
  if [[ -n "$active_name" ]]; then
    append_output "key_vault_name" "$active_name"
    append_output "key_vault_resolution" "active"
    return 0
  fi

  normalized_suffix="$(to_lower "${AZURE_GLOBAL_NAME_SUFFIX:-}")"
  if [[ -z "$normalized_suffix" ]]; then
    append_output "key_vault_name" ""
    append_output "key_vault_resolution" "generated"
    return 0
  fi

  configured_name="kv${AZURE_SCOPED_APP_NAME_COMPACT}${normalized_suffix//-/}"
  configured_name="${configured_name:0:24}"

  if [[ "${AZURE_RECOVER_GLOBAL_RESOURCES:-false}" == "true" ]]; then
    if maybe_recover_key_vault "$configured_name"; then
      append_output "key_vault_name" "$configured_name"
      append_output "key_vault_resolution" "recovered"
      return 0
    fi
  fi

  append_output "key_vault_name" "$configured_name"
  append_output "key_vault_resolution" "configured"
}

resolve_existing_sql_server_name() {
  local active_name=""

  active_name="$(resolve_existing_resource_name_by_type 'Microsoft.Sql/servers' 'Azure SQL server')"
  append_output "existing_sql_server_name" "$active_name"
  if [[ -n "$active_name" ]]; then
    append_output "sql_server_resolution" "active"
  else
    append_output "sql_server_resolution" "new"
  fi
}

resolve_named_resource() {
  local output_key="$1"
  local resolution_key="$2"
  local resource_type="$3"
  local label="$4"
  shift 4

  local resolved_name=""
  local active_name=""
  resolved_name="$(resolve_target_resource_name_by_type "$resource_type" "$label" "$@")"
  active_name="$(resolve_existing_resource_name_by_type "$resource_type" "$label" "$@")"
  append_output "$output_key" "$resolved_name"

  if [[ -n "$active_name" && "$resolved_name" == "$active_name" ]]; then
    append_output "$resolution_key" "active"
  else
    append_output "$resolution_key" "default"
  fi
}

require_env "AZURE_APP_NAME"
require_env "AZURE_RESOURCE_GROUP"
derive_environment_names

resolve_named_resource \
  "log_analytics_workspace_name" \
  "log_analytics_workspace_resolution" \
  "Microsoft.OperationalInsights/workspaces" \
  "Log Analytics workspace" \
  "$AZURE_EXPECTED_LOG_ANALYTICS_WORKSPACE_NAME" \
  "$AZURE_LEGACY_LOG_ANALYTICS_WORKSPACE_NAME"

resolve_named_resource \
  "application_insights_name" \
  "application_insights_resolution" \
  "Microsoft.Insights/components" \
  "Application Insights component" \
  "$AZURE_EXPECTED_APPLICATION_INSIGHTS_NAME" \
  "$AZURE_LEGACY_APPLICATION_INSIGHTS_NAME"

resolve_named_resource \
  "virtual_network_name" \
  "virtual_network_resolution" \
  "Microsoft.Network/virtualNetworks" \
  "virtual network" \
  "$AZURE_EXPECTED_VIRTUAL_NETWORK_NAME" \
  "$AZURE_LEGACY_VIRTUAL_NETWORK_NAME"

resolve_named_resource \
  "managed_environment_name" \
  "managed_environment_resolution" \
  "Microsoft.App/managedEnvironments" \
  "Container Apps environment" \
  "$AZURE_EXPECTED_MANAGED_ENVIRONMENT_NAME" \
  "$AZURE_LEGACY_MANAGED_ENVIRONMENT_NAME"

resolve_named_resource \
  "container_app_name" \
  "container_app_resolution" \
  "Microsoft.App/containerApps" \
  "Container App" \
  "$AZURE_EXPECTED_CONTAINER_APP_NAME" \
  "$AZURE_LEGACY_CONTAINER_APP_NAME"

resolve_named_resource \
  "sql_migration_identity_name" \
  "sql_migration_identity_resolution" \
  "Microsoft.ManagedIdentity/userAssignedIdentities" \
  "SQL migration identity" \
  "$AZURE_EXPECTED_SQL_MIGRATION_IDENTITY_NAME" \
  "$AZURE_LEGACY_SQL_MIGRATION_IDENTITY_NAME"

resolve_named_resource \
  "sql_bootstrap_identity_name" \
  "sql_bootstrap_identity_resolution" \
  "Microsoft.ManagedIdentity/userAssignedIdentities" \
  "SQL bootstrap identity" \
  "$AZURE_EXPECTED_SQL_BOOTSTRAP_IDENTITY_NAME" \
  "$AZURE_LEGACY_SQL_BOOTSTRAP_IDENTITY_NAME"

resolve_named_resource \
  "front_door_profile_name" \
  "front_door_profile_resolution" \
  "Microsoft.Cdn/profiles" \
  "Azure Front Door profile" \
  "$AZURE_EXPECTED_FRONT_DOOR_PROFILE_NAME" \
  "$AZURE_LEGACY_FRONT_DOOR_PROFILE_NAME"

resolve_named_resource \
  "front_door_origin_group_name" \
  "front_door_origin_group_resolution" \
  "Microsoft.Cdn/profiles/originGroups" \
  "Azure Front Door origin group" \
  "$AZURE_EXPECTED_FRONT_DOOR_ORIGIN_GROUP_NAME" \
  "$AZURE_LEGACY_FRONT_DOOR_ORIGIN_GROUP_NAME"

append_output \
  "front_door_endpoint_name" \
  "$(resolve_existing_resource_name_by_type 'Microsoft.Cdn/profiles/afdEndpoints' 'Azure Front Door endpoint')"

resolve_app_configuration_name
resolve_key_vault_name
resolve_existing_sql_server_name
