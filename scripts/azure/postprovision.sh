#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/environment-resource-names.sh"

fail() {
  echo "$1" >&2
  exit 1
}

if [[ -z "${CONTAINER_REGISTRY_SERVER:-}" ]]; then
  exit 0
fi

[[ -n "${AZURE_RESOURCE_GROUP:-}" ]] || fail "AZURE_RESOURCE_GROUP is required."
[[ -n "${AZURE_APP_NAME:-}" ]] || fail "AZURE_APP_NAME is required."

derive_environment_names

container_app_name="$(
  resolve_existing_resource_name_by_type \
    'Microsoft.App/containerApps' \
    'Container App' \
    "$AZURE_EXPECTED_CONTAINER_APP_NAME" \
    "$AZURE_LEGACY_CONTAINER_APP_NAME"
)"

[[ -n "${container_app_name}" ]] || fail "Missing Container App in ${AZURE_RESOURCE_GROUP}."

if [[ -n "${CONTAINER_REGISTRY_SERVER:-}" && -n "${CONTAINER_REGISTRY_IDENTITY:-}" ]]; then
  az containerapp registry set \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${container_app_name}" \
    --server "${CONTAINER_REGISTRY_SERVER}" \
    --identity "${CONTAINER_REGISTRY_IDENTITY}"
  exit 0
fi

if [[ -n "${CONTAINER_REGISTRY_SERVER:-}" && -n "${CONTAINER_REGISTRY_USERNAME:-}" && -n "${CONTAINER_REGISTRY_PASSWORD:-}" ]]; then
  echo "Using registry username/password authentication. Prefer CONTAINER_REGISTRY_IDENTITY=system or a user-assigned managed identity resource id for ACR."
  az containerapp registry set \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${container_app_name}" \
    --server "${CONTAINER_REGISTRY_SERVER}" \
    --username "${CONTAINER_REGISTRY_USERNAME}" \
    --password "${CONTAINER_REGISTRY_PASSWORD}"
fi
