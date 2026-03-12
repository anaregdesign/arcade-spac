# Azure Deployment Prerequisites

This checklist captures what is already scaffolded in the repository and what still must be provided before the Arcade app can be deployed as a real Azure-hosted application.

## Already Scaffolded In Repo

- `azure.yaml` targets Azure Container Apps.
- `infra/main.bicep` provisions Container Apps hosting, App Configuration, Key Vault, Application Insights, and Log Analytics.
- `.github/workflows/release-container-image.yml` publishes immutable release images to GHCR and updates the Azure Container App through GitHub Actions OIDC.
- `scripts/azure/postprovision.sh` can attach a private container registry to the provisioned Container App.
- `app/routes/health.ts` is available for smoke tests and health probes.

## Azure Subscription And Tenant Requirements

- A target Azure subscription with permission to create:
  - Azure Container Apps Managed Environment
  - Azure Container App
  - Azure App Configuration
  - Azure Key Vault
  - Application Insights
  - Log Analytics Workspace
- A Microsoft Entra ID tenant for the production app registration
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

- `ARCADE_SESSION_SECRET`
- `DATABASE_URL`

Recommended placement:

- Non-secret settings in Azure App Configuration
- Secrets in Azure Key Vault
- Container App managed identity with App Configuration Data Reader and Key Vault Secrets User access

## Production Readiness Gaps Still Open

The repository is not yet production-ready for Azure until these gaps are closed:

1. Replace SQLite with a production relational database supported by Prisma for Azure multi-instance hosting.
2. Introduce a separate migration path and migration identity for the production database.
3. Replace seeded login with Microsoft Entra ID web sign-in and callback handling.
4. Teach the server runtime to read Azure App Configuration and Key Vault through managed identity.
5. Validate the deployed Container App with post-deploy smoke tests against the real production URL.

## Suggested Verification Sequence

1. Confirm `npm run typecheck` and `npm run build` pass locally.
2. Replace the current local-only data and auth assumptions.
3. Run `azd provision --preview` and review the generated plan.
4. Provision Azure resources.
5. Populate App Configuration and Key Vault values.
6. Publish a release so the GitHub workflow pushes an immutable image.
7. Verify `https://<container-app-fqdn>/health`.
8. Smoke-test login, gameplay, result, rankings, and profile flows in the hosted environment.