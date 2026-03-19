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

delete_job_if_exists() {
  local job_name="$1"

  if az containerapp job show --resource-group "${AZURE_RESOURCE_GROUP}" --name "${job_name}" --output none >/dev/null 2>&1; then
    echo "Deleting transient Prisma migration job ${job_name}."
    az containerapp job delete --resource-group "${AZURE_RESOURCE_GROUP}" --name "${job_name}" --yes --output none
  fi
}

print_job_diagnostics() {
  local job_name="$1"
  local job_execution_name="$2"

  echo "::group::Prisma migration execution details"
  az containerapp job execution show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${job_name}" \
    --job-execution-name "${job_execution_name}" \
    --output json || true
  echo "::endgroup::"

  echo "::group::Prisma migration container logs"
  az containerapp job logs show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${job_name}" \
    --execution "${job_execution_name}" \
    --container db-migration \
    --tail 200 \
    --format text || true
  echo "::endgroup::"
}

wait_for_job_execution() {
  local job_name="$1"
  local job_execution_name="$2"
  local job_status=""

  for ((attempt = 1; attempt <= 90; attempt++)); do
    job_status="$(az containerapp job execution show \
      --resource-group "${AZURE_RESOURCE_GROUP}" \
      --name "${job_name}" \
      --job-execution-name "${job_execution_name}" \
      --query properties.status \
      --output tsv)"

    echo "Prisma migration execution status: ${job_status}"

    if [[ "${job_status}" == "Succeeded" ]]; then
      return 0
    fi

    if [[ "${job_status}" == "Failed" ]]; then
      print_job_diagnostics "${job_name}" "${job_execution_name}"
      return 1
    fi

    sleep 10
  done

  echo "Timed out waiting for Prisma migration job completion."
  print_job_diagnostics "${job_name}" "${job_execution_name}"
  return 1
}

write_job_template() {
  local output_path="$1"
  {
    printf '%s\n' 'containers:'
    printf '%s\n' '  - name: db-migration'
    printf '    image: "%s"\n' "${IMAGE_REF}"
    printf '%s\n' '    resources:'
    printf '%s\n' '      cpu: 0.5'
    printf '%s\n' '      memory: 1Gi'
    printf '%s\n' '    command:'
    printf '%s\n' '      - sh'
    printf '%s\n' '    args:'
    printf '%s\n' '      - -lc'
    printf '%s\n' '      - "node /app/scripts/run-migrations.mjs"'
    printf '%s\n' '    env:'
    printf '%s\n' '      - name: AZURE_SQL_MIGRATION_CLIENT_ID'
    printf '        value: "%s"\n' "${SQL_MIGRATION_IDENTITY_CLIENT_ID}"
    printf '%s\n' '      - name: DATABASE_URL'
    printf '        value: "%s"\n' "${SQL_DATABASE_URL}"
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
SQL_DATABASE_NAME="$(az sql db list \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --server "${SQL_SERVER_NAME}" \
  --query "[?name!='master'].name | [0]" \
  --output tsv)"
SQL_MIGRATION_IDENTITY_ID="$(az identity show \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${SQL_MIGRATION_IDENTITY_NAME}" \
  --query id \
  --output tsv)"
SQL_MIGRATION_IDENTITY_CLIENT_ID="$(az identity show \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${SQL_MIGRATION_IDENTITY_NAME}" \
  --query clientId \
  --output tsv)"
SQL_DATABASE_URL="sqlserver://${SQL_SERVER_NAME}.database.windows.net;database=${SQL_DATABASE_NAME};authentication=DefaultAzureCredential;encrypt=true;trustServerCertificate=false"
JOB_NAME="dbm-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}"
JOB_TEMPLATE_PATH="/tmp/prisma-migration-template.yaml"

test -n "${CONTAINER_APP_NAME}" || fail "Missing Container App."
test -n "${MANAGED_ENVIRONMENT_NAME}" || fail "Missing Container Apps environment."
test -n "${SQL_SERVER_NAME}" || fail "Missing Azure SQL server."
test -n "${SQL_DATABASE_NAME}" || fail "Missing Azure SQL database."
test -n "${SQL_MIGRATION_IDENTITY_NAME}" || fail "Missing SQL migration identity name."
test -n "${SQL_MIGRATION_IDENTITY_ID}" || fail "Missing SQL migration identity id."
test -n "${SQL_MIGRATION_IDENTITY_CLIENT_ID}" || fail "Missing SQL migration identity client id."

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

delete_job_if_exists "${JOB_NAME}"
write_job_template "${JOB_TEMPLATE_PATH}"

echo "Creating Prisma migration job ${JOB_NAME}."
az containerapp job create \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${JOB_NAME}" \
  --environment "${MANAGED_ENVIRONMENT_NAME}" \
  --trigger-type Manual \
  --replica-timeout 1800 \
  --replica-retry-limit 0 \
  --replica-completion-count 1 \
  --parallelism 1 \
  --container-name db-migration \
  --image "${IMAGE_REF}" \
  --cpu 0.5 \
  --memory 1.0Gi \
  --mi-user-assigned "${SQL_MIGRATION_IDENTITY_ID}" \
  "${registry_args[@]}" \
  --output none

echo "Starting Prisma migration job ${JOB_NAME}."
az containerapp job start \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${JOB_NAME}" \
  --yaml "${JOB_TEMPLATE_PATH}" \
  --output none

JOB_EXECUTION_NAME=""
for ((attempt = 1; attempt <= 18; attempt++)); do
  echo "Waiting for Prisma migration execution discovery (${attempt}/18)."
  JOB_EXECUTION_NAME="$(az containerapp job execution list \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${JOB_NAME}" \
    --query "sort_by(@,&properties.startTime)[-1].name" \
    --output tsv)"

  if [[ -n "${JOB_EXECUTION_NAME}" ]]; then
    break
  fi

  sleep 10
done

test -n "${JOB_EXECUTION_NAME}" || fail "Missing Prisma migration job execution."
echo "Following Prisma migration execution ${JOB_EXECUTION_NAME}."
wait_for_job_execution "${JOB_NAME}" "${JOB_EXECUTION_NAME}"
