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

echo "Smoke test passed for ${APP_URL%/}."