#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "$1" >&2
  exit 1
}

if [[ -z "${CONTAINER_REGISTRY_SERVER:-}" ]]; then
  exit 0
fi

[[ -n "${AZURE_RESOURCE_GROUP:-}" ]] || fail "AZURE_RESOURCE_GROUP is required."
[[ -n "${AZURE_APP_NAME:-}" ]] || fail "AZURE_APP_NAME is required."

container_app_name="ca-${AZURE_APP_NAME}"

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
