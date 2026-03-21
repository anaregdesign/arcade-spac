#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/environment-resource-names.sh"

if [[ -z "${AZURE_RESOURCE_GROUP:-}" ]]; then
  echo "AZURE_RESOURCE_GROUP is required."
  exit 1
fi

if [[ -z "${AZURE_APP_NAME:-}" ]]; then
  echo "AZURE_APP_NAME is required."
  exit 1
fi

derive_environment_names

SQL_PRIVATE_DNS_ZONE_NAME="${SQL_PRIVATE_DNS_ZONE_NAME:-privatelink.database.windows.net}"
APP_CONFIGURATION_PRIVATE_DNS_ZONE_NAME="${APP_CONFIGURATION_PRIVATE_DNS_ZONE_NAME:-privatelink.azconfig.io}"
KEY_VAULT_PRIVATE_DNS_ZONE_NAME="${KEY_VAULT_PRIVATE_DNS_ZONE_NAME:-privatelink.vaultcore.azure.net}"
EXPECTED_SQL_PUBLIC_NETWORK_ACCESS="${EXPECTED_SQL_PUBLIC_NETWORK_ACCESS:-Disabled}"
EXPECTED_PRIVATE_CONFIG_STORES="${EXPECTED_PRIVATE_CONFIG_STORES:-false}"
EXPECTED_APPCONFIG_PUBLIC_NETWORK_ACCESS="${EXPECTED_APPCONFIG_PUBLIC_NETWORK_ACCESS:-Enabled}"
EXPECTED_KEY_VAULT_PUBLIC_NETWORK_ACCESS="${EXPECTED_KEY_VAULT_PUBLIC_NETWORK_ACCESS:-Enabled}"
EXPECTED_FRONT_DOOR_SKU="${EXPECTED_FRONT_DOOR_SKU:-Premium_AzureFrontDoor}"
EXPECTED_MANAGED_ENVIRONMENT_PUBLIC_NETWORK_ACCESS="${EXPECTED_MANAGED_ENVIRONMENT_PUBLIC_NETWORK_ACCESS:-Disabled}"
VERIFY_AUTH_RETRIES="${VERIFY_AUTH_RETRIES:-6}"
VERIFY_AUTH_DELAY_SECONDS="${VERIFY_AUTH_DELAY_SECONDS:-10}"
LAST_AUTH_FAILURE_DETAILS=""

preview_file() {
  local file_path="$1"
  local file_size
  local preview_limit=600

  if [[ -s "${file_path}" ]]; then
    file_size="$(wc -c < "${file_path}" | tr -d ' ')"
    head -c "${preview_limit}" "${file_path}"

    if [[ "${file_size}" -gt "${preview_limit}" ]]; then
      printf '\n<truncated>'
    else
      printf '\n'
    fi

    return
  fi

  echo "<empty>"
}

record_auth_failure_details() {
  LAST_AUTH_FAILURE_DETAILS="$1"
}

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

require_single_resource_id() {
  local resource_type="$1"
  local label="$2"
  local -a ids=()

  while IFS= read -r resource_id; do
    [[ -n "${resource_id}" ]] && ids+=("${resource_id}")
  done < <(az resource list \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --resource-type "${resource_type}" \
    --query '[].id' \
    -o tsv)

  if [[ "${#ids[@]}" -ne 1 ]]; then
    echo "Expected exactly one ${label} in ${AZURE_RESOURCE_GROUP}, found ${#ids[@]}."
    exit 1
  fi

  printf '%s\n' "${ids[0]}"
}

resolve_app_url() {
  if [[ -n "${APP_URL:-}" ]]; then
    printf '%s\n' "${APP_URL}"
    return
  fi

  local front_door_endpoint_id
  local front_door_host

  front_door_endpoint_id="$(require_single_resource_id 'Microsoft.Cdn/profiles/afdEndpoints' 'Azure Front Door endpoint')"
  front_door_host="$(az resource show \
    --ids "${front_door_endpoint_id}" \
    --query properties.hostName \
    -o tsv)"

  if [[ -z "${front_door_host}" ]]; then
    echo "Unable to resolve the Azure Front Door endpoint host name."
    exit 1
  fi

  printf 'https://%s\n' "${front_door_host}"
}

print_container_app_diagnostics() {
  if [[ -z "${container_app_name:-}" ]]; then
    return 0
  fi

  echo "Container App diagnostics for ${container_app_name}:"

  local latest_revision_name

  az containerapp show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${container_app_name}" \
    --query '{runningStatus:properties.runningStatus,latestRevisionName:properties.latestRevisionName,latestReadyRevisionName:properties.latestReadyRevisionName}' \
    -o json || true

  az containerapp revision list \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${container_app_name}" \
    --all \
    -o json || true

  latest_revision_name="$(az containerapp show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${container_app_name}" \
    --query 'properties.latestRevisionName' \
    -o tsv 2>/dev/null || true)"

  if [[ -n "${latest_revision_name}" ]]; then
    az containerapp replica list \
      --resource-group "${AZURE_RESOURCE_GROUP}" \
      --name "${container_app_name}" \
      --revision "${latest_revision_name}" \
      -o json || true

    az containerapp logs show \
      --resource-group "${AZURE_RESOURCE_GROUP}" \
      --name "${container_app_name}" \
      --type system \
      --tail 100 \
      --format text || true

    az containerapp logs show \
      --resource-group "${AZURE_RESOURCE_GROUP}" \
      --name "${container_app_name}" \
      --revision "${latest_revision_name}" \
      --tail 100 \
      --format text || true

    return 0
  fi

  az containerapp logs show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${container_app_name}" \
    --type system \
    --tail 100 \
    --format text || true

  az containerapp logs show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${container_app_name}" \
    --tail 100 \
    --format text || true
}

on_verify_exit() {
  local exit_code="$?"

  if [[ "${exit_code}" -ne 0 ]]; then
    print_container_app_diagnostics
  fi

  exit "${exit_code}"
}

check_auth_redirect_uses_public_app_url() {
  local app_url="$1"
  local expected_redirect_uri="${app_url%/}/auth/callback"
  local headers_file
  local location_header
  local redirect_uri
  local status

  headers_file="$(mktemp)"

  status="$(curl \
    --silent \
    --show-error \
    --dump-header "${headers_file}" \
    --output /dev/null \
    --write-out '%{http_code}' \
    --max-time 30 \
    "${app_url%/}/auth/start")" || {
      record_auth_failure_details "Auth start request failed before a response was received."
      rm -f "${headers_file}"
      return 1
    }

  if [[ "${status}" != "302" ]]; then
    record_auth_failure_details "$(printf 'Auth start endpoint returned HTTP %s.\nHeaders preview:\n%s' "${status}" "$(preview_file "${headers_file}")")"
    rm -f "${headers_file}"
    return 1
  fi

  location_header="$(awk 'BEGIN { IGNORECASE = 1 } /^location:/ { sub(/\r$/, "", $0); print substr($0, 11) }' "${headers_file}" | tail -n 1)"

  if [[ -z "${location_header}" ]]; then
    record_auth_failure_details "Auth start endpoint did not return a redirect Location header."
    rm -f "${headers_file}"
    return 1
  fi

  redirect_uri="$(python3 - "${location_header}" <<'PY'
import sys
from urllib.parse import parse_qs, urlparse

url = urlparse(sys.argv[1])
print(parse_qs(url.query).get("redirect_uri", [""])[0])
PY
)"

  if [[ "${redirect_uri}" != "${expected_redirect_uri}" ]]; then
    record_auth_failure_details "Auth redirect_uri is ${redirect_uri}, expected ${expected_redirect_uri}."
    rm -f "${headers_file}"
    return 1
  fi

  echo "Verified auth redirect_uri=${redirect_uri}."
  rm -f "${headers_file}"
}

assert_auth_redirect_uses_public_app_url() {
  local app_url="$1"
  local attempt

  LAST_AUTH_FAILURE_DETAILS=""

  for attempt in $(seq 1 "${VERIFY_AUTH_RETRIES}"); do
    if check_auth_redirect_uses_public_app_url "${app_url}"; then
      return 0
    fi

    if [[ "${attempt}" -lt "${VERIFY_AUTH_RETRIES}" ]]; then
      sleep "${VERIFY_AUTH_DELAY_SECONDS}"
    fi
  done

  echo "Auth start endpoint did not redirect with the expected public app URL after ${VERIFY_AUTH_RETRIES} attempts."
  if [[ -n "${LAST_AUTH_FAILURE_DETAILS}" ]]; then
    printf '%s\n' "${LAST_AUTH_FAILURE_DETAILS}"
  fi
  exit 1
}

get_app_configuration_value() {
  local store_name="$1"
  local query="$2"

  az appconfig show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${store_name}" \
    --query "${query}" \
    -o tsv
}

get_key_vault_value() {
  local vault_name="$1"
  local query="$2"

  az keyvault show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${vault_name}" \
    --query "${query}" \
    -o tsv
}

assert_app_configuration_public_network_access() {
  local store_name="$1"
  local expected="$2"
  local actual

  actual="$(get_app_configuration_value "${store_name}" 'publicNetworkAccess')"

  if [[ "${actual}" != "${expected}" ]]; then
    echo "App Configuration ${store_name} publicNetworkAccess is ${actual}, expected ${expected}."
    exit 1
  fi

  echo "Verified App Configuration ${store_name} publicNetworkAccess=${actual}."
}

assert_key_vault_public_network_access() {
  local vault_name="$1"
  local expected="$2"
  local actual

  actual="$(get_key_vault_value "${vault_name}" 'properties.publicNetworkAccess')"

  if [[ "${actual}" != "${expected}" ]]; then
    echo "Key Vault ${vault_name} publicNetworkAccess is ${actual}, expected ${expected}."
    exit 1
  fi

  echo "Verified Key Vault ${vault_name} publicNetworkAccess=${actual}."
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

assert_container_app_env_absent() {
  local container_app_name="$1"
  local env_name="$2"
  local env_count

  env_count="$(az containerapp show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${container_app_name}" \
    --query "length(properties.template.containers[0].env[?name=='${env_name}'])" \
    -o tsv)"

  if [[ "${env_count}" != "0" ]]; then
    echo "Container App ${container_app_name} still exposes env ${env_name}, but the runtime contract requires it to be absent."
    exit 1
  fi

  echo "Verified Container App ${container_app_name} does not expose env ${env_name}."
}

assert_container_app_user_assigned_identity_present() {
  local container_app_name="$1"
  local identity_id="$2"
  local is_attached

  is_attached="$(az containerapp show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${container_app_name}" \
    --query "contains(keys(identity.userAssignedIdentities), '${identity_id}')" \
    -o tsv)"

  if [[ "${is_attached}" != "true" ]]; then
    echo "Container App ${container_app_name} is missing required user-assigned identity ${identity_id}."
    exit 1
  fi

  echo "Verified Container App ${container_app_name} attaches user-assigned identity ${identity_id}."
}

assert_container_app_user_assigned_identity_absent() {
  local container_app_name="$1"
  local identity_id="$2"
  local is_attached

  is_attached="$(az containerapp show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${container_app_name}" \
    --query "contains(keys(identity.userAssignedIdentities), '${identity_id}')" \
    -o tsv)"

  if [[ "${is_attached}" != "false" ]]; then
    echo "Container App ${container_app_name} still attaches user-assigned identity ${identity_id}, but the runtime contract requires it to be absent."
    exit 1
  fi

  echo "Verified Container App ${container_app_name} does not attach user-assigned identity ${identity_id}."
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

assert_front_door_profile_sku() {
  local profile_name="$1"
  local actual_sku

  actual_sku="$(az resource show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --resource-type 'Microsoft.Cdn/profiles' \
    --name "${profile_name}" \
    --query sku.name \
    -o tsv)"

  if [[ "${actual_sku}" != "${EXPECTED_FRONT_DOOR_SKU}" ]]; then
    echo "Azure Front Door profile ${profile_name} sku is ${actual_sku}, expected ${EXPECTED_FRONT_DOOR_SKU}."
    exit 1
  fi

  echo "Verified Azure Front Door profile ${profile_name} sku=${actual_sku}."
}

assert_managed_environment_public_network_access() {
  local managed_environment_name="$1"
  local actual_value

  actual_value="$(az containerapp env show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${managed_environment_name}" \
    --query properties.publicNetworkAccess \
    -o tsv)"

  if [[ "${actual_value}" != "${EXPECTED_MANAGED_ENVIRONMENT_PUBLIC_NETWORK_ACCESS}" ]]; then
    echo "Container Apps environment ${managed_environment_name} publicNetworkAccess is ${actual_value}, expected ${EXPECTED_MANAGED_ENVIRONMENT_PUBLIC_NETWORK_ACCESS}."
    exit 1
  fi

  echo "Verified Container Apps environment ${managed_environment_name} publicNetworkAccess=${actual_value}."
}

assert_front_door_private_link_connections() {
  local managed_environment_name="$1"
  local -a statuses=()

  while IFS= read -r connection_status; do
    [[ -n "${connection_status}" ]] && statuses+=("${connection_status}")
  done < <(az network private-endpoint-connection list \
    --name "${managed_environment_name}" \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --type Microsoft.App/managedEnvironments \
    --query "[].properties.privateLinkServiceConnectionState.status" \
    -o tsv)

  if [[ "${#statuses[@]}" -lt 1 ]]; then
    echo "No Azure Front Door private endpoint connections were found for ${managed_environment_name}."
    exit 1
  fi

  for connection_status in "${statuses[@]}"; do
    if [[ "${connection_status}" != "Approved" ]]; then
      echo "Azure Front Door private endpoint connection for ${managed_environment_name} is ${connection_status}, expected Approved."
      exit 1
    fi
  done

  echo "Verified Azure Front Door private endpoint connections for ${managed_environment_name} are approved."
}

container_app_name="$(
  resolve_existing_resource_name_by_type \
    'Microsoft.App/containerApps' \
    'Container App' \
    "$AZURE_EXPECTED_CONTAINER_APP_NAME" \
    "$AZURE_LEGACY_CONTAINER_APP_NAME"
)"
if [[ -z "${container_app_name}" ]]; then
  echo "Missing Container App in ${AZURE_RESOURCE_GROUP}."
  exit 1
fi
trap on_verify_exit EXIT
APP_URL="$(resolve_app_url "${container_app_name}")"
sql_server_name="${AZURE_SQL_SERVER_NAME:-$(require_single_resource_name 'Microsoft.Sql/servers' 'Azure SQL server')}"
front_door_profile_name="$(
  resolve_existing_resource_name_by_type \
    'Microsoft.Cdn/profiles' \
    'Azure Front Door profile' \
    "$AZURE_EXPECTED_FRONT_DOOR_PROFILE_NAME" \
    "$AZURE_LEGACY_FRONT_DOOR_PROFILE_NAME"
)"
if [[ -z "${front_door_profile_name}" ]]; then
  echo "Missing Azure Front Door profile in ${AZURE_RESOURCE_GROUP}."
  exit 1
fi

assert_front_door_profile_sku "${front_door_profile_name}"

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

container_app_status="$(az containerapp show \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${container_app_name}" \
  --query properties.runningStatus \
  -o tsv)"

if [[ "${container_app_status}" != "Running" ]]; then
  echo "Container App ${container_app_name} is ${container_app_status}."
  exit 1
fi

echo "Verified Container App ${container_app_name} is running."

managed_environment_id="$(az containerapp show \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${container_app_name}" \
  --query properties.managedEnvironmentId \
  -o tsv)"
managed_environment_name="${managed_environment_id##*/}"
container_app_principal_id="$(az containerapp show \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${container_app_name}" \
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
assert_managed_environment_public_network_access "${managed_environment_name}"
assert_front_door_private_link_connections "${managed_environment_name}"

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
  app_configuration_id="$(get_app_configuration_value "${app_configuration_name}" 'id')"
  key_vault_id="$(get_key_vault_value "${key_vault_name}" 'id')"
  app_configuration_endpoint="$(get_app_configuration_value "${app_configuration_name}" 'endpoint')"
  key_vault_uri="$(get_key_vault_value "${key_vault_name}" 'properties.vaultUri')"

  assert_app_configuration_public_network_access "${app_configuration_name}" "${EXPECTED_APPCONFIG_PUBLIC_NETWORK_ACCESS}"
  assert_key_vault_public_network_access "${key_vault_name}" "${EXPECTED_KEY_VAULT_PUBLIC_NETWORK_ACCESS}"

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

fi

app_configuration_name="${app_configuration_name:-$(require_single_resource_name 'Microsoft.AppConfiguration/configurationStores' 'App Configuration store')}"
key_vault_name="${key_vault_name:-$(require_single_resource_name 'Microsoft.KeyVault/vaults' 'Key Vault')}"
app_configuration_id="${app_configuration_id:-$(get_app_configuration_value "${app_configuration_name}" 'id')}"
key_vault_id="${key_vault_id:-$(get_key_vault_value "${key_vault_name}" 'id')}"
app_configuration_endpoint="${app_configuration_endpoint:-$(get_app_configuration_value "${app_configuration_name}" 'endpoint')}"
key_vault_uri="${key_vault_uri:-$(get_key_vault_value "${key_vault_name}" 'properties.vaultUri')}"
sql_runtime_identity_name="$(
  resolve_existing_resource_name_by_type \
    'Microsoft.ManagedIdentity/userAssignedIdentities' \
    'SQL runtime identity' \
    "${AZURE_EXPECTED_SQL_RUNTIME_IDENTITY_NAME}" \
    "${AZURE_LEGACY_SQL_RUNTIME_IDENTITY_NAME}"
)"
sql_migration_identity_name="$(
  resolve_existing_resource_name_by_type \
    'Microsoft.ManagedIdentity/userAssignedIdentities' \
    'SQL migration identity' \
    "${AZURE_EXPECTED_SQL_MIGRATION_IDENTITY_NAME}" \
    "${AZURE_LEGACY_SQL_MIGRATION_IDENTITY_NAME}"
)"
sql_runtime_identity_id="$(az identity show \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${sql_runtime_identity_name}" \
  --query id \
  -o tsv)"
sql_runtime_identity_client_id="$(az identity show \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${sql_runtime_identity_name}" \
  --query clientId \
  -o tsv)"
sql_migration_identity_id="$(az identity show \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${sql_migration_identity_name}" \
  --query id \
  -o tsv)"

assert_app_configuration_public_network_access "${app_configuration_name}" "${EXPECTED_APPCONFIG_PUBLIC_NETWORK_ACCESS}"
assert_key_vault_public_network_access "${key_vault_name}" "${EXPECTED_KEY_VAULT_PUBLIC_NETWORK_ACCESS}"

assert_container_app_env_value "${container_app_name}" 'AZURE_APP_NAME' "${AZURE_APP_NAME}"
assert_container_app_env_value "${container_app_name}" 'AZURE_APPCONFIG_ENDPOINT' "${app_configuration_endpoint}"
assert_container_app_env_value "${container_app_name}" 'AZURE_KEY_VAULT_URI' "${key_vault_uri}"
assert_container_app_env_value "${container_app_name}" 'AZURE_SQL_RUNTIME_CLIENT_ID' "${sql_runtime_identity_client_id}"
assert_container_app_env_absent "${container_app_name}" 'AZURE_SQL_MIGRATION_CLIENT_ID'
assert_container_app_env_absent "${container_app_name}" 'STARTUP_MIGRATION_DATABASE_URL'
assert_container_app_user_assigned_identity_present "${container_app_name}" "${sql_runtime_identity_id}"
assert_container_app_user_assigned_identity_absent "${container_app_name}" "${sql_migration_identity_id}"

assert_role_assignment_for_principal "${app_configuration_id}" "${container_app_principal_id}" 'App Configuration Data Reader' 'App Configuration access'
assert_role_assignment_for_principal "${key_vault_id}" "${container_app_principal_id}" 'Key Vault Secrets User' 'Key Vault access'
assert_auth_redirect_uses_public_app_url "${APP_URL}"

echo "Verified hosted Azure runtime contract for ${sql_server_name}."
APP_URL="${APP_URL}" ./scripts/azure/smoke-test.sh
