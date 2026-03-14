#!/usr/bin/env bash
set -euo pipefail

status=0

echo "Checking Arcade production data path prerequisites..."

if [[ -z "${AZURE_APPCONFIG_ENDPOINT:-}" ]]; then
  echo "- AZURE_APPCONFIG_ENDPOINT is not set."
  status=1
else
  echo "- AZURE_APPCONFIG_ENDPOINT is set."
fi

if [[ -z "${AZURE_KEY_VAULT_URI:-}" ]]; then
  echo "- AZURE_KEY_VAULT_URI is not set."
  status=1
else
  echo "- AZURE_KEY_VAULT_URI is set."
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

if [[ -z "${ENTRA_TENANT_ID:-}" ]]; then
  echo "- ENTRA_TENANT_ID is not set."
  status=1
else
  echo "- ENTRA_TENANT_ID is set."
fi

if [[ -z "${ENTRA_CLIENT_ID:-}" ]]; then
  echo "- ENTRA_CLIENT_ID is not set."
  status=1
else
  echo "- ENTRA_CLIENT_ID is set."
fi

if [[ -z "${ENTRA_CLIENT_SECRET:-}" ]]; then
  echo "- ENTRA_CLIENT_SECRET is not set."
  status=1
else
  echo "- ENTRA_CLIENT_SECRET is set."
fi

if [[ -z "${ARCADE_SESSION_SECRET:-}" ]]; then
  echo "- ARCADE_SESSION_SECRET is not set."
  status=1
else
  echo "- ARCADE_SESSION_SECRET is set."
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  if [[ -n "${ARCADE_SQL_SERVER_FQDN:-}" || -n "${ARCADE_SQL_SERVER_NAME:-}" || -n "${AZURE_RESOURCE_GROUP:-}" ]]; then
    echo "- DATABASE_URL is not set directly, but the Bicep-managed Azure SQL path can derive it from Azure metadata."
  else
    echo "- DATABASE_URL is not set, and no Azure SQL metadata is available to derive it."
    status=1
  fi
else
  echo "- DATABASE_URL is set explicitly."

  if [[ "${DATABASE_URL}" == file:* ]]; then
    echo "- DATABASE_URL points to SQLite (${DATABASE_URL}). Hosted production requires a non-file relational database URL."
    status=1
  fi

  database_url_lower="$(printf '%s' "${DATABASE_URL}" | tr '[:upper:]' '[:lower:]')"

  if [[ "${database_url_lower}" == *"password="* ]]; then
    echo "- DATABASE_URL still includes a password-based SQL login. Hosted production should use Entra-backed auth instead."
    status=1
  fi

  if [[ "${database_url_lower}" == *".database.windows.net"* ]] \
    && [[ "${database_url_lower}" != *"authentication=activedirectorymanagedidentity"* ]] \
    && [[ "${database_url_lower}" != *"authentication=defaultazurecredential"* ]]; then
    echo "- DATABASE_URL does not use a supported Entra-backed Azure SQL authentication mode."
    status=1
  fi
fi

if [[ $status -ne 0 ]]; then
  echo "Production data path is not ready yet."
  exit $status
fi

echo "Production data path prerequisites are present."
