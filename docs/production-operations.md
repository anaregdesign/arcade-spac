# Production Operations

This runbook records the verified production baseline for Arcade on Azure and the minimum commands needed for smoke checks, rollback, and first-line troubleshooting.

## Current Production Baseline

- Release tag: `v2026.03.13.7`
- Image: `ghcr.io/anaregdesign/arcade-spac:v2026.03.13.7`
- Container App: `ca-arcade`
- Latest ready revision: `ca-arcade--0000018`
- Public app URL: `https://ca-arcade.bravepond-f695129a.japaneast.azurecontainerapps.io`
- Resource group: `rg-arcade-spec-dev`

## Repository Rename Note

- The canonical repository slug is now `anaregdesign/arcade-spec`.
- The current production baseline still points at the historical GHCR image namespace `ghcr.io/anaregdesign/arcade-spac` because that is the image path of the live release recorded here.
- After the first successful release published from the renamed repository, update this runbook so the baseline image and rollback target reflect `ghcr.io/anaregdesign/arcade-spec:<tag>`.

## Rollback Target

- Previous healthy revision: `ca-arcade--0000017`
- Previous healthy image: `ghcr.io/anaregdesign/arcade-spac:v2026.03.13.6`

Rollback command:

```bash
az containerapp update \
  --resource-group rg-arcade-spec-dev \
  --name ca-arcade \
  --image ghcr.io/anaregdesign/arcade-spac:v2026.03.13.6
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

The Container App runtime exports `APPLICATIONINSIGHTS_CONNECTION_STRING`, so first-line verification can start from the live app health endpoint and then move to the Application Insights resource and linked Log Analytics workspace. The hosted `/health` route now also verifies database compatibility by executing the same `UserProfile.themePreference` select path used by authenticated app loaders, so schema drift is expected to surface there before users hit `/home`.

## Post-Release Smoke Procedure

1. Confirm the GitHub release workflow completed successfully.
2. Confirm the Container App image and latest ready revision match the intended release.
3. Run the health endpoint check.
4. Run the scripted smoke test.
5. Verify hosted sign-in, gameplay, result, rankings, and profile screens in a browser.

Commands:

```bash
curl -sS https://ca-arcade.bravepond-f695129a.japaneast.azurecontainerapps.io/health

APP_URL="https://ca-arcade.bravepond-f695129a.japaneast.azurecontainerapps.io" \
  ./scripts/azure/smoke-test.sh

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

- Schema drift confirmation for the `themePreference` and `shareToken` production repair:

```bash
sqlcmd -S sql-arcade-qddhfw4moexbm.database.windows.net -d arcade -G -Q "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'UserProfile' ORDER BY ORDINAL_POSITION;"

sqlcmd -S sql-arcade-qddhfw4moexbm.database.windows.net -d arcade -G -Q "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PlayResult' AND COLUMN_NAME = 'shareToken';"
```

- Recovery note:

The outage recovered on March 13, 2026 by adding the missing `UserProfile.themePreference` column and `PlayResult.shareToken` column plus index to the production Azure SQL database. The live symptom was `/home` returning `500` after sign-in while `/health` still returned `200`, which is why the health route now includes a database compatibility check.

The hosted sign-in contract was expanded later on March 13, 2026 to accept organization accounts from other Microsoft Entra tenants. Production now stores Entra identities as `tenantId + objectId`, and the hosted `/auth/start` flow is expected to redirect to the `organizations` authorization endpoint.
