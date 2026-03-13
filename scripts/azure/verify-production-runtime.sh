#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${AZURE_RESOURCE_GROUP:-}" ]]; then
  echo "AZURE_RESOURCE_GROUP is required."
  exit 1
fi

if [[ -z "${APP_URL:-}" ]]; then
  if [[ -z "${AZURE_CONTAINER_APP_NAME:-}" ]]; then
    echo "APP_URL or AZURE_CONTAINER_APP_NAME is required."
    exit 1
  fi

  container_app_fqdn="$(az containerapp show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${AZURE_CONTAINER_APP_NAME}" \
    --query properties.configuration.ingress.fqdn \
    -o tsv)"

  if [[ -z "${container_app_fqdn}" ]]; then
    echo "Unable to resolve the Container App FQDN."
    exit 1
  fi

  APP_URL="https://${container_app_fqdn}"
fi

sql_server_name="${AZURE_SQL_SERVER_NAME:-}"
if [[ -z "${sql_server_name}" ]]; then
  sql_servers=()
  while IFS= read -r sql_server; do
    [[ -n "${sql_server}" ]] && sql_servers+=("${sql_server}")
  done < <(az sql server list \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --query '[].name' \
    -o tsv)

  if [[ "${#sql_servers[@]}" -ne 1 ]]; then
    echo "Expected exactly one Azure SQL server in ${AZURE_RESOURCE_GROUP}, found ${#sql_servers[@]}."
    exit 1
  fi

  sql_server_name="${sql_servers[0]}"
fi

expected_public_network_access="${EXPECTED_SQL_PUBLIC_NETWORK_ACCESS:-Enabled}"
actual_public_network_access="$(az sql server show \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${sql_server_name}" \
  --query publicNetworkAccess \
  -o tsv)"

if [[ "${actual_public_network_access}" != "${expected_public_network_access}" ]]; then
  echo "Azure SQL server ${sql_server_name} publicNetworkAccess is ${actual_public_network_access}, expected ${expected_public_network_access}."
  exit 1
fi

if [[ "${expected_public_network_access}" == "Enabled" ]]; then
  allow_azure_services_range="$(az sql server firewall-rule show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --server "${sql_server_name}" \
    --name AllowAzureServices \
    --query "join(',', [startIpAddress, endIpAddress])" \
    -o tsv 2>/dev/null)"

  if [[ "${allow_azure_services_range}" != "0.0.0.0,0.0.0.0" ]]; then
    echo "Azure SQL server ${sql_server_name} is missing the AllowAzureServices firewall rule."
    exit 1
  fi
fi

if [[ -n "${AZURE_CONTAINER_APP_NAME:-}" ]]; then
  container_app_status="$(az containerapp show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${AZURE_CONTAINER_APP_NAME}" \
    --query properties.runningStatus \
    -o tsv)"

  if [[ "${container_app_status}" != "Running" ]]; then
    echo "Container App ${AZURE_CONTAINER_APP_NAME} is ${container_app_status}."
    exit 1
  fi
fi

echo "Verified Azure SQL network contract for ${sql_server_name}."
APP_URL="${APP_URL}" ./scripts/azure/smoke-test.sh
