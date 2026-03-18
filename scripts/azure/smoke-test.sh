#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${APP_URL:-}" ]]; then
  echo "APP_URL is required."
  exit 1
fi

SMOKE_TEST_RETRIES="${SMOKE_TEST_RETRIES:-18}"
SMOKE_TEST_DELAY_SECONDS="${SMOKE_TEST_DELAY_SECONDS:-10}"
HEALTH_OUTPUT_FILE="$(mktemp)"
LOGIN_OUTPUT_FILE="$(mktemp)"
AUTH_OUTPUT_FILE="$(mktemp)"
AUTH_HEADERS_FILE="$(mktemp)"
LAST_FAILURE_DETAILS=""

cleanup() {
  rm -f "${HEALTH_OUTPUT_FILE}" "${LOGIN_OUTPUT_FILE}" "${AUTH_OUTPUT_FILE}" "${AUTH_HEADERS_FILE}"
}

preview_file() {
  local file_path="$1"
  local file_size
  local preview_limit=600

  if [[ -s "${file_path}" ]]; then
    file_size="$(wc -c < "${file_path}" | tr -d ' ')"
    head -c "${preview_limit}" "${file_path}"

    if [[ "${file_size}" -gt "${preview_limit}" ]]; then
      printf '\n<truncated>'
    else
      printf '\n'
    fi

    return
  fi

  echo "<empty>"
}

record_failure_details() {
  LAST_FAILURE_DETAILS="$1"
}

retry_until_success() {
  local failure_message="$1"
  shift
  local attempt

  for attempt in $(seq 1 "${SMOKE_TEST_RETRIES}"); do
    if "$@"; then
      return 0
    fi

    if [[ "${attempt}" -lt "${SMOKE_TEST_RETRIES}" ]]; then
      sleep "${SMOKE_TEST_DELAY_SECONDS}"
    fi
  done

  echo "${failure_message}"
  if [[ -n "${LAST_FAILURE_DETAILS}" ]]; then
    printf '%s\n' "${LAST_FAILURE_DETAILS}"
  fi
  exit 1
}

check_health() {
  local status
  status="$(curl --silent --show-error --output "${HEALTH_OUTPUT_FILE}" --write-out '%{http_code}' --max-time 30 "${APP_URL%/}/health")" || {
    record_failure_details "Health check request failed before a response was received."
    return 1
  }

  if [[ "${status}" != "200" ]]; then
    record_failure_details "$(printf 'Health check returned HTTP %s.\nResponse preview:\n%s' "${status}" "$(preview_file "${HEALTH_OUTPUT_FILE}")")"
    return 1
  fi

  return 0
}

check_login() {
  local status
  status="$(curl --silent --show-error --output "${LOGIN_OUTPUT_FILE}" --write-out '%{http_code}' --max-time 30 "${APP_URL%/}/login")" || {
    record_failure_details "Login route request failed before a response was received."
    return 1
  }

  if [[ "${status}" != "200" ]]; then
    record_failure_details "$(printf 'Login route returned HTTP %s.\nResponse preview:\n%s' "${status}" "$(preview_file "${LOGIN_OUTPUT_FILE}")")"
    return 1
  fi

  if ! grep -qiE 'Arcade|Microsoft Entra ID|Sign in' "${LOGIN_OUTPUT_FILE}"; then
    record_failure_details "$(printf 'Login route returned HTTP %s but the expected sign-in content was missing.\nResponse preview:\n%s' "${status}" "$(preview_file "${LOGIN_OUTPUT_FILE}")")"
    return 1
  fi

  return 0
}

check_auth_start() {
  local status
  status="$(curl --silent --show-error --output "${AUTH_OUTPUT_FILE}" --dump-header "${AUTH_HEADERS_FILE}" --write-out '%{http_code}' --max-time 30 "${APP_URL%/}/auth/start?returnTo=%2Fhome")" || {
    record_failure_details "Auth start request failed before a response was received."
    return 1
  }

  if [[ "${status}" != "302" ]]; then
    record_failure_details "$(printf 'Auth start route returned HTTP %s.\nHeaders preview:\n%s' "${status}" "$(preview_file "${AUTH_HEADERS_FILE}")")"
    return 1
  fi

  if ! tr -d '\r' <"${AUTH_HEADERS_FILE}" | grep -qi 'login\.microsoftonline\.com/organizations/oauth2/v2\.0/authorize'; then
    record_failure_details "$(printf 'Auth start route did not redirect to the organizations authorization endpoint.\nHeaders preview:\n%s' "$(preview_file "${AUTH_HEADERS_FILE}")")"
    return 1
  fi

  return 0
}

trap cleanup EXIT

retry_until_success "Health endpoint did not return 200." check_health
retry_until_success "Login route did not render the expected sign-in content." check_login
retry_until_success "Auth start route did not redirect to the organizations authorization endpoint." check_auth_start

echo "Smoke test passed for ${APP_URL%/}."
