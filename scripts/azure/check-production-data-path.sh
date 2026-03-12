#!/usr/bin/env bash
set -euo pipefail

status=0

echo "Checking Arcade production data path prerequisites..."

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "- DATABASE_URL is not set."
  status=1
elif [[ "${DATABASE_URL}" == file:* ]]; then
  echo "- DATABASE_URL points to SQLite (${DATABASE_URL}). Hosted production requires a non-file relational database URL."
  status=1
else
  echo "- DATABASE_URL is set to a non-file value."
fi

if [[ "${ARCADE_AUTH_MODE:-local}" != "entra" ]]; then
  echo "- ARCADE_AUTH_MODE is not set to 'entra'. Hosted production should use Microsoft Entra ID."
  status=1
else
  echo "- ARCADE_AUTH_MODE is set to entra."
fi

if [[ -z "${PUBLIC_APP_URL:-}" ]]; then
  echo "- PUBLIC_APP_URL is not set."
  status=1
else
  echo "- PUBLIC_APP_URL is set to ${PUBLIC_APP_URL}."
fi

if [[ -z "${ARCADE_SESSION_SECRET:-}" ]]; then
  echo "- ARCADE_SESSION_SECRET is not set."
  status=1
else
  echo "- ARCADE_SESSION_SECRET is set."
fi

if [[ $status -ne 0 ]]; then
  echo "Production data path is not ready yet."
  exit $status
fi

echo "Production data path prerequisites are present."