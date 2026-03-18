#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "$1" >&2
  exit 1
}

resolve_container_app_name() {
  if [[ -n "${AZURE_CONTAINER_APP_NAME:-}" ]]; then
    printf '%s\n' "${AZURE_CONTAINER_APP_NAME}"
    return
  fi

  if [[ -z "${AZURE_RESOURCE_GROUP:-}" ]]; then
    printf '%s\n' ''
    return
  fi

  local -a names=()

  while IFS= read -r resource_name; do
    [[ -n "${resource_name}" ]] && names+=("${resource_name}")
  done < <(az resource list \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --resource-type 'Microsoft.App/containerApps' \
    --query '[].name' \
    -o tsv)

  if [[ "${#names[@]}" -ne 1 ]]; then
    fail "Expected exactly one Container App in ${AZURE_RESOURCE_GROUP}, found ${#names[@]}."
  fi

  printf '%s\n' "${names[0]}"
}

if [[ -z "${CONTAINER_REGISTRY_SERVER:-}" ]]; then
  exit 0
fi

[[ -n "${AZURE_RESOURCE_GROUP:-}" ]] || fail "AZURE_RESOURCE_GROUP is required."

container_app_name="$(resolve_container_app_name)"

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
