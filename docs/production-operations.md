# Production Operations

This runbook records the verified production baseline for Arcade on Azure and the minimum commands needed for smoke checks, rollback, and first-line troubleshooting.

## Current Production Baseline

- Release tag: `v2026.03.13.1`
- Image: `ghcr.io/anaregdesign/arcade-spac:v2026.03.13.1`
- Container App: `ca-arcade`
- Latest ready revision: `ca-arcade--0000011`
- Public app URL: `https://ca-arcade.bravepond-f695129a.japaneast.azurecontainerapps.io`
- Resource group: `rg-arcade-spec-dev`

## Rollback Target

- Previous healthy revision: `ca-arcade--0000010`
- Previous healthy image: `ghcr.io/anaregdesign/arcade-spac:v2026.03.12.4`

Rollback command:

```bash
az containerapp update \
  --resource-group rg-arcade-spec-dev \
  --name ca-arcade \
  --image ghcr.io/anaregdesign/arcade-spac:v2026.03.12.4
```

After rollback, confirm the ready revision and health endpoint again.

## Runtime Identity

- Container App identity type: `SystemAssigned`
- Runtime principal ID: `ed42b2bc-ba63-4860-a3be-605e14bfae93`

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

The Container App runtime exports `APPLICATIONINSIGHTS_CONNECTION_STRING`, so first-line verification can start from the live app health endpoint and then move to the Application Insights resource and linked Log Analytics workspace.

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