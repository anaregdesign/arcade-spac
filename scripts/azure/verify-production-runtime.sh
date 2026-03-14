#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${AZURE_RESOURCE_GROUP:-}" ]]; then
  echo "AZURE_RESOURCE_GROUP is required."
  exit 1
fi

SQL_PRIVATE_DNS_ZONE_NAME="${SQL_PRIVATE_DNS_ZONE_NAME:-privatelink.database.windows.net}"
APP_CONFIGURATION_PRIVATE_DNS_ZONE_NAME="${APP_CONFIGURATION_PRIVATE_DNS_ZONE_NAME:-privatelink.azconfig.io}"
KEY_VAULT_PRIVATE_DNS_ZONE_NAME="${KEY_VAULT_PRIVATE_DNS_ZONE_NAME:-privatelink.vaultcore.azure.net}"
EXPECTED_SQL_PUBLIC_NETWORK_ACCESS="${EXPECTED_SQL_PUBLIC_NETWORK_ACCESS:-Disabled}"
EXPECTED_PRIVATE_CONFIG_STORES="${EXPECTED_PRIVATE_CONFIG_STORES:-true}"

require_single_resource_name() {
  local resource_type="$1"
  local label="$2"
  local -a names=()

  while IFS= read -r resource_name; do
    [[ -n "${resource_name}" ]] && names+=("${resource_name}")
  done < <(az resource list \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --resource-type "${resource_type}" \
    --query '[].name' \
    -o tsv)

  if [[ "${#names[@]}" -ne 1 ]]; then
    echo "Expected exactly one ${label} in ${AZURE_RESOURCE_GROUP}, found ${#names[@]}."
    exit 1
  fi

  printf '%s\n' "${names[0]}"
}

resolve_app_url() {
  if [[ -n "${APP_URL:-}" ]]; then
    printf '%s\n' "${APP_URL}"
    return
  fi

  if [[ -z "${AZURE_CONTAINER_APP_NAME:-}" ]]; then
    echo "APP_URL or AZURE_CONTAINER_APP_NAME is required."
    exit 1
  fi

  local container_app_fqdn
  container_app_fqdn="$(az containerapp show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${AZURE_CONTAINER_APP_NAME}" \
    --query properties.configuration.ingress.fqdn \
    -o tsv)"

  if [[ -z "${container_app_fqdn}" ]]; then
    echo "Unable to resolve the Container App FQDN."
    exit 1
  fi

  printf 'https://%s\n' "${container_app_fqdn}"
}

assert_resource_public_network_access() {
  local resource_type="$1"
  local resource_name="$2"
  local expected="$3"
  local label="$4"
  local actual

  actual="$(az resource show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --resource-type "${resource_type}" \
    --name "${resource_name}" \
    --query properties.publicNetworkAccess \
    -o tsv)"

  if [[ "${actual}" != "${expected}" ]]; then
    echo "${label} ${resource_name} publicNetworkAccess is ${actual}, expected ${expected}."
    exit 1
  fi

  echo "Verified ${label} ${resource_name} publicNetworkAccess=${actual}."
}

assert_private_dns_zone_linked_to_vnet() {
  local zone_name="$1"
  local vnet_id="$2"
  local link_name

  link_name="$(az network private-dns link vnet list \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --zone-name "${zone_name}" \
    --query "[?virtualNetwork.id=='${vnet_id}'].name | [0]" \
    -o tsv)"

  if [[ -z "${link_name}" ]]; then
    echo "Private DNS zone ${zone_name} is not linked to the Container Apps virtual network ${vnet_id}."
    exit 1
  fi

  echo "Verified private DNS zone ${zone_name} is linked to the Container Apps virtual network."
}

assert_private_dns_a_record() {
  local zone_name="$1"
  local record_name="$2"
  local record_ip

  record_ip="$(az network private-dns record-set a list \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --zone-name "${zone_name}" \
    --query "[?name=='${record_name}'].aRecords[0].ipv4Address | [0]" \
    -o tsv)"

  if [[ -z "${record_ip}" ]]; then
    echo "Private DNS zone ${zone_name} does not have an A record for ${record_name}."
    exit 1
  fi

  echo "Verified private DNS record ${record_name}.${zone_name} -> ${record_ip}."
}

assert_private_endpoint_for_resource() {
  local resource_fragment="$1"
  local label="$2"
  local zone_name="$3"
  local record_name="$4"
  local private_endpoint_name

  private_endpoint_name="$(az network private-endpoint list \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --query "[?privateLinkServiceConnections[0].privateLinkServiceId != null && contains(privateLinkServiceConnections[0].privateLinkServiceId, '${resource_fragment}')].name | [0]" \
    -o tsv)"

  if [[ -z "${private_endpoint_name}" ]]; then
    echo "Missing ${label} private endpoint for ${resource_fragment}."
    exit 1
  fi

  echo "Verified ${label} private endpoint ${private_endpoint_name}."
  assert_private_dns_a_record "${zone_name}" "${record_name}"
}

assert_container_app_env_value() {
  local container_app_name="$1"
  local env_name="$2"
  local expected_value="$3"
  local actual_value

  actual_value="$(az containerapp show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${container_app_name}" \
    --query "properties.template.containers[0].env[?name=='${env_name}'].value | [0]" \
    -o tsv)"

  if [[ -z "${actual_value}" ]]; then
    echo "Container App ${container_app_name} is missing env value ${env_name}."
    exit 1
  fi

  if [[ "${actual_value}" != "${expected_value}" ]]; then
    echo "Container App ${container_app_name} env ${env_name} is ${actual_value}, expected ${expected_value}."
    exit 1
  fi

  echo "Verified Container App ${container_app_name} env ${env_name}=${actual_value}."
}

assert_role_assignment_for_principal() {
  local scope_id="$1"
  local principal_id="$2"
  local role_name="$3"
  local label="$4"
  local assignment_id

  assignment_id="$(az role assignment list \
    --scope "${scope_id}" \
    --assignee-object-id "${principal_id}" \
    --query "[?roleDefinitionName=='${role_name}'].id | [0]" \
    -o tsv)"

  if [[ -z "${assignment_id}" ]]; then
    echo "${label} is missing role ${role_name} for principal ${principal_id}."
    exit 1
  fi

  echo "Verified ${label} role ${role_name} for principal ${principal_id}."
}

APP_URL="$(resolve_app_url)"
sql_server_name="${AZURE_SQL_SERVER_NAME:-$(require_single_resource_name 'Microsoft.Sql/servers' 'Azure SQL server')}"

actual_public_network_access="$(az sql server show \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${sql_server_name}" \
  --query publicNetworkAccess \
  -o tsv)"

if [[ "${actual_public_network_access}" != "${EXPECTED_SQL_PUBLIC_NETWORK_ACCESS}" ]]; then
  echo "Azure SQL server ${sql_server_name} publicNetworkAccess is ${actual_public_network_access}, expected ${EXPECTED_SQL_PUBLIC_NETWORK_ACCESS}."
  exit 1
fi

echo "Verified Azure SQL server ${sql_server_name} publicNetworkAccess=${actual_public_network_access}."

allow_azure_services_rule="$(az sql server firewall-rule show \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --server "${sql_server_name}" \
  --name AllowAzureServices \
  --query name \
  -o tsv 2>/dev/null || true)"

if [[ -n "${allow_azure_services_rule}" ]]; then
  echo "Azure SQL server ${sql_server_name} still has the AllowAzureServices firewall rule."
  exit 1
fi

echo "Verified Azure SQL server ${sql_server_name} is not using the AllowAzureServices firewall rule."

sql_entra_only="$(az sql server ad-only-auth get \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${sql_server_name}" \
  --query azureADOnlyAuthentication \
  -o tsv 2>/dev/null || true)"

if [[ -z "${sql_entra_only}" ]]; then
  sql_entra_only="$(az sql server ad-only-auth get \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${sql_server_name}" \
    --query azureAdOnlyAuthentication \
    -o tsv)"
fi

if [[ "${sql_entra_only}" != "true" ]]; then
  echo "Azure SQL server ${sql_server_name} is not configured for Entra-only authentication."
  exit 1
fi

echo "Verified Azure SQL server ${sql_server_name} uses Entra-only authentication."

sql_entra_admin_login="$(az sql server ad-admin list \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --server "${sql_server_name}" \
  --query "[0].login" \
  -o tsv)"

if [[ -z "${sql_entra_admin_login}" ]]; then
  echo "Azure SQL server ${sql_server_name} does not have an Entra administrator configured."
  exit 1
fi

echo "Verified Azure SQL Entra administrator ${sql_entra_admin_login}."

managed_environment_name=''
container_apps_vnet_id=''
container_app_principal_id=''

if [[ -n "${AZURE_CONTAINER_APP_NAME:-}" ]]; then
  container_app_status="$(az containerapp show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${AZURE_CONTAINER_APP_NAME}" \
    --query properties.runningStatus \
    -o tsv)"

  if [[ "${container_app_status}" != "Running" ]]; then
    echo "Container App ${AZURE_CONTAINER_APP_NAME} is ${container_app_status}."
    exit 1
  fi

  echo "Verified Container App ${AZURE_CONTAINER_APP_NAME} is running."

  managed_environment_id="$(az containerapp show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${AZURE_CONTAINER_APP_NAME}" \
    --query properties.managedEnvironmentId \
    -o tsv)"
  managed_environment_name="${managed_environment_id##*/}"
  container_app_principal_id="$(az containerapp show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${AZURE_CONTAINER_APP_NAME}" \
    --query identity.principalId \
    -o tsv)"

  infrastructure_subnet_id="$(az containerapp env show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${managed_environment_name}" \
    --query properties.vnetConfiguration.infrastructureSubnetId \
    -o tsv)"

  if [[ -z "${infrastructure_subnet_id}" ]]; then
    echo "Container Apps environment ${managed_environment_name} is not integrated with a delegated infrastructure subnet."
    exit 1
  fi

  container_apps_vnet_id="${infrastructure_subnet_id%/subnets/*}"
  echo "Verified Container Apps environment ${managed_environment_name} uses delegated subnet ${infrastructure_subnet_id}."
fi

if [[ -n "${container_apps_vnet_id}" ]]; then
  assert_private_dns_zone_linked_to_vnet "${SQL_PRIVATE_DNS_ZONE_NAME}" "${container_apps_vnet_id}"
fi

assert_private_endpoint_for_resource \
  "/providers/Microsoft.Sql/servers/${sql_server_name}" \
  "Azure SQL" \
  "${SQL_PRIVATE_DNS_ZONE_NAME}" \
  "${sql_server_name}"

if [[ "${EXPECTED_PRIVATE_CONFIG_STORES}" == "true" ]]; then
  app_configuration_name="$(require_single_resource_name 'Microsoft.AppConfiguration/configurationStores' 'App Configuration store')"
  key_vault_name="$(require_single_resource_name 'Microsoft.KeyVault/vaults' 'Key Vault')"
  app_configuration_id="$(az resource show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --resource-type 'Microsoft.AppConfiguration/configurationStores' \
    --name "${app_configuration_name}" \
    --query id \
    -o tsv)"
  key_vault_id="$(az resource show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --resource-type 'Microsoft.KeyVault/vaults' \
    --name "${key_vault_name}" \
    --query id \
    -o tsv)"
  app_configuration_endpoint="$(az resource show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --resource-type 'Microsoft.AppConfiguration/configurationStores' \
    --name "${app_configuration_name}" \
    --query properties.endpoint \
    -o tsv)"
  key_vault_uri="$(az resource show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --resource-type 'Microsoft.KeyVault/vaults' \
    --name "${key_vault_name}" \
    --query properties.vaultUri \
    -o tsv)"

  assert_resource_public_network_access 'Microsoft.AppConfiguration/configurationStores' "${app_configuration_name}" 'Disabled' 'App Configuration'
  assert_resource_public_network_access 'Microsoft.KeyVault/vaults' "${key_vault_name}" 'Disabled' 'Key Vault'

  if [[ -n "${container_apps_vnet_id}" ]]; then
    assert_private_dns_zone_linked_to_vnet "${APP_CONFIGURATION_PRIVATE_DNS_ZONE_NAME}" "${container_apps_vnet_id}"
    assert_private_dns_zone_linked_to_vnet "${KEY_VAULT_PRIVATE_DNS_ZONE_NAME}" "${container_apps_vnet_id}"
  fi

  assert_private_endpoint_for_resource \
    "/providers/Microsoft.AppConfiguration/configurationStores/${app_configuration_name}" \
    "App Configuration" \
    "${APP_CONFIGURATION_PRIVATE_DNS_ZONE_NAME}" \
    "${app_configuration_name}"

  assert_private_endpoint_for_resource \
    "/providers/Microsoft.KeyVault/vaults/${key_vault_name}" \
    "Key Vault" \
    "${KEY_VAULT_PRIVATE_DNS_ZONE_NAME}" \
    "${key_vault_name}"

  if [[ -n "${AZURE_CONTAINER_APP_NAME:-}" ]]; then
    assert_container_app_env_value "${AZURE_CONTAINER_APP_NAME}" 'AZURE_CONTAINER_APP_NAME' "${AZURE_CONTAINER_APP_NAME}"
    assert_container_app_env_value "${AZURE_CONTAINER_APP_NAME}" 'AZURE_APPCONFIG_ENDPOINT' "${app_configuration_endpoint}"
    assert_container_app_env_value "${AZURE_CONTAINER_APP_NAME}" 'AZURE_KEY_VAULT_URI' "${key_vault_uri}"
  fi

  if [[ -n "${container_app_principal_id}" ]]; then
    assert_role_assignment_for_principal "${app_configuration_id}" "${container_app_principal_id}" 'App Configuration Data Reader' 'App Configuration access'
    assert_role_assignment_for_principal "${key_vault_id}" "${container_app_principal_id}" 'Key Vault Secrets User' 'Key Vault access'
  fi
fi

echo "Verified private Azure runtime contract for ${sql_server_name}."
APP_URL="${APP_URL}" ./scripts/azure/smoke-test.sh
