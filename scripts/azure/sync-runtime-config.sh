#!/usr/bin/env bash
set -euo pipefail

APP_CONFIGURATION_KEY_PREFIX="${APP_CONFIGURATION_KEY_PREFIX:-Arcade:}"
APPCONFIG_LABEL="${AZURE_APPCONFIG_LABEL:-${APPCONFIG_LABEL:-}}"

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

require_command az
az account show >/dev/null

require_env AZURE_APPCONFIG_ENDPOINT
require_env AZURE_KEY_VAULT_URI
require_env ARCADE_AUTH_MODE
require_env PUBLIC_APP_URL
require_env ARCADE_SESSION_SECRET

if [[ "${ARCADE_AUTH_MODE}" != "local" && "${ARCADE_AUTH_MODE}" != "entra" ]]; then
  fail "ARCADE_AUTH_MODE must be 'local' or 'entra'."
fi

if [[ "${ARCADE_AUTH_MODE}" == "entra" ]]; then
  require_env ENTRA_TENANT_ID
  require_env ENTRA_CLIENT_ID
  require_env ENTRA_CLIENT_SECRET
fi

ENTRA_AUTHORITY_TENANT="${ENTRA_AUTHORITY_TENANT:-${ENTRA_TENANT_ID:-}}"
vault_host="${AZURE_KEY_VAULT_URI#https://}"
vault_host="${vault_host%%/*}"
vault_name="${vault_host%%.*}"

if [[ -z "${vault_name}" ]]; then
  fail "AZURE_KEY_VAULT_URI must point to a valid Key Vault URI."
fi

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

  az keyvault secret set \
    --vault-name "${vault_name}" \
    --name "${secret_name}" \
    --value "${secret_value}" \
    --output none
}

set_appconfig_value() {
  local key="$1"
  local value="$2"

  if [[ "${#appconfig_label_args[@]}" -gt 0 ]]; then
    az appconfig kv set \
      --auth-mode login \
      --endpoint "${AZURE_APPCONFIG_ENDPOINT}" \
      --key "${APP_CONFIGURATION_KEY_PREFIX}${key}" \
      --value "${value}" \
      --yes \
      "${appconfig_label_args[@]}" \
      --output none
    return
  fi

  az appconfig kv set \
    --auth-mode login \
    --endpoint "${AZURE_APPCONFIG_ENDPOINT}" \
    --key "${APP_CONFIGURATION_KEY_PREFIX}${key}" \
    --value "${value}" \
    --yes \
    --output none
}

set_appconfig_keyvault_reference() {
  local key="$1"
  local secret_identifier="$2"

  if [[ "${#appconfig_label_args[@]}" -gt 0 ]]; then
    az appconfig kv set-keyvault \
      --auth-mode login \
      --endpoint "${AZURE_APPCONFIG_ENDPOINT}" \
      --key "${APP_CONFIGURATION_KEY_PREFIX}${key}" \
      --secret-identifier "${secret_identifier}" \
      --yes \
      "${appconfig_label_args[@]}" \
      --output none
    return
  fi

  az appconfig kv set-keyvault \
    --auth-mode login \
    --endpoint "${AZURE_APPCONFIG_ENDPOINT}" \
    --key "${APP_CONFIGURATION_KEY_PREFIX}${key}" \
    --secret-identifier "${secret_identifier}" \
    --yes \
    --output none
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

echo "Synced Arcade runtime config to Azure App Configuration and Key Vault."
