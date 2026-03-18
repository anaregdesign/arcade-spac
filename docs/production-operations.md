# Production Operations

This runbook records the repository-side production contract for Arcade on Azure and the minimum commands needed for smoke checks, rollback, and first-line troubleshooting after a GitHub-workflow deployment.

## Repository Target Contract

- Resource group: `rg-arcade-spec-dev`
- Container App: `ca-arcade`
- Container Apps environment: `cae-arcade`
- Azure Front Door profile: `afd-arcade`
- Public app URL: Azure Front Door endpoint host or the final custom domain
- App ingress: external through Azure Front Door
- Container Apps environment exposure: VNet-integrated delegated subnet with `publicNetworkAccess=Disabled`
- Azure SQL: `Microsoft Entra ID` only auth, `publicNetworkAccess=Disabled`, `Private Endpoint`, and `privatelink.database.windows.net`
- App Configuration and Key Vault: private endpoint backed hosted access
- Runtime bootstrap: `AZURE_APPCONFIG_ENDPOINT` and `AZURE_KEY_VAULT_URI` env values, `Arcade:` App Configuration keys, and Key Vault references for secrets
- Health route: `/health`
- Release workflow shape: `publish` -> `plan_infra` -> `deploy_infra` -> `deploy_app` -> `smoke_test`
- Verification scripts:
  - `scripts/azure/sync-runtime-config.sh`
  - `scripts/azure/smoke-test.sh`
  - `scripts/azure/verify-production-runtime.sh`

## Current Verification Status

- The repository contract was updated on March 14, 2026 to prefer Azure SQL private connectivity and `Entra-only` auth.
- The repository contract was updated on March 18, 2026 to publish through Azure Front Door Premium with a private-link origin to Azure Container Apps.
- The repository contract now expects runtime config to be synced into private App Configuration and Key Vault before image rollout.
- The repository release workflow now passes `manageRuntimeRoleAssignments=false`, so runtime App Configuration and Key Vault RBAC must be bootstrapped separately from day-to-day releases.
- This workspace did not perform a production or shared-environment deployment.
- After the next GitHub release deployment, refresh this file with the exact live Front Door host, image tag, revision, and any cloud-side deviations from the target contract.

## Repository Rename Note

- The canonical repository slug is `anaregdesign/arcade-spec`.
- Release workflows publish GHCR images under `ghcr.io/anaregdesign/arcade-spec`.
- Keep rollback metadata aligned with the latest successful release after each deployment.

## Rollback Guidance

- Roll back by redeploying the previous known-good immutable release tag through the existing Container App image update path.
- Do not restore Azure SQL public access or the `AllowAzureServices` firewall rule as a rollback shortcut.
- Keep the private-network contract intact while restoring the previous application image.
- Re-run post-release checks through the Azure Front Door URL after rollback.

Rollback command:

```bash
az containerapp update \
  --resource-group rg-arcade-spec-dev \
  --name ca-arcade \
  --image ghcr.io/anaregdesign/arcade-spec:<known-good-tag>
```

## Post-Release Smoke Procedure

Pre-release requirement:

1. Confirm the `Quality Gates` workflow passed for the release target commit.
2. Run `npm run azure:check:production-data`.
3. Resolve the Azure Front Door endpoint host and set `PUBLIC_APP_URL` to that URL or the final custom domain URL.
4. Update the Microsoft Entra app registration redirect URI to `${PUBLIC_APP_URL}/auth/callback`.
5. Run `npm run azure:sync:runtime-config` from a host that can reach the private App Configuration and Key Vault data plane.
6. Publish the release so the GitHub workflow deploys the image.

Post-release checks:

1. Confirm the GitHub release workflow completed successfully through `publish`, `plan_infra`, `deploy_infra`, `deploy_app`, and `smoke_test`.
2. Confirm `plan_infra` reported the expected infra status and that `deploy_infra` was skipped for app-only releases.
3. Confirm `deploy_infra` approved the Azure Front Door private endpoint connections for the managed environment.
4. Confirm the Container App image and latest ready revision match the intended release.
5. Run the health endpoint check through Azure Front Door.
6. Run `scripts/azure/verify-production-runtime.sh`.
7. Run the scripted smoke test through Azure Front Door. When the release changed Front Door or private-link infrastructure, use the script's extended retry budget instead of treating the first few minutes as a hard failure.
8. Verify hosted sign-in, gameplay, result, rankings, and profile screens in a browser.

Commands:

```bash
FRONT_DOOR_ENDPOINT_ID="$(az resource list \
  -g rg-arcade-spec-dev \
  --resource-type Microsoft.Cdn/profiles/afdEndpoints \
  --query '[0].id' \
  -o tsv)"

PUBLIC_APP_URL="https://$(az resource show \
  --ids "${FRONT_DOOR_ENDPOINT_ID}" \
  --query properties.hostName \
  -o tsv)"

npm run azure:check:production-data

AZURE_APPCONFIG_ENDPOINT="https://<app-config-name>.azconfig.io" \
AZURE_KEY_VAULT_URI="https://<key-vault-name>.vault.azure.net/" \
PUBLIC_APP_URL="${PUBLIC_APP_URL}" \
ARCADE_AUTH_MODE="entra" \
ENTRA_TENANT_ID="<tenant-id>" \
ENTRA_CLIENT_ID="<client-id>" \
ENTRA_CLIENT_SECRET="<client-secret>" \
ARCADE_SESSION_SECRET="<session-secret>" \
AZURE_RESOURCE_GROUP="rg-arcade-spec-dev" \
  npm run azure:sync:runtime-config

curl -sS "${PUBLIC_APP_URL}/health"

APP_URL="${PUBLIC_APP_URL}" \
  ./scripts/azure/smoke-test.sh

APP_URL="${PUBLIC_APP_URL}" \
SMOKE_TEST_RETRIES=90 \
  ./scripts/azure/smoke-test.sh

AZURE_RESOURCE_GROUP="rg-arcade-spec-dev" \
AZURE_APP_NAME="arcade" \
  ./scripts/azure/verify-production-runtime.sh

az containerapp show \
  -g rg-arcade-spec-dev \
  -n ca-arcade \
  --query '{image:properties.template.containers[0].image,latestRevision:properties.latestRevisionName,latestReadyRevision:properties.latestReadyRevisionName}'

curl -i -sS "${PUBLIC_APP_URL}/auth/start?returnTo=%2Fhome"
```

## Troubleshooting Entry Points

- Azure Front Door host and enabled state:

```bash
FRONT_DOOR_ENDPOINT_ID="$(az resource list \
  -g rg-arcade-spec-dev \
  --resource-type Microsoft.Cdn/profiles/afdEndpoints \
  --query '[0].id' \
  -o tsv)"

az resource show \
  --ids "${FRONT_DOOR_ENDPOINT_ID}" \
  --query '{hostName:properties.hostName,enabledState:properties.enabledState}'
```

- Azure Front Door private-link approval state:

```bash
az network private-endpoint-connection list \
  --name cae-arcade \
  --resource-group rg-arcade-spec-dev \
  --type Microsoft.App/managedEnvironments \
  --query "[?properties.privateLinkServiceConnectionState.description=='AFD Private Link Request'].{status:properties.privateLinkServiceConnectionState.status,id:id}"
```

- Revision state and image drift:

```bash
az containerapp revision list -g rg-arcade-spec-dev -n ca-arcade -o table
```

- Container App configuration snapshot:

```bash
az containerapp show -g rg-arcade-spec-dev -n ca-arcade -o json
```

- Container Apps environment VNet integration and exposure:

```bash
az containerapp env show \
  -g rg-arcade-spec-dev \
  -n cae-arcade \
  --query '{infrastructureSubnetId:properties.vnetConfiguration.infrastructureSubnetId,publicNetworkAccess:properties.publicNetworkAccess}'
```

- Azure SQL `Entra-only` auth and admin state:

```bash
az sql server ad-only-auth get \
  -g rg-arcade-spec-dev \
  -s sql-arcade-qddhfw4moexbm

az sql server ad-admin list \
  -g rg-arcade-spec-dev \
  -s sql-arcade-qddhfw4moexbm
```

- Azure SQL network contract:

```bash
az sql server show \
  -g rg-arcade-spec-dev \
  -n sql-arcade-qddhfw4moexbm \
  --query '{publicNetworkAccess:publicNetworkAccess}'

az resource list \
  -g rg-arcade-spec-dev \
  --resource-type Microsoft.Network/privateEndpoints \
  --query "[?contains(properties.privateLinkServiceConnections[0].properties.privateLinkServiceId, '/providers/Microsoft.Sql/servers/sql-arcade-qddhfw4moexbm')].name"

az network private-dns record-set a list \
  -g rg-arcade-spec-dev \
  -z privatelink.database.windows.net \
  --query "[?name=='sql-arcade-qddhfw4moexbm'].arecords[].ipv4Address"
```

- App Configuration and Key Vault private-access contract:

```bash
az resource list \
  -g rg-arcade-spec-dev \
  --resource-type Microsoft.AppConfiguration/configurationStores \
  --query '[].{name:name,publicNetworkAccess:properties.publicNetworkAccess}'

az resource list \
  -g rg-arcade-spec-dev \
  --resource-type Microsoft.KeyVault/vaults \
  --query '[].{name:name,publicNetworkAccess:properties.publicNetworkAccess}'
```

- Schema drift confirmation:

```bash
sqlcmd -S sql-arcade-qddhfw4moexbm.database.windows.net -d arcade -G -Q "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'UserProfile' ORDER BY ORDINAL_POSITION;"

sqlcmd -S sql-arcade-qddhfw4moexbm.database.windows.net -d arcade -G -Q "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PlayResult' AND COLUMN_NAME = 'shareToken';"
```

## Operational Notes

- A previous outage on March 14, 2026 was caused by drift between the runtime's dependency on the Azure SQL public endpoint and the server's `publicNetworkAccess` setting.
- The repository contract now removes that dependency instead of teaching operators to restore public access.
- The repository contract now treats Azure Front Door as the canonical public entrypoint. Keep `PUBLIC_APP_URL`, browser smoke checks, and Entra redirect URIs aligned to that host.
- The GitHub release workflow now plans infra before deploy, keeps app rollout separate from infra convergence, and approves Azure Front Door private-link requests, but it still does not populate private App Configuration or Key Vault data-plane values.
- The GitHub release workflow intentionally does not reconcile App Configuration or Key Vault role assignments for the runtime Managed Identity. Treat missing RBAC on those stores as bootstrap drift, not as a reason to broaden routine release permissions.
- If the hosted rollout has not happened yet, treat any live public SQL dependency or direct Container App public-host dependency as configuration drift that still needs to be remediated through the GitHub workflow path.
