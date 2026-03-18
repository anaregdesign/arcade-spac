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

cleanup() {
  rm -f "${HEALTH_OUTPUT_FILE}" "${LOGIN_OUTPUT_FILE}" "${AUTH_OUTPUT_FILE}" "${AUTH_HEADERS_FILE}"
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
  exit 1
}

check_health() {
  local status
  status="$(curl --silent --show-error --output "${HEALTH_OUTPUT_FILE}" --write-out '%{http_code}' --max-time 30 "${APP_URL%/}/health")" || return 1
  [[ "${status}" == "200" ]]
}

check_login() {
  local status
  status="$(curl --silent --show-error --output "${LOGIN_OUTPUT_FILE}" --write-out '%{http_code}' --max-time 30 "${APP_URL%/}/login")" || return 1
  [[ "${status}" == "200" ]] || return 1
  grep -qiE 'Arcade|Microsoft Entra ID|Sign in' "${LOGIN_OUTPUT_FILE}"
}

check_auth_start() {
  local status
  status="$(curl --silent --show-error --output "${AUTH_OUTPUT_FILE}" --dump-header "${AUTH_HEADERS_FILE}" --write-out '%{http_code}' --max-time 30 "${APP_URL%/}/auth/start?returnTo=%2Fhome")" || return 1
  [[ "${status}" == "302" ]] || return 1
  tr -d '\r' <"${AUTH_HEADERS_FILE}" | grep -qi 'login\.microsoftonline\.com/organizations/oauth2/v2\.0/authorize'
}

trap cleanup EXIT

retry_until_success "Health endpoint did not return 200." check_health
retry_until_success "Login route did not render the expected sign-in content." check_login
retry_until_success "Auth start route did not redirect to the organizations authorization endpoint." check_auth_start

echo "Smoke test passed for ${APP_URL%/}."
