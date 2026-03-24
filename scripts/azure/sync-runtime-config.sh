#!/usr/bin/env bash
set -euo pipefail

APP_CONFIGURATION_KEY_PREFIX="${APP_CONFIGURATION_KEY_PREFIX:-Arcade:}"
APPCONFIG_LABEL="${AZURE_APPCONFIG_LABEL:-${APPCONFIG_LABEL:-}}"
APPCONFIG_KEYVAULT_REFERENCE_CONTENT_TYPE="application/vnd.microsoft.appconfig.keyvaultref+json;charset=utf-8"
config_changed=false

appconfig_label_args=()
if [[ -n "${APPCONFIG_LABEL}" ]]; then
  appconfig_label_args=(--label "${APPCONFIG_LABEL}")
fi

fail() {
  echo "$1" >&2
  exit 1
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail "Required command '$1' is not installed."
  fi
}

require_env() {
  local name="$1"

  if [[ -z "${!name:-}" ]]; then
    fail "${name} is required."
  fi
}

append_output() {
  local key="$1"
  local value="$2"

  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    printf '%s=%s\n' "${key}" "${value}" >> "${GITHUB_OUTPUT}"
  fi
}

mark_config_changed() {
  config_changed=true
}

require_command az
az account show >/dev/null

require_env ARCADE_SESSION_SECRET

resolve_single_resource_name() {
  local resource_type="$1"
  local label="$2"
  local -a names=()

  require_env AZURE_RESOURCE_GROUP

  while IFS= read -r resource_name; do
    [[ -n "${resource_name}" ]] && names+=("${resource_name}")
  done < <(az resource list \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --resource-type "${resource_type}" \
    --query '[].name' \
    -o tsv)

  if [[ "${#names[@]}" -ne 1 ]]; then
    fail "Expected exactly one ${label} in ${AZURE_RESOURCE_GROUP}, found ${#names[@]}."
  fi

  printf '%s\n' "${names[0]}"
}

resolve_appconfig_endpoint() {
  if [[ -n "${AZURE_APPCONFIG_ENDPOINT:-}" ]]; then
    printf '%s\n' "${AZURE_APPCONFIG_ENDPOINT}"
    return
  fi

  local store_name
  store_name="$(resolve_single_resource_name 'Microsoft.AppConfiguration/configurationStores' 'App Configuration store')"

  az appconfig show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${store_name}" \
    --query endpoint \
    -o tsv
}

resolve_key_vault_uri() {
  if [[ -n "${AZURE_KEY_VAULT_URI:-}" ]]; then
    printf '%s\n' "${AZURE_KEY_VAULT_URI}"
    return
  fi

  local vault_name
  vault_name="$(resolve_single_resource_name 'Microsoft.KeyVault/vaults' 'Key Vault')"

  az keyvault show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${vault_name}" \
    --query properties.vaultUri \
    -o tsv
}

normalize_url_host() {
  local candidate="$1"

  candidate="${candidate#http://}"
  candidate="${candidate#https://}"
  printf '%s\n' "${candidate%%/*}"
}

uses_azure_front_door_default_host() {
  local host
  host="$(normalize_url_host "$1")"
  [[ -n "${host}" && "${host}" == *.azurefd.net ]]
}

resolve_front_door_host() {
  local front_door_endpoint_id
  local front_door_host

  require_env AZURE_RESOURCE_GROUP

  front_door_endpoint_id="$(az resource list \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --resource-type 'Microsoft.Cdn/profiles/afdEndpoints' \
    --query '[0].id' \
    -o tsv)"

  if [[ -z "${front_door_endpoint_id}" ]]; then
    return 1
  fi

  front_door_host="$(az resource show \
    --ids "${front_door_endpoint_id}" \
    --query properties.hostName \
    -o tsv)"

  if [[ -z "${front_door_host}" ]]; then
    fail "Unable to resolve Azure Front Door host name for ${AZURE_RESOURCE_GROUP}."
  fi

  printf '%s\n' "${front_door_host}"
}

resolve_public_app_url() {
  local configured_public_app_url="${PUBLIC_APP_URL:-}"
  local front_door_host
  local derived_public_app_url=""

  if front_door_host="$(resolve_front_door_host)"; then
    derived_public_app_url="https://${front_door_host}"
  fi

  if [[ -n "${configured_public_app_url}" ]]; then
    if [[ -n "${derived_public_app_url}" ]] && uses_azure_front_door_default_host "${configured_public_app_url}"; then
      local configured_public_app_url_host
      configured_public_app_url_host="$(normalize_url_host "${configured_public_app_url}")"

      if [[ "${configured_public_app_url_host}" != "${front_door_host}" ]]; then
        echo "Ignoring stale PUBLIC_APP_URL ${configured_public_app_url}; using current Azure Front Door host ${derived_public_app_url}." >&2
      fi

      printf '%s\n' "${derived_public_app_url}"
      return
    fi

    printf '%s\n' "${configured_public_app_url}"
    return
  fi

  if [[ -n "${derived_public_app_url}" ]]; then
    printf '%s\n' "${derived_public_app_url}"
    return
  fi

  fail "PUBLIC_APP_URL is required when no Azure Front Door endpoint exists in ${AZURE_RESOURCE_GROUP}."
}

AZURE_APPCONFIG_ENDPOINT="$(resolve_appconfig_endpoint)"
AZURE_KEY_VAULT_URI="$(resolve_key_vault_uri)"
PUBLIC_APP_URL="$(resolve_public_app_url)"
ARCADE_AUTH_MODE="${ARCADE_AUTH_MODE:-entra}"
ENTRA_TENANT_ID="${ENTRA_TENANT_ID:-${AZURE_TENANT_ID:-}}"

[[ -n "${AZURE_APPCONFIG_ENDPOINT}" ]] || fail "AZURE_APPCONFIG_ENDPOINT could not be resolved."
[[ -n "${AZURE_KEY_VAULT_URI}" ]] || fail "AZURE_KEY_VAULT_URI could not be resolved."
[[ -n "${PUBLIC_APP_URL}" ]] || fail "PUBLIC_APP_URL could not be resolved."

if [[ "${ARCADE_AUTH_MODE}" != "local" && "${ARCADE_AUTH_MODE}" != "entra" ]]; then
  fail "ARCADE_AUTH_MODE must be 'local' or 'entra'."
fi

if [[ "${ARCADE_AUTH_MODE}" == "entra" ]]; then
  require_env ENTRA_TENANT_ID
  require_env ENTRA_CLIENT_ID
  require_env ENTRA_CLIENT_SECRET
fi

ENTRA_AUTHORITY_TENANT="${ENTRA_AUTHORITY_TENANT:-organizations}"
vault_host="${AZURE_KEY_VAULT_URI#https://}"
vault_host="${vault_host%%/*}"
vault_name="${vault_host%%.*}"

if [[ -z "${vault_name}" ]]; then
  fail "AZURE_KEY_VAULT_URI must point to a valid Key Vault URI."
fi

resolve_sql_server_name() {
  if [[ -n "${ARCADE_SQL_SERVER_NAME:-}" ]]; then
    printf '%s\n' "${ARCADE_SQL_SERVER_NAME}"
    return
  fi

  resolve_single_resource_name 'Microsoft.Sql/servers' 'Azure SQL server'
}

resolve_sql_database_name() {
  local sql_server_name="$1"

  if [[ -n "${ARCADE_SQL_DATABASE:-}" ]]; then
    printf '%s\n' "${ARCADE_SQL_DATABASE}"
    return
  fi

  if [[ -z "${AZURE_RESOURCE_GROUP:-}" ]]; then
    printf 'arcade\n'
    return
  fi

  local -a database_names=()

  while IFS= read -r database_name; do
    [[ -n "${database_name}" && "${database_name}" != "master" ]] && database_names+=("${database_name}")
  done < <(az sql db list \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --server "${sql_server_name}" \
    --query '[].name' \
    -o tsv)

  if [[ "${#database_names[@]}" -eq 1 ]]; then
    printf '%s\n' "${database_names[0]}"
    return
  fi

  printf 'arcade\n'
}

resolve_database_url() {
  if [[ -n "${DATABASE_URL:-}" ]]; then
    printf '%s\n' "${DATABASE_URL}"
    return
  fi

  local sql_server_fqdn="${ARCADE_SQL_SERVER_FQDN:-}"
  local sql_server_name="${ARCADE_SQL_SERVER_NAME:-}"

  if [[ -z "${sql_server_fqdn}" ]]; then
    if [[ -z "${sql_server_name}" ]]; then
      sql_server_name="$(resolve_sql_server_name)"
    fi

    sql_server_fqdn="${sql_server_name}.database.windows.net"
  fi

  if [[ -z "${sql_server_name}" ]]; then
    sql_server_name="${sql_server_fqdn%%.*}"
  fi

  local sql_database_name
  sql_database_name="$(resolve_sql_database_name "${sql_server_name}")"

  printf 'sqlserver://%s;database=%s;authentication=DefaultAzureCredential;encrypt=true;trustServerCertificate=false\n' \
    "${sql_server_fqdn}" \
    "${sql_database_name}"
}

validate_database_url() {
  local value="$1"
  local value_lower

  if [[ "${value}" == file:* ]]; then
    fail "DATABASE_URL must not point to SQLite for hosted Azure runtime."
  fi

  value_lower="$(printf '%s' "${value}" | tr '[:upper:]' '[:lower:]')"

  if [[ "${value_lower}" == *"password="* ]]; then
    fail "DATABASE_URL must not include a password-based SQL login."
  fi

  if [[ "${value_lower}" == *".database.windows.net"* ]] \
    && [[ "${value_lower}" != *"authentication=activedirectorymanagedidentity"* ]] \
    && [[ "${value_lower}" != *"authentication=defaultazurecredential"* ]]; then
    fail "DATABASE_URL must use an Entra-backed Azure SQL authentication mode."
  fi
}

set_keyvault_secret() {
  local secret_name="$1"
  local secret_value="$2"
  local current_value=""

  current_value="$(az keyvault secret show \
    --vault-name "${vault_name}" \
    --name "${secret_name}" \
    --query value \
    -o tsv 2>/dev/null || true)"

  if [[ "${current_value}" == "${secret_value}" ]]; then
    echo "Key Vault secret ${secret_name} is already current."
    return
  fi

  az keyvault secret set \
    --vault-name "${vault_name}" \
    --name "${secret_name}" \
    --value "${secret_value}" \
    --output none

  mark_config_changed
}

show_appconfig_entry() {
  local key="$1"

  if [[ "${#appconfig_label_args[@]}" -gt 0 ]]; then
    az appconfig kv show \
      --auth-mode login \
      --endpoint "${AZURE_APPCONFIG_ENDPOINT}" \
      --key "${APP_CONFIGURATION_KEY_PREFIX}${key}" \
      "${appconfig_label_args[@]}" \
      --output json 2>/dev/null || true
    return
  fi

  az appconfig kv show \
    --auth-mode login \
    --endpoint "${AZURE_APPCONFIG_ENDPOINT}" \
    --key "${APP_CONFIGURATION_KEY_PREFIX}${key}" \
    --output json 2>/dev/null || true
}

appconfig_plain_value_is_current() {
  local payload="$1"
  local expected_value="$2"

  [[ -n "${payload}" ]] || return 1

  APPCONFIG_PAYLOAD="${payload}" python3 - "${expected_value}" <<'PY'
import json
import os
import sys

expected_value = sys.argv[1]
payload = json.loads(os.environ["APPCONFIG_PAYLOAD"])
content_type = payload.get("content_type") or payload.get("contentType") or ""
value = payload.get("value")

if value == expected_value and content_type == "":
    raise SystemExit(0)

raise SystemExit(1)
PY
}

appconfig_keyvault_reference_is_current() {
  local payload="$1"
  local expected_secret_identifier="$2"

  [[ -n "${payload}" ]] || return 1

  APPCONFIG_PAYLOAD="${payload}" python3 - "${expected_secret_identifier}" "${APPCONFIG_KEYVAULT_REFERENCE_CONTENT_TYPE}" <<'PY'
import json
import os
import sys

expected_secret_identifier = sys.argv[1]
expected_content_type = sys.argv[2]
payload = json.loads(os.environ["APPCONFIG_PAYLOAD"])
content_type = payload.get("content_type") or payload.get("contentType") or ""

if content_type != expected_content_type:
    raise SystemExit(1)

value = payload.get("value")
if not isinstance(value, str):
    raise SystemExit(1)

try:
    value_payload = json.loads(value)
except json.JSONDecodeError:
    raise SystemExit(1)

if value_payload.get("uri") == expected_secret_identifier:
    raise SystemExit(0)

raise SystemExit(1)
PY
}

set_appconfig_value() {
  local key="$1"
  local value="$2"
  local current_entry=""

  current_entry="$(show_appconfig_entry "${key}")"
  if appconfig_plain_value_is_current "${current_entry}" "${value}"; then
    echo "App Configuration key ${APP_CONFIGURATION_KEY_PREFIX}${key} is already current."
    return
  fi

  if [[ "${#appconfig_label_args[@]}" -gt 0 ]]; then
    az appconfig kv set \
      --auth-mode login \
      --endpoint "${AZURE_APPCONFIG_ENDPOINT}" \
      --key "${APP_CONFIGURATION_KEY_PREFIX}${key}" \
      --value "${value}" \
      --yes \
      "${appconfig_label_args[@]}" \
      --output none
    mark_config_changed
    return
  fi

  az appconfig kv set \
    --auth-mode login \
    --endpoint "${AZURE_APPCONFIG_ENDPOINT}" \
    --key "${APP_CONFIGURATION_KEY_PREFIX}${key}" \
    --value "${value}" \
    --yes \
    --output none

  mark_config_changed
}

set_appconfig_keyvault_reference() {
  local key="$1"
  local secret_identifier="$2"
  local current_entry=""

  current_entry="$(show_appconfig_entry "${key}")"
  if appconfig_keyvault_reference_is_current "${current_entry}" "${secret_identifier}"; then
    echo "App Configuration Key Vault reference ${APP_CONFIGURATION_KEY_PREFIX}${key} is already current."
    return
  fi

  if [[ "${#appconfig_label_args[@]}" -gt 0 ]]; then
    az appconfig kv set-keyvault \
      --auth-mode login \
      --endpoint "${AZURE_APPCONFIG_ENDPOINT}" \
      --key "${APP_CONFIGURATION_KEY_PREFIX}${key}" \
      --secret-identifier "${secret_identifier}" \
      --yes \
      "${appconfig_label_args[@]}" \
      --output none
    mark_config_changed
    return
  fi

  az appconfig kv set-keyvault \
    --auth-mode login \
    --endpoint "${AZURE_APPCONFIG_ENDPOINT}" \
    --key "${APP_CONFIGURATION_KEY_PREFIX}${key}" \
    --secret-identifier "${secret_identifier}" \
    --yes \
    --output none

  mark_config_changed
}

database_url="$(resolve_database_url)"
validate_database_url "${database_url}"

set_keyvault_secret arcade-session-secret "${ARCADE_SESSION_SECRET}"
set_keyvault_secret database-url "${database_url}"

session_secret_identifier="$(az keyvault secret show \
  --vault-name "${vault_name}" \
  --name arcade-session-secret \
  --query id \
  -o tsv)"
database_url_identifier="$(az keyvault secret show \
  --vault-name "${vault_name}" \
  --name database-url \
  --query id \
  -o tsv)"

set_appconfig_value ARCADE_AUTH_MODE "${ARCADE_AUTH_MODE}"
set_appconfig_value PUBLIC_APP_URL "${PUBLIC_APP_URL}"
set_appconfig_keyvault_reference ARCADE_SESSION_SECRET "${session_secret_identifier}"
set_appconfig_keyvault_reference DATABASE_URL "${database_url_identifier}"

if [[ "${ARCADE_AUTH_MODE}" == "entra" ]]; then
  set_keyvault_secret entra-client-secret "${ENTRA_CLIENT_SECRET}"
  entra_client_secret_identifier="$(az keyvault secret show \
    --vault-name "${vault_name}" \
    --name entra-client-secret \
    --query id \
    -o tsv)"

  set_appconfig_value ENTRA_TENANT_ID "${ENTRA_TENANT_ID}"
  set_appconfig_value ENTRA_AUTHORITY_TENANT "${ENTRA_AUTHORITY_TENANT}"
  set_appconfig_value ENTRA_CLIENT_ID "${ENTRA_CLIENT_ID}"
  set_appconfig_keyvault_reference ENTRA_CLIENT_SECRET "${entra_client_secret_identifier}"
fi

append_output "config_changed" "${config_changed}"
echo "Synced Arcade runtime config to Azure App Configuration and Key Vault. config_changed=${config_changed}"
