#!/usr/bin/env bash

resource_name_fail() {
  echo "$*" >&2
  return 1
}

derive_environment_names() {
  [[ -n "${AZURE_APP_NAME:-}" ]] || resource_name_fail "AZURE_APP_NAME is required."

  local suffix="${AZURE_RESOURCE_GROUP_SUFFIX:-}"

  AZURE_SCOPED_APP_NAME="${AZURE_APP_NAME}"
  if [[ -n "${suffix}" ]]; then
    AZURE_SCOPED_APP_NAME="${AZURE_APP_NAME}-${suffix}"
  fi

  AZURE_SCOPED_APP_NAME_LOWER="$(printf '%s' "${AZURE_SCOPED_APP_NAME}" | tr '[:upper:]' '[:lower:]')"
  AZURE_SCOPED_APP_NAME_COMPACT="${AZURE_SCOPED_APP_NAME_LOWER//-/}"

  AZURE_EXPECTED_LOG_ANALYTICS_WORKSPACE_NAME="law-${AZURE_SCOPED_APP_NAME}"
  AZURE_LEGACY_LOG_ANALYTICS_WORKSPACE_NAME="law-${AZURE_APP_NAME}"

  AZURE_EXPECTED_APPLICATION_INSIGHTS_NAME="appi-${AZURE_SCOPED_APP_NAME}"
  AZURE_LEGACY_APPLICATION_INSIGHTS_NAME="appi-${AZURE_APP_NAME}"

  AZURE_EXPECTED_VIRTUAL_NETWORK_NAME="vnet-${AZURE_SCOPED_APP_NAME}"
  AZURE_LEGACY_VIRTUAL_NETWORK_NAME="vnet-${AZURE_APP_NAME}"

  AZURE_EXPECTED_MANAGED_ENVIRONMENT_NAME="cae-${AZURE_SCOPED_APP_NAME}"
  AZURE_LEGACY_MANAGED_ENVIRONMENT_NAME="cae-${AZURE_APP_NAME}"

  AZURE_EXPECTED_CONTAINER_APP_NAME="ca-${AZURE_SCOPED_APP_NAME}"
  AZURE_LEGACY_CONTAINER_APP_NAME="ca-${AZURE_APP_NAME}"

  AZURE_EXPECTED_SQL_MIGRATION_IDENTITY_NAME="id-sql-migrate-${AZURE_SCOPED_APP_NAME}"
  AZURE_LEGACY_SQL_MIGRATION_IDENTITY_NAME="id-sql-migrate-${AZURE_APP_NAME}"

  AZURE_EXPECTED_SQL_BOOTSTRAP_IDENTITY_NAME="id-sql-bootstrap-${AZURE_SCOPED_APP_NAME}"
  AZURE_LEGACY_SQL_BOOTSTRAP_IDENTITY_NAME="id-sql-bootstrap-${AZURE_APP_NAME}"

  AZURE_EXPECTED_FRONT_DOOR_PROFILE_NAME="afd-${AZURE_SCOPED_APP_NAME}"
  AZURE_LEGACY_FRONT_DOOR_PROFILE_NAME="afd-${AZURE_APP_NAME}"

  AZURE_EXPECTED_FRONT_DOOR_ORIGIN_GROUP_NAME="og-${AZURE_SCOPED_APP_NAME}"
  AZURE_LEGACY_FRONT_DOOR_ORIGIN_GROUP_NAME="og-${AZURE_APP_NAME}"
}

list_resource_names_by_type() {
  local resource_type="$1"
  local resource_name=""

  [[ -n "${AZURE_RESOURCE_GROUP:-}" ]] || resource_name_fail "AZURE_RESOURCE_GROUP is required."

  while IFS= read -r resource_name; do
    [[ -n "${resource_name}" ]] || continue
    printf '%s\n' "${resource_name##*/}"
  done < <(
    az resource list \
      --resource-group "${AZURE_RESOURCE_GROUP}" \
      --resource-type "${resource_type}" \
      --query '[].name' \
      --output tsv
  )
}

resolve_existing_resource_name_by_type() {
  local resource_type="$1"
  local label="$2"
  shift 2

  local -a candidate_names=("$@")
  local -a active_names=()
  local active_name=""
  local candidate_name=""

  while IFS= read -r active_name; do
    [[ -n "${active_name}" ]] && active_names+=("${active_name}")
  done < <(list_resource_names_by_type "${resource_type}")

  for candidate_name in "${candidate_names[@]-}"; do
    [[ -n "${candidate_name}" ]] || continue
    for active_name in "${active_names[@]-}"; do
      if [[ "${active_name}" == "${candidate_name}" ]]; then
        printf '%s\n' "${active_name}"
        return 0
      fi
    done
  done

  if [[ "${#active_names[@]}" -eq 0 ]]; then
    return 0
  fi

  if [[ "${#active_names[@]}" -eq 1 ]]; then
    printf '%s\n' "${active_names[0]}"
    return 0
  fi

  resource_name_fail "Expected a single ${label} in ${AZURE_RESOURCE_GROUP} or one that matches the expected naming contract, found ${#active_names[@]}."
}

resolve_target_resource_name_by_type() {
  local resource_type="$1"
  local label="$2"
  shift 2

  local -a candidate_names=("$@")
  local fallback_name=""
  local active_name=""
  local candidate_name=""

  for candidate_name in "${candidate_names[@]-}"; do
    if [[ -n "${candidate_name}" ]]; then
      fallback_name="${candidate_name}"
      break
    fi
  done

  active_name="$(resolve_existing_resource_name_by_type "${resource_type}" "${label}" "${candidate_names[@]}")"
  if [[ -n "${active_name}" ]]; then
    printf '%s\n' "${active_name}"
    return 0
  fi

  printf '%s\n' "${fallback_name}"
}
