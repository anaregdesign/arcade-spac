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

append_output() {
  local key="$1"
  local value="$2"

  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    printf '%s=%s\n' "${key}" "${value}" >> "${GITHUB_OUTPUT}"
  fi
}

require_env "AZURE_RESOURCE_GROUP"
require_env "AZURE_APP_NAME"
require_env "IMAGE_REF"

derive_environment_names

container_app_name="$(
  resolve_existing_resource_name_by_type \
    'Microsoft.App/containerApps' \
    'Container App' \
    "${AZURE_EXPECTED_CONTAINER_APP_NAME}" \
    "${AZURE_LEGACY_CONTAINER_APP_NAME}"
)"

[[ -n "${container_app_name}" ]] || fail "Missing Container App in ${AZURE_RESOURCE_GROUP}."

current_image_ref="$(
  az containerapp show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${container_app_name}" \
    --query 'properties.template.containers[0].image' \
    --output tsv
)"

force_update="${FORCE_CONTAINER_APP_UPDATE:-false}"
if [[ "${current_image_ref}" == "${IMAGE_REF}" && "${force_update}" != "true" ]]; then
  echo "Container App ${container_app_name} already uses ${IMAGE_REF}; skipping image rollout."
  append_output "container_app_rollout" "skipped"
  exit 0
fi

az containerapp update \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${container_app_name}" \
  --image "${IMAGE_REF}" \
  --output none

append_output "container_app_rollout" "updated"
if [[ "${current_image_ref}" == "${IMAGE_REF}" ]]; then
  echo "Rolled Container App ${container_app_name} to refresh runtime after config drift."
else
  echo "Updated Container App ${container_app_name} image from ${current_image_ref} to ${IMAGE_REF}."
fi
