#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/environment-resource-names.sh"

fail() {
  echo "$1" >&2
  exit 1
}

[[ -n "${AZURE_RESOURCE_GROUP:-}" ]] || fail "AZURE_RESOURCE_GROUP is required."
[[ -n "${AZURE_APP_NAME:-}" ]] || fail "AZURE_APP_NAME is required."
[[ -n "${DEPLOYMENT_NAME:-}" ]] || fail "DEPLOYMENT_NAME is required."

derive_environment_names

managed_environment_name="${MANAGED_ENVIRONMENT_NAME:-$(
  resolve_target_resource_name_by_type \
    'Microsoft.App/managedEnvironments' \
    'Container Apps environment' \
    "$AZURE_EXPECTED_MANAGED_ENVIRONMENT_NAME" \
    "$AZURE_LEGACY_MANAGED_ENVIRONMENT_NAME"
)}"
approval_delay_seconds="${FRONT_DOOR_PRIVATE_LINK_DELAY_SECONDS:-10}"
approval_max_wait_seconds="${FRONT_DOOR_PRIVATE_LINK_MAX_WAIT_SECONDS:-3600}"

[[ "${approval_delay_seconds}" =~ ^[0-9]+$ ]] || fail "FRONT_DOOR_PRIVATE_LINK_DELAY_SECONDS must be an integer."
[[ "${approval_max_wait_seconds}" =~ ^[0-9]+$ ]] || fail "FRONT_DOOR_PRIVATE_LINK_MAX_WAIT_SECONDS must be an integer."
(( approval_delay_seconds > 0 )) || fail "FRONT_DOOR_PRIVATE_LINK_DELAY_SECONDS must be greater than zero."
(( approval_max_wait_seconds > 0 )) || fail "FRONT_DOOR_PRIVATE_LINK_MAX_WAIT_SECONDS must be greater than zero."

deadline_epoch="$(( $(date +%s) + approval_max_wait_seconds ))"

current_deployment_state() {
  az deployment group show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${DEPLOYMENT_NAME}" \
    --query properties.provisioningState \
    --output tsv 2>/dev/null || true
}

report_failed_deployment() {
  local deployment_state="$1"

  az deployment operation group list \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${DEPLOYMENT_NAME}" \
    --query "[?properties.provisioningState!='Succeeded'].{resource:properties.targetResource.resourceName,type:properties.targetResource.resourceType,state:properties.provisioningState,status:properties.statusMessage}" \
    --output json

  fail "Infrastructure deployment ${DEPLOYMENT_NAME} finished with state: ${deployment_state}"
}

assert_deployment_still_actionable() {
  local deployment_state
  deployment_state="$(current_deployment_state)"

  if [[ "${deployment_state}" == "Failed" || "${deployment_state}" == "Canceled" ]]; then
    report_failed_deployment "${deployment_state}"
  fi
}

sleep_until_next_poll() {
  local now_epoch
  local remaining_seconds

  now_epoch="$(date +%s)"
  remaining_seconds="$(( deadline_epoch - now_epoch ))"

  if (( remaining_seconds <= 0 )); then
    return 1
  fi

  if (( remaining_seconds < approval_delay_seconds )); then
    sleep "${remaining_seconds}"
    return 0
  fi

  sleep "${approval_delay_seconds}"
}

approve_connection() {
  local connection_id="$1"
  local error_file=""

  error_file="$(mktemp)"
  if az network private-endpoint-connection approve --id "${connection_id}" --output none 2>"${error_file}"; then
    rm -f "${error_file}"
    return 0
  fi

  if grep -qiE 'PrivateEndpointConnectionLockConflict|another operation is in progress' "${error_file}"; then
    echo "Private endpoint connection ${connection_id} is locked by another Azure operation; retrying."
    rm -f "${error_file}"
    return 0
  fi

  cat "${error_file}" >&2
  rm -f "${error_file}"
  return 1
}

managed_environment_id=""
connection_ids=()
discovered_connections=false

while true; do
  assert_deployment_still_actionable

  managed_environment_id="$(
    az resource show \
      --resource-group "${AZURE_RESOURCE_GROUP}" \
      --resource-type Microsoft.App/managedEnvironments \
      --name "${managed_environment_name}" \
      --query id \
      --output tsv 2>/dev/null || true
  )"

  if [[ -n "${managed_environment_id}" ]]; then
    mapfile -t connection_ids < <(az network private-endpoint-connection list \
      --name "${managed_environment_name}" \
      --resource-group "${AZURE_RESOURCE_GROUP}" \
      --type Microsoft.App/managedEnvironments \
      --query "[].id" \
      --output tsv 2>/dev/null || true)

    if [[ "${#connection_ids[@]}" -gt 0 ]]; then
      discovered_connections=true
      pending_count="0"

      for connection_id in "${connection_ids[@]}"; do
        connection_status="$(
          az resource show \
            --ids "${connection_id}" \
            --query properties.privateLinkServiceConnectionState.status \
            --output tsv
        )"

        if [[ "${connection_status}" == "Approved" ]]; then
          continue
        fi

        pending_count="$((pending_count + 1))"
        approve_connection "${connection_id}" || fail "Failed to approve Azure Front Door private endpoint connection ${connection_id}."
      done

      pending_count="$(
        az network private-endpoint-connection list \
          --name "${managed_environment_name}" \
          --resource-group "${AZURE_RESOURCE_GROUP}" \
          --type Microsoft.App/managedEnvironments \
          --query "[?properties.privateLinkServiceConnectionState.status!='Approved'] | length(@)" \
          --output tsv
      )"

      if [[ "${pending_count}" == "0" ]]; then
        echo "Approved Azure Front Door private endpoint connections for ${managed_environment_name}."
        break
      fi
    fi
  fi

  deployment_state="$(current_deployment_state)"
  if [[ "${deployment_state}" == "Succeeded" ]]; then
    if [[ -z "${managed_environment_id}" ]]; then
      fail "Infrastructure deployment ${DEPLOYMENT_NAME} succeeded but the Container Apps environment ${managed_environment_name} was not found."
    fi

    if [[ "${discovered_connections}" != "true" ]]; then
      fail "Infrastructure deployment ${DEPLOYMENT_NAME} succeeded but no Azure Front Door private endpoint connections were discovered for ${managed_environment_name}."
    fi
  fi

  sleep_until_next_poll || break
done

assert_deployment_still_actionable

if [[ -z "${managed_environment_id}" ]]; then
  fail "Timed out after ${approval_max_wait_seconds}s waiting for Container Apps environment ${managed_environment_name} while deployment ${DEPLOYMENT_NAME} remained in progress."
fi

if [[ "${discovered_connections}" != "true" ]]; then
  fail "Timed out after ${approval_max_wait_seconds}s waiting for Azure Front Door private endpoint connections for ${managed_environment_name}."
fi

pending_count="$(
  az network private-endpoint-connection list \
    --name "${managed_environment_name}" \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --type Microsoft.App/managedEnvironments \
    --query "[?properties.privateLinkServiceConnectionState.status!='Approved'] | length(@)" \
    --output tsv
)"

[[ "${pending_count}" == "0" ]] || fail "Timed out after ${approval_max_wait_seconds}s with Azure Front Door private endpoint connections still pending approval for ${managed_environment_name}."
