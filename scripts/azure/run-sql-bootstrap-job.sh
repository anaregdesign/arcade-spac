#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/environment-resource-names.sh"

fail() {
  echo "$1" >&2
  exit 1
}

require_env() {
  local name="$1"
  [[ -n "${!name:-}" ]] || fail "${name} is required."
}

require_single_resource_name() {
  local resource_type="$1"
  local label="$2"
  local -a names=()

  while IFS= read -r resource_name; do
    [[ -n "${resource_name}" ]] && names+=("${resource_name}")
  done < <(
    az resource list \
      --resource-group "${AZURE_RESOURCE_GROUP}" \
      --resource-type "${resource_type}" \
      --query '[].name' \
      --output tsv
  )

  if [[ "${#names[@]}" -ne 1 ]]; then
    fail "Expected exactly one ${label} in ${AZURE_RESOURCE_GROUP}, found ${#names[@]}."
  fi

  printf '%s\n' "${names[0]}"
}

ensure_sql_server_entra_admin() {
  local server_name="$1"
  local bootstrap_identity_name="$2"
  local bootstrap_identity_principal_id="$3"
  local current_admin_object_id=""

  current_admin_object_id="$(
    az sql server ad-admin list \
      --resource-group "${AZURE_RESOURCE_GROUP}" \
      --server "${server_name}" \
      --query '[0].sid' \
      --output tsv
  )"

  if [[ "${current_admin_object_id}" == "${bootstrap_identity_principal_id}" ]]; then
    return 0
  fi

  az sql server ad-admin create \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --server "${server_name}" \
    --display-name "${bootstrap_identity_name}" \
    --object-id "${bootstrap_identity_principal_id}" \
    --output none
}

ensure_sql_server_entra_only_auth() {
  local server_name="$1"
  local ad_only_auth=""

  ad_only_auth="$(
    az sql server ad-only-auth get \
      --resource-group "${AZURE_RESOURCE_GROUP}" \
      --name "${server_name}" \
      --query azureADOnlyAuthentication \
      --output tsv 2>/dev/null || true
  )"

  if [[ -z "${ad_only_auth}" ]]; then
    ad_only_auth="$(
      az sql server ad-only-auth get \
        --resource-group "${AZURE_RESOURCE_GROUP}" \
        --name "${server_name}" \
        --query azureAdOnlyAuthentication \
        --output tsv
    )"
  fi

  if [[ "${ad_only_auth}" == "true" ]]; then
    return 0
  fi

  az sql server ad-only-auth enable \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${server_name}" \
    --output none
}

delete_job_if_exists() {
  local job_name="$1"

  if az containerapp job show --resource-group "${AZURE_RESOURCE_GROUP}" --name "${job_name}" --output none >/dev/null 2>&1; then
    echo "Deleting transient SQL bootstrap job ${job_name}."
    az containerapp job delete --resource-group "${AZURE_RESOURCE_GROUP}" --name "${job_name}" --yes --output none
  fi
}

print_job_diagnostics() {
  local job_name="$1"
  local job_execution_name="$2"

  echo "::group::SQL bootstrap execution details"
  az containerapp job execution show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${job_name}" \
    --job-execution-name "${job_execution_name}" \
    --output json || true
  echo "::endgroup::"

  echo "::group::SQL bootstrap container logs"
  az containerapp job logs show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${job_name}" \
    --execution "${job_execution_name}" \
    --container sql-bootstrap \
    --tail 200 \
    --format text || true
  echo "::endgroup::"
}

wait_for_job_execution() {
  local job_name="$1"
  local job_execution_name="$2"
  local job_status=""

  for ((attempt = 1; attempt <= 90; attempt++)); do
    job_status="$(
      az containerapp job execution show \
        --resource-group "${AZURE_RESOURCE_GROUP}" \
        --name "${job_name}" \
        --job-execution-name "${job_execution_name}" \
        --query properties.status \
        --output tsv
    )"

    echo "SQL bootstrap execution status: ${job_status}"

    if [[ "${job_status}" == "Succeeded" ]]; then
      return 0
    fi

    if [[ "${job_status}" == "Failed" ]]; then
      print_job_diagnostics "${job_name}" "${job_execution_name}"
      return 1
    fi

    sleep 10
  done

  echo "Timed out waiting for SQL bootstrap job completion."
  print_job_diagnostics "${job_name}" "${job_execution_name}"
  return 1
}

write_job_template() {
  local output_path="$1"
  {
    printf '%s\n' 'containers:'
    printf '%s\n' '  - name: sql-bootstrap'
    printf '    image: "%s"\n' "${IMAGE_REF}"
    printf '%s\n' '    resources:'
    printf '%s\n' '      cpu: 0.5'
    printf '%s\n' '      memory: 1Gi'
    printf '%s\n' '    command:'
    printf '%s\n' '      - sh'
    printf '%s\n' '    args:'
    printf '%s\n' '      - -lc'
    printf '%s\n' "      - \"printf '%s' \\\"\$ARCADE_SQL_BOOTSTRAP_SOURCE_B64\\\" | base64 -d > /app/init-sql.injected.mjs && node /app/init-sql.injected.mjs\""
    printf '%s\n' '    env:'
    printf '%s\n' '      - name: AZURE_CLIENT_ID'
    printf '        value: "%s"\n' "${SQL_BOOTSTRAP_IDENTITY_CLIENT_ID}"
    printf '%s\n' '      - name: ARCADE_SQL_BOOTSTRAP_SOURCE_B64'
    printf '        value: "%s"\n' "${SQL_BOOTSTRAP_SOURCE_B64}"
    printf '%s\n' '      - name: ARCADE_SQL_SERVER'
    printf '        value: "%s"\n' "${SQL_SERVER_NAME}.database.windows.net"
    printf '%s\n' '      - name: ARCADE_SQL_DATABASE'
    printf '        value: "%s"\n' "${SQL_DATABASE_NAME}"
    printf '%s\n' '      - name: ARCADE_SQL_RUNTIME_PRINCIPAL'
    printf '        value: "%s"\n' "${SQL_RUNTIME_PRINCIPAL_NAME}"
    printf '%s\n' '      - name: ARCADE_SQL_RUNTIME_CLIENT_ID'
    printf '        value: "%s"\n' "${SQL_RUNTIME_PRINCIPAL_CLIENT_ID}"
    printf '%s\n' '      - name: ARCADE_SQL_MIGRATION_PRINCIPAL'
    printf '        value: "%s"\n' "${SQL_MIGRATION_PRINCIPAL_NAME}"
    printf '%s\n' '      - name: ARCADE_SQL_MIGRATION_CLIENT_ID'
    printf '        value: "%s"\n' "${SQL_MIGRATION_PRINCIPAL_CLIENT_ID}"
  } >"${output_path}"
}

require_env "AZURE_RESOURCE_GROUP"
require_env "AZURE_APP_NAME"
require_env "IMAGE_REF"

derive_environment_names
az config set extension.use_dynamic_install=yes_without_prompt >/dev/null
az config set extension.dynamic_install_allow_preview=true >/dev/null

CONTAINER_APP_NAME="$(
  resolve_existing_resource_name_by_type \
    'Microsoft.App/containerApps' \
    'Container App' \
    "${AZURE_EXPECTED_CONTAINER_APP_NAME}" \
    "${AZURE_LEGACY_CONTAINER_APP_NAME}"
)"
SQL_BOOTSTRAP_IDENTITY_NAME="$(
  resolve_existing_resource_name_by_type \
    'Microsoft.ManagedIdentity/userAssignedIdentities' \
    'SQL bootstrap identity' \
    "${AZURE_EXPECTED_SQL_BOOTSTRAP_IDENTITY_NAME}" \
    "${AZURE_LEGACY_SQL_BOOTSTRAP_IDENTITY_NAME}"
)"
SQL_RUNTIME_IDENTITY_NAME="$(
  resolve_existing_resource_name_by_type \
    'Microsoft.ManagedIdentity/userAssignedIdentities' \
    'SQL runtime identity' \
    "${AZURE_EXPECTED_SQL_RUNTIME_IDENTITY_NAME}" \
    "${AZURE_LEGACY_SQL_RUNTIME_IDENTITY_NAME}"
)"
SQL_MIGRATION_IDENTITY_NAME="$(
  resolve_existing_resource_name_by_type \
    'Microsoft.ManagedIdentity/userAssignedIdentities' \
    'SQL migration identity' \
    "${AZURE_EXPECTED_SQL_MIGRATION_IDENTITY_NAME}" \
    "${AZURE_LEGACY_SQL_MIGRATION_IDENTITY_NAME}"
)"
MANAGED_ENVIRONMENT_ID=""
for ((attempt = 1; attempt <= 18; attempt++)); do
  MANAGED_ENVIRONMENT_ID="$(
    az containerapp show \
      --resource-group "${AZURE_RESOURCE_GROUP}" \
      --name "${CONTAINER_APP_NAME}" \
      --query properties.managedEnvironmentId \
      --output tsv 2>/dev/null || true
  )"

  if [[ -n "${MANAGED_ENVIRONMENT_ID}" ]]; then
    break
  fi

  sleep 10
done

MANAGED_ENVIRONMENT_NAME="${MANAGED_ENVIRONMENT_ID##*/}"
SQL_SERVER_NAME="$(require_single_resource_name 'Microsoft.Sql/servers' 'Azure SQL server')"
SQL_DATABASE_NAME="$(
  az sql db list \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --server "${SQL_SERVER_NAME}" \
    --query "[?name!='master'].name | [0]" \
    --output tsv
)"
SQL_BOOTSTRAP_IDENTITY_PRINCIPAL_ID="$(
  az identity show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${SQL_BOOTSTRAP_IDENTITY_NAME}" \
    --query principalId \
    --output tsv
)"
SQL_BOOTSTRAP_IDENTITY_ID="$(
  az identity show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${SQL_BOOTSTRAP_IDENTITY_NAME}" \
    --query id \
    --output tsv
)"
SQL_BOOTSTRAP_IDENTITY_CLIENT_ID="$(
  az identity show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${SQL_BOOTSTRAP_IDENTITY_NAME}" \
    --query clientId \
    --output tsv
)"
SQL_RUNTIME_PRINCIPAL_CLIENT_ID="$(
  az identity show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${SQL_RUNTIME_IDENTITY_NAME}" \
    --query clientId \
    --output tsv
)"
SQL_MIGRATION_PRINCIPAL_CLIENT_ID="$(
  az identity show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${SQL_MIGRATION_IDENTITY_NAME}" \
    --query clientId \
    --output tsv
)"
SQL_RUNTIME_PRINCIPAL_NAME="${SQL_RUNTIME_IDENTITY_NAME}"
SQL_MIGRATION_PRINCIPAL_NAME="${SQL_MIGRATION_IDENTITY_NAME}"
JOB_RUN_ID="${GITHUB_RUN_ID:-manual}"
JOB_RUN_ATTEMPT="${GITHUB_RUN_ATTEMPT:-1}"
JOB_NAME="sqlb-${JOB_RUN_ID}-${JOB_RUN_ATTEMPT}"
SQL_BOOTSTRAP_SOURCE_B64="$(base64 < ./scripts/azure/init-sql.mjs | tr -d '\n')"
SQL_BOOTSTRAP_TEMPLATE_PATH="/tmp/sql-bootstrap-template.yaml"

test -n "${CONTAINER_APP_NAME}" || fail "Missing Container App."
test -n "${MANAGED_ENVIRONMENT_NAME}" || fail "Missing Container Apps environment."
test -n "${SQL_SERVER_NAME}" || fail "Missing Azure SQL server."
test -n "${SQL_DATABASE_NAME}" || fail "Missing Azure SQL database."
test -n "${SQL_BOOTSTRAP_IDENTITY_NAME}" || fail "Missing SQL bootstrap identity name."
test -n "${SQL_BOOTSTRAP_IDENTITY_PRINCIPAL_ID}" || fail "Missing SQL bootstrap identity principal id."
test -n "${SQL_BOOTSTRAP_IDENTITY_ID}" || fail "Missing SQL bootstrap identity id."
test -n "${SQL_BOOTSTRAP_IDENTITY_CLIENT_ID}" || fail "Missing SQL bootstrap identity client id."
test -n "${SQL_RUNTIME_PRINCIPAL_NAME}" || fail "Missing SQL runtime principal name."
test -n "${SQL_RUNTIME_PRINCIPAL_CLIENT_ID}" || fail "Missing SQL runtime principal client id."
test -n "${SQL_MIGRATION_PRINCIPAL_NAME}" || fail "Missing SQL migration principal name."
test -n "${SQL_MIGRATION_PRINCIPAL_CLIENT_ID}" || fail "Missing SQL migration principal client id."

registry_args=()
if [[ -n "${CONTAINER_REGISTRY_SERVER:-}" ]]; then
  registry_args+=(--registry-server "${CONTAINER_REGISTRY_SERVER}")

  if [[ -n "${CONTAINER_REGISTRY_IDENTITY:-}" ]]; then
    registry_args+=(--registry-identity "${CONTAINER_REGISTRY_IDENTITY}")
  elif [[ -n "${CONTAINER_REGISTRY_USERNAME:-}" && -n "${CONTAINER_REGISTRY_PASSWORD:-}" ]]; then
    registry_args+=(--registry-username "${CONTAINER_REGISTRY_USERNAME}" --registry-password "${CONTAINER_REGISTRY_PASSWORD}")
  else
    fail "Registry configuration is incomplete."
  fi
fi

cleanup() {
  delete_job_if_exists "${JOB_NAME}"
}

trap cleanup EXIT

MAX_SQL_BOOTSTRAP_ATTEMPTS=3
SQL_BOOTSTRAP_RETRY_DELAY_SECONDS=30

delete_job_if_exists "${JOB_NAME}"

for ((bootstrap_attempt = 1; bootstrap_attempt <= MAX_SQL_BOOTSTRAP_ATTEMPTS; bootstrap_attempt++)); do
  ensure_sql_server_entra_admin \
    "${SQL_SERVER_NAME}" \
    "${SQL_BOOTSTRAP_IDENTITY_NAME}" \
    "${SQL_BOOTSTRAP_IDENTITY_PRINCIPAL_ID}"
  ensure_sql_server_entra_only_auth "${SQL_SERVER_NAME}"
  write_job_template "${SQL_BOOTSTRAP_TEMPLATE_PATH}"

  echo "Creating SQL bootstrap job ${JOB_NAME} (attempt ${bootstrap_attempt}/${MAX_SQL_BOOTSTRAP_ATTEMPTS})."
  az containerapp job create \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${JOB_NAME}" \
    --environment "${MANAGED_ENVIRONMENT_NAME}" \
    --trigger-type Manual \
    --replica-timeout 1800 \
    --replica-retry-limit 0 \
    --replica-completion-count 1 \
    --parallelism 1 \
    --container-name sql-bootstrap \
    --image "${IMAGE_REF}" \
    --cpu 0.5 \
    --memory 1.0Gi \
    --mi-user-assigned "${SQL_BOOTSTRAP_IDENTITY_ID}" \
    "${registry_args[@]}" \
    --output none

  echo "Starting SQL bootstrap job ${JOB_NAME}."
  az containerapp job start \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${JOB_NAME}" \
    --yaml "${SQL_BOOTSTRAP_TEMPLATE_PATH}" \
    --output none

  JOB_EXECUTION_NAME=""
  for ((attempt = 1; attempt <= 18; attempt++)); do
    echo "Waiting for SQL bootstrap execution discovery (${attempt}/18)."
    JOB_EXECUTION_NAME="$(
      az containerapp job execution list \
        --resource-group "${AZURE_RESOURCE_GROUP}" \
        --name "${JOB_NAME}" \
        --query "sort_by(@,&properties.startTime)[-1].name" \
        --output tsv
    )"

    if [[ -n "${JOB_EXECUTION_NAME}" ]]; then
      break
    fi

    sleep 10
  done

  test -n "${JOB_EXECUTION_NAME}" || fail "Missing SQL bootstrap job execution."
  echo "Following SQL bootstrap execution ${JOB_EXECUTION_NAME}."

  if wait_for_job_execution "${JOB_NAME}" "${JOB_EXECUTION_NAME}"; then
    exit 0
  fi

  delete_job_if_exists "${JOB_NAME}"

  if (( bootstrap_attempt == MAX_SQL_BOOTSTRAP_ATTEMPTS )); then
    exit 1
  fi

  echo "SQL bootstrap job attempt ${bootstrap_attempt}/${MAX_SQL_BOOTSTRAP_ATTEMPTS} failed. Retrying in ${SQL_BOOTSTRAP_RETRY_DELAY_SECONDS}s."
  sleep "${SQL_BOOTSTRAP_RETRY_DELAY_SECONDS}"
done
