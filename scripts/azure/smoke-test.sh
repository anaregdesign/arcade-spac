#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${APP_URL:-}" ]]; then
  echo "APP_URL is required."
  exit 1
fi

health_status="$(curl --silent --show-error --output /tmp/arcade-health-smoke.out --write-out '%{http_code}' --max-time 30 "${APP_URL%/}/health")"
if [[ "$health_status" != "200" ]]; then
  echo "Health endpoint returned ${health_status}."
  exit 1
fi

login_status="$(curl --silent --show-error --output /tmp/arcade-login-smoke.out --write-out '%{http_code}' --max-time 30 "${APP_URL%/}/login")"
if [[ "$login_status" != "200" ]]; then
  echo "Login route returned ${login_status}."
  exit 1
fi

if ! grep -qiE 'Arcade|Microsoft Entra ID|Sign in' /tmp/arcade-login-smoke.out; then
  echo "Login route did not render the expected sign-in content."
  exit 1
fi

auth_start_status="$(curl --silent --show-error --output /tmp/arcade-auth-start-smoke.out --dump-header /tmp/arcade-auth-start-smoke.headers --write-out '%{http_code}' --max-time 30 "${APP_URL%/}/auth/start?returnTo=%2Fhome")"
if [[ "$auth_start_status" != "302" ]]; then
  echo "Auth start route returned ${auth_start_status}."
  exit 1
fi

if ! tr -d '\r' </tmp/arcade-auth-start-smoke.headers | grep -qi 'login\.microsoftonline\.com/organizations/oauth2/v2\.0/authorize'; then
  echo "Auth start route did not redirect to the organizations authorization endpoint."
  exit 1
fi

echo "Smoke test passed for ${APP_URL%/}."
