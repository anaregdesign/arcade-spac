#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "$1" >&2
  exit 1
}

require_env() {
  local name="$1"

  if [[ -z "${!name:-}" ]]; then
    fail "${name} is required."
  fi
}

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

  resolve_single_resource_name "Microsoft.Sql/servers" "Azure SQL server"
}

resolve_sql_database_name() {
  local sql_server_name="$1"
  local -a database_names=()

  if [[ -n "${ARCADE_SQL_DATABASE:-}" ]]; then
    printf '%s\n' "${ARCADE_SQL_DATABASE}"
    return
  fi

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
  if [[ -n "${STARTUP_MIGRATION_DATABASE_URL:-}" ]]; then
    printf '%s\n' "${STARTUP_MIGRATION_DATABASE_URL}"
    return
  fi

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

database_url="$(resolve_database_url)"

if [[ "${database_url}" == file:* ]]; then
  fail "Startup migration DATABASE_URL must not point to SQLite."
fi

database_url_lower="$(printf '%s' "${database_url}" | tr '[:upper:]' '[:lower:]')"

if [[ "${database_url_lower}" == *"password="* ]]; then
  fail "Startup migration DATABASE_URL must not use a password-based SQL login."
fi

if [[ "${database_url_lower}" == *".database.windows.net"* ]] \
  && [[ "${database_url_lower}" != *"authentication=activedirectorymanagedidentity"* ]] \
  && [[ "${database_url_lower}" != *"authentication=defaultazurecredential"* ]]; then
  fail "Startup migration DATABASE_URL must use an Entra-backed Azure SQL authentication mode."
fi

printf '%s\n' "${database_url}"
