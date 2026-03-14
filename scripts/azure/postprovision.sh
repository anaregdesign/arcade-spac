#!/usr/bin/env bash
set -euo pipefail

resolve_container_app_name() {
  if [[ -n "${AZURE_CONTAINER_APP_NAME:-}" ]]; then
    printf '%s\n' "${AZURE_CONTAINER_APP_NAME}"
    return
  fi

  if [[ -n "${AZURE_APP_NAME:-}" ]]; then
    printf 'ca-%s\n' "${AZURE_APP_NAME}"
    return
  fi

  printf '%s\n' ''
}

container_app_name="$(resolve_container_app_name)"

if [[ -z "${AZURE_RESOURCE_GROUP:-}" || -z "${container_app_name}" ]]; then
  echo "Skipping registry configuration because AZURE_RESOURCE_GROUP or the Container App name contract is unset."
  exit 0
fi

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
