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
approval_retries="${FRONT_DOOR_PRIVATE_LINK_RETRIES:-30}"
approval_delay_seconds="${FRONT_DOOR_PRIVATE_LINK_DELAY_SECONDS:-10}"

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

managed_environment_id=""
for attempt in $(seq 1 "${approval_retries}"); do
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
    break
  fi

  sleep "${approval_delay_seconds}"
done

assert_deployment_still_actionable
[[ -n "${managed_environment_id}" ]] || fail "Unable to resolve the Container Apps environment ${managed_environment_name}."

connection_ids=()
for attempt in $(seq 1 "${approval_retries}"); do
  assert_deployment_still_actionable

  mapfile -t connection_ids < <(az network private-endpoint-connection list \
    --name "${managed_environment_name}" \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --type Microsoft.App/managedEnvironments \
    --query "[].id" \
    --output tsv 2>/dev/null || true)

  if [[ "${#connection_ids[@]}" -gt 0 ]]; then
    break
  fi

  sleep "${approval_delay_seconds}"
done

assert_deployment_still_actionable
[[ "${#connection_ids[@]}" -gt 0 ]] || fail "No Azure Front Door private endpoint connections were discovered for ${managed_environment_name}."

for connection_id in "${connection_ids[@]}"; do
  connection_status="$(
    az resource show \
      --ids "${connection_id}" \
      --query properties.privateLinkServiceConnectionState.status \
      --output tsv
  )"

  if [[ "${connection_status}" != "Approved" ]]; then
    az network private-endpoint-connection approve --id "${connection_id}" --output none
  fi
done

pending_count=""
for attempt in $(seq 1 "${approval_retries}"); do
  assert_deployment_still_actionable

  pending_count="$(
    az network private-endpoint-connection list \
      --name "${managed_environment_name}" \
      --resource-group "${AZURE_RESOURCE_GROUP}" \
      --type Microsoft.App/managedEnvironments \
      --query "[?properties.privateLinkServiceConnectionState.status!='Approved'] | length(@)" \
      --output tsv
  )"

  if [[ "${pending_count}" == "0" ]]; then
    break
  fi

  sleep "${approval_delay_seconds}"
done

assert_deployment_still_actionable
[[ "${pending_count}" == "0" ]] || fail "Azure Front Door private endpoint connections are still pending approval."
