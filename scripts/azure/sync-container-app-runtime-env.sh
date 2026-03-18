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

require_env "AZURE_RESOURCE_GROUP"
require_env "AZURE_APP_NAME"
require_env "PUBLIC_APP_URL"
require_env "ENTRA_CLIENT_ID"
require_env "ENTRA_TENANT_ID"

ARCADE_AUTH_MODE="${ARCADE_AUTH_MODE:-entra}"
ENTRA_AUTHORITY_TENANT="${ENTRA_AUTHORITY_TENANT:-${ENTRA_TENANT_ID}}"

derive_environment_names

container_app_name="$(
  resolve_existing_resource_name_by_type \
    'Microsoft.App/containerApps' \
    'Container App' \
    "${AZURE_EXPECTED_CONTAINER_APP_NAME}" \
    "${AZURE_LEGACY_CONTAINER_APP_NAME}"
)"

[[ -n "${container_app_name}" ]] || fail "Missing Container App in ${AZURE_RESOURCE_GROUP}."

key_vault_name="$(require_single_resource_name 'Microsoft.KeyVault/vaults' 'Key Vault')"
key_vault_uri="$(
  az keyvault show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${key_vault_name}" \
    --query properties.vaultUri \
    --output tsv
)"

[[ -n "${key_vault_uri}" ]] || fail "Unable to resolve Key Vault URI for ${key_vault_name}."

key_vault_uri="${key_vault_uri%/}/"

secret_args=(
  "arcade-session=keyvaultref:${key_vault_uri}secrets/arcade-session-secret,identityref:system"
  "database-url=keyvaultref:${key_vault_uri}secrets/database-url,identityref:system"
)

env_args=(
  "ARCADE_AUTH_MODE=${ARCADE_AUTH_MODE}"
  "PUBLIC_APP_URL=${PUBLIC_APP_URL}"
  "ARCADE_SESSION_SECRET=secretref:arcade-session"
  "DATABASE_URL=secretref:database-url"
)

if [[ "${ARCADE_AUTH_MODE}" == "entra" ]]; then
  secret_args+=("entra-client=keyvaultref:${key_vault_uri}secrets/entra-client-secret,identityref:system")
  env_args+=(
    "ENTRA_TENANT_ID=${ENTRA_TENANT_ID}"
    "ENTRA_AUTHORITY_TENANT=${ENTRA_AUTHORITY_TENANT}"
    "ENTRA_CLIENT_ID=${ENTRA_CLIENT_ID}"
    "ENTRA_CLIENT_SECRET=secretref:entra-client"
  )
fi

az containerapp secret set \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${container_app_name}" \
  --secrets "${secret_args[@]}" \
  --output none

az containerapp update \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${container_app_name}" \
  --set-env-vars "${env_args[@]}" \
  --output none

echo "Synced Container App ${container_app_name} runtime env from Key Vault-backed secrets."
