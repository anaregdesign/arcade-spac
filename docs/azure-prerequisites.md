# Azure Deployment Prerequisites

This checklist captures what is already scaffolded in the repository and what still must be provided before the Arcade app can be deployed as a real Azure-hosted application.

## Already Scaffolded In Repo

- `azure.yaml` targets Azure Container Apps.
- `infra/main.bicep` provisions Container Apps hosting, App Configuration, Key Vault, Application Insights, and Log Analytics.
- `.github/workflows/release-container-image.yml` publishes immutable release images to GHCR and updates the Azure Container App through GitHub Actions OIDC.
- `scripts/azure/postprovision.sh` can attach a private container registry to the provisioned Container App.
- `scripts/azure/smoke-test.sh` verifies the deployed `health` and `login` routes.
- `app/routes/health.ts` is available for smoke tests and health probes.

## Azure Subscription And Tenant Requirements

- A target Azure subscription with permission to create:
  - Azure Container Apps Managed Environment
  - Azure Container App
  - Azure SQL logical server and serverless database
  - User-assigned managed identity for schema migrations
  - Azure App Configuration
  - Azure Key Vault
  - Application Insights
  - Log Analytics Workspace
- A Microsoft Entra ID tenant for the production app registration
- A Microsoft Entra ID user or group that can be set as the Azure SQL Entra administrator
- Permission to create workload identity federation between GitHub Actions and Azure

## GitHub Repository Configuration

Set the following GitHub Environment variables for the `production` environment:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_RESOURCE_GROUP`
- `AZURE_CONTAINER_APP_NAME`
- `GHCR_PULL_USERNAME`

Set the following GitHub Environment secrets:

- `GHCR_PULL_TOKEN`

## Runtime Configuration Requirements

These values are needed before the app can boot correctly in Azure:

- `ARCADE_AUTH_MODE`
- `ARCADE_SESSION_SECRET`
- `DATABASE_URL`
- `PUBLIC_APP_URL`
- `ENTRA_TENANT_ID`
- `ENTRA_AUTHORITY_TENANT`
- `ENTRA_CLIENT_ID`
- `ENTRA_CLIENT_SECRET`

Recommended placement:

- Non-secret settings in Azure App Configuration
- Secrets in Azure Key Vault
- Container App managed identity with App Configuration Data Reader and Key Vault Secrets User access

## Azure SQL Provisioning Inputs

When enabling the production relational resource path in `infra/main.bicep`, provide all of the following:

- `deploySql=true`
- `sqlDatabaseName`
- `sqlAdministratorLogin`
- `sqlAdministratorPassword`
- `sqlEntraAdminLogin`
- `sqlEntraAdminObjectId`

The SQL administrator login and password are a bootstrap requirement of Azure SQL server creation. They should not be reused by the app runtime.

The template now defines two distinct identities for the database path:

- Container App system-assigned managed identity for runtime database access after database roles are granted
- User-assigned managed identity for migration execution and elevated schema-change operations

## Verified Production Baseline

The current production deployment is verified on:

- Release tag `v2026.03.13.1`
- Container App revision `ca-arcade--0000011`
- Image `ghcr.io/anaregdesign/arcade-spac:v2026.03.13.1`
- Microsoft Entra ID runtime mode
- `AzureADMultipleOrgs` app registration with `organizations` authority for hosted sign-in
- Azure SQL server `sql-arcade-qddhfw4moexbm.database.windows.net`

## Repository Rename Note

- The canonical GitHub repository slug is `anaregdesign/arcade-spec`.
- Future release workflows should publish GHCR images under `ghcr.io/anaregdesign/arcade-spec` because the workflow derives the image name from `${{ github.repository }}`.
- The historical baseline above still references `ghcr.io/anaregdesign/arcade-spac` until a post-rename release is actually deployed.

## Ongoing Operational Concerns

These are no longer bootstrap blockers, but they still need active operational discipline:

1. Keep runtime database access least-privilege and separate from elevated migration access.
2. Keep the current rollback target, SQL firewall state, and smoke procedure updated after every release.
3. Remove workstation-specific SQL firewall exceptions when they are no longer needed for local verification.
4. Keep Application Insights and Log Analytics access available to the release operator for first-line troubleshooting.

## Suggested Verification Sequence

1. Confirm `npm run typecheck` and `npm run build` pass locally.
2. Run `npm run azure:check:production-data` against the intended hosted settings.
3. Replace the current local-only Prisma provider and auth assumptions.
4. Run `azd provision --preview` and review the generated plan, including the optional Azure SQL resources.
5. Provision Azure resources.
6. Set the Azure SQL Entra administrator and grant database roles separately to the runtime and migration identities.
7. Populate App Configuration and Key Vault values.
8. Publish a release so the GitHub workflow pushes an immutable image.
9. Verify `https://<container-app-fqdn>/health`.
10. Smoke-test login, gameplay, result, rankings, and profile flows in the hosted environment.

For the latest verified production values and rollback notes, see `docs/production-operations.md`.
