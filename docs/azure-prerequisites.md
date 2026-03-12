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

## Production Readiness Gaps Still Open

The repository is not yet production-ready for Azure until these gaps are closed:

1. Replace SQLite with a production relational database supported by Prisma for Azure multi-instance hosting.
2. Grant the runtime managed identity only the database roles it needs, and keep elevated migration permissions on the separate migration identity.
3. Connect the production Entra app registration values and client secret to the deployed Container App.
4. Teach the server runtime to read Azure App Configuration and Key Vault through managed identity.
5. Validate the deployed Container App with post-deploy smoke tests against the real production URL.

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