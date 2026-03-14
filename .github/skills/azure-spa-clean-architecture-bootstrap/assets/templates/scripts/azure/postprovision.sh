#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${AZURE_RESOURCE_GROUP:-}" || -z "${AZURE_CONTAINER_APP_NAME:-}" ]]; then
  echo "Skipping registry configuration because AZURE_RESOURCE_GROUP or AZURE_CONTAINER_APP_NAME is unset."
  exit 0
fi

if [[ -n "${CONTAINER_REGISTRY_SERVER:-}" && -n "${CONTAINER_REGISTRY_IDENTITY:-}" ]]; then
  az containerapp registry set \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${AZURE_CONTAINER_APP_NAME}" \
    --server "${CONTAINER_REGISTRY_SERVER}" \
    --identity "${CONTAINER_REGISTRY_IDENTITY}"
  exit 0
fi

if [[ -n "${CONTAINER_REGISTRY_SERVER:-}" && -n "${CONTAINER_REGISTRY_USERNAME:-}" && -n "${CONTAINER_REGISTRY_PASSWORD:-}" ]]; then
  echo "Using registry username/password authentication. Prefer CONTAINER_REGISTRY_IDENTITY=system or a user-assigned managed identity resource id for ACR."
  az containerapp registry set \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${AZURE_CONTAINER_APP_NAME}" \
    --server "${CONTAINER_REGISTRY_SERVER}" \
    --username "${CONTAINER_REGISTRY_USERNAME}" \
    --password "${CONTAINER_REGISTRY_PASSWORD}"
fi
