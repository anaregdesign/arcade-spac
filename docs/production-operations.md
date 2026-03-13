# Production Operations

This runbook records the verified production baseline for Arcade on Azure and the minimum commands needed for smoke checks, rollback, and first-line troubleshooting.

## Current Production Baseline

- Release tag: `v2026.03.13.10`
- Image: `ghcr.io/anaregdesign/arcade-spec:v2026.03.13.10`
- Container App: `ca-arcade`
- Latest ready revision: `ca-arcade--0000021`
- Public app URL: `https://ca-arcade.bravepond-f695129a.japaneast.azurecontainerapps.io`
- Resource group: `rg-arcade-spec-dev`
- Azure SQL public network access contract: `Enabled`

## Repository Rename Note

- The canonical repository slug is now `anaregdesign/arcade-spec`.
- The first successful release published from the renamed repository is now live, so the current production baseline uses `ghcr.io/anaregdesign/arcade-spec`.
- The next rollback target should be refreshed from the most recent known-good release after each production deployment.

## Rollback Target

- Previous healthy revision: not yet recorded under the current image namespace
- Previous healthy image: establish this after the next successful production release

Rollback command:

```bash
az containerapp update \
  --resource-group rg-arcade-spec-dev \
  --name ca-arcade \
  --image ghcr.io/anaregdesign/arcade-spec:<known-good-tag>
```

After rollback, confirm the ready revision and health endpoint again.

## Runtime Identity

- Container App identity type: `SystemAssigned`
- Runtime principal ID: `ed42b2bc-ba63-4860-a3be-605e14bfae93`

## Entra Sign-In Contract

- App registration client ID: `8bcae5fd-ef3c-4eba-9471-43970e5f08ad`
- App registration audience: `AzureADMultipleOrgs`
- Runtime authority tenant segment: `organizations`
- Personal Microsoft accounts: `disabled`

## Azure SQL Recovery Notes

- SQL server: `sql-arcade-qddhfw4moexbm.database.windows.net`
- Microsoft Entra only authentication: `true`
- Entra admin: `hmizukami@MngEnvMCAP321368.onmicrosoft.com`
- Public network access: `Enabled`

Current firewall rules:

- `AllowAzureServices`: `0.0.0.0 - 0.0.0.0`
- `AllowHirokiMac`: `39.111.131.252 - 39.111.131.252`

If local verification is no longer needed, remove the workstation-specific rule after the next development pass.

## Observability

- Application Insights resource: `appi-arcade`
- Application Insights app ID: `ca32253a-ad31-4062-bdb4-4866a0c12cff`
- Log Analytics workspace: `law-arcade`
- Runtime health route: `/health`
- Smoke script: `scripts/azure/smoke-test.sh`
- Runtime verification script: `scripts/azure/verify-production-runtime.sh`
- Scheduled verification workflow: `.github/workflows/verify-production-runtime.yml`

The Container App runtime exports `APPLICATIONINSIGHTS_CONNECTION_STRING`, so first-line verification can start from the live app health endpoint and then move to the Application Insights resource and linked Log Analytics workspace. The hosted `/health` route now also verifies database compatibility by executing the same `UserProfile.themePreference` select path used by authenticated app loaders, so schema drift is expected to surface there before users hit `/home`.

The current hosted architecture still depends on the Azure SQL public endpoint plus the `AllowAzureServices` firewall rule. If `publicNetworkAccess` is changed to `Disabled` before private networking is introduced, the hosted `/health` route and authenticated loaders are expected to fail with SQL login errors.

## Post-Release Smoke Procedure

1. Confirm the GitHub release workflow completed successfully.
2. Confirm the Container App image and latest ready revision match the intended release.
3. Run the health endpoint check.
4. Run the scripted smoke test.
5. Verify hosted sign-in, gameplay, result, rankings, and profile screens in a browser.
6. Run the production runtime verification script or workflow when SQL or Container App configuration changed.

Commands:

```bash
curl -sS https://ca-arcade.bravepond-f695129a.japaneast.azurecontainerapps.io/health

APP_URL="https://ca-arcade.bravepond-f695129a.japaneast.azurecontainerapps.io" \
  ./scripts/azure/smoke-test.sh

AZURE_RESOURCE_GROUP="rg-arcade-spec-dev" \
AZURE_CONTAINER_APP_NAME="ca-arcade" \
  ./scripts/azure/verify-production-runtime.sh

az containerapp show \
  -g rg-arcade-spec-dev \
  -n ca-arcade \
  --query '{image:properties.template.containers[0].image,latestRevision:properties.latestRevisionName,latestReadyRevision:properties.latestReadyRevisionName}'

curl -i -sS "https://ca-arcade.bravepond-f695129a.japaneast.azurecontainerapps.io/auth/start?returnTo=%2Fhome"
```

## Troubleshooting Entry Points

- Revision state and image drift:

```bash
az containerapp revision list -g rg-arcade-spec-dev -n ca-arcade -o table
```

- Container App configuration snapshot:

```bash
az containerapp show -g rg-arcade-spec-dev -n ca-arcade -o json
```

- SQL firewall state:

```bash
az sql server firewall-rule list -g rg-arcade-spec-dev -s sql-arcade-qddhfw4moexbm -o table
```

- SQL public network access drift:

```bash
az sql server show \
  -g rg-arcade-spec-dev \
  -n sql-arcade-qddhfw4moexbm \
  --query '{publicNetworkAccess:publicNetworkAccess}'
```

- Schema drift confirmation for the `themePreference` and `shareToken` production repair:

```bash
sqlcmd -S sql-arcade-qddhfw4moexbm.database.windows.net -d arcade -G -Q "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'UserProfile' ORDER BY ORDINAL_POSITION;"

sqlcmd -S sql-arcade-qddhfw4moexbm.database.windows.net -d arcade -G -Q "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PlayResult' AND COLUMN_NAME = 'shareToken';"
```

- Recovery note:

The outage recovered on March 13, 2026 by adding the missing `UserProfile.themePreference` column and `PlayResult.shareToken` column plus index to the production Azure SQL database. The live symptom was `/home` returning `500` after sign-in while `/health` still returned `200`, which is why the health route now includes a database compatibility check.

The hosted sign-in contract was expanded later on March 13, 2026 to accept organization accounts from other Microsoft Entra tenants. Production now stores Entra identities as `tenantId + objectId`, and the hosted `/auth/start` flow is expected to redirect to the `organizations` authorization endpoint.

An additional outage occurred on March 14, 2026 when the Azure SQL server public endpoint drifted to `Disabled` while the hosted runtime still depended on public network access. The recovery path was to restore `publicNetworkAccess=Enabled`, verify the `AllowAzureServices` firewall rule, and add repository automation that checks the SQL network contract together with the live smoke path.
