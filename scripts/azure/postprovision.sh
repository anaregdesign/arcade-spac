#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/environment-resource-names.sh"

fail() {
  echo "$1" >&2
  exit 1
}

registry_identity_is_current() {
  local registries_payload="$1"
  local expected_server="$2"
  local expected_identity="$3"

  [[ -n "${registries_payload}" ]] || return 1

  CONTAINER_APP_REGISTRIES_PAYLOAD="${registries_payload}" python3 - "${expected_server}" "${expected_identity}" <<'PY'
import json
import os
import sys

expected_server = sys.argv[1]
expected_identity = sys.argv[2]
payload = json.loads(os.environ["CONTAINER_APP_REGISTRIES_PAYLOAD"])

for entry in payload or []:
    if entry.get("server") == expected_server and entry.get("identity") == expected_identity:
        raise SystemExit(0)

raise SystemExit(1)
PY
}

registry_basic_auth_is_current() {
  local registries_payload="$1"
  local secrets_payload="$2"
  local expected_server="$3"
  local expected_username="$4"
  local expected_password="$5"

  [[ -n "${registries_payload}" ]] || return 1
  [[ -n "${secrets_payload}" ]] || return 1

  CONTAINER_APP_REGISTRIES_PAYLOAD="${registries_payload}" \
  CONTAINER_APP_SECRETS_PAYLOAD="${secrets_payload}" \
  python3 - "${expected_server}" "${expected_username}" "${expected_password}" <<'PY'
import json
import os
import sys

expected_server = sys.argv[1]
expected_username = sys.argv[2]
expected_password = sys.argv[3]
registries = json.loads(os.environ["CONTAINER_APP_REGISTRIES_PAYLOAD"])
secrets = json.loads(os.environ["CONTAINER_APP_SECRETS_PAYLOAD"])

secret_values = {}
for secret in secrets or []:
    name = secret.get("name")
    if name:
        secret_values[name] = secret.get("value")

for entry in registries or []:
    if entry.get("server") != expected_server:
        continue
    if entry.get("username") != expected_username:
        continue

    secret_ref = (
        entry.get("passwordSecretRef")
        or entry.get("password_secret_ref")
        or entry.get("secretRef")
        or entry.get("secret_ref")
    )
    if secret_ref and secret_values.get(secret_ref) == expected_password:
        raise SystemExit(0)

raise SystemExit(1)
PY
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

container_app_registries="$(
  az containerapp show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${container_app_name}" \
    --query 'properties.configuration.registries' \
    --output json
)"

if [[ -n "${CONTAINER_REGISTRY_SERVER:-}" && -n "${CONTAINER_REGISTRY_IDENTITY:-}" ]]; then
  if registry_identity_is_current "${container_app_registries}" "${CONTAINER_REGISTRY_SERVER}" "${CONTAINER_REGISTRY_IDENTITY}"; then
    echo "Container App registry identity is already current for ${CONTAINER_REGISTRY_SERVER}."
    exit 0
  fi

  az containerapp registry set \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${container_app_name}" \
    --server "${CONTAINER_REGISTRY_SERVER}" \
    --identity "${CONTAINER_REGISTRY_IDENTITY}"
  exit 0
fi

if [[ -n "${CONTAINER_REGISTRY_SERVER:-}" && -n "${CONTAINER_REGISTRY_USERNAME:-}" && -n "${CONTAINER_REGISTRY_PASSWORD:-}" ]]; then
  container_app_secrets="$(
    az containerapp secret list \
      --resource-group "${AZURE_RESOURCE_GROUP}" \
      --name "${container_app_name}" \
      --show-values \
      --output json
  )"

  if registry_basic_auth_is_current \
    "${container_app_registries}" \
    "${container_app_secrets}" \
    "${CONTAINER_REGISTRY_SERVER}" \
    "${CONTAINER_REGISTRY_USERNAME}" \
    "${CONTAINER_REGISTRY_PASSWORD}"; then
    echo "Container App registry username/password configuration is already current for ${CONTAINER_REGISTRY_SERVER}."
    exit 0
  fi

  echo "Using registry username/password authentication. Prefer CONTAINER_REGISTRY_IDENTITY=system or a user-assigned managed identity resource id for ACR."
  az containerapp registry set \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${container_app_name}" \
    --server "${CONTAINER_REGISTRY_SERVER}" \
    --username "${CONTAINER_REGISTRY_USERNAME}" \
    --password "${CONTAINER_REGISTRY_PASSWORD}"
fi
