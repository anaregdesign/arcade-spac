# Azure Deployment Prerequisites

This checklist captures the current repository contract for Azure-hosted delivery. Bootstrap and recovery are workflow-driven through GitHub Actions OIDC; local Azure CLI bootstrap is not part of the supported path.

## Already Scaffolded In Repo

- `azure.yaml` targets Azure Container Apps.
- `infra/main.bicep` provisions a VNet-integrated Container Apps environment, delegated Container Apps subnet, private-endpoint subnet, Azure Front Door Premium, Azure SQL, App Configuration, Key Vault, Application Insights, Log Analytics, a SQL bootstrap identity, and a separate SQL migration identity.
- `.github/workflows/bootstrap-azure-recovery.yml` creates the resource group, deploys the hosted baseline with bootstrap RBAC, bootstraps initial Azure SQL principals through an Azure-run Container Apps Job, syncs runtime config, deploys a known-good image, smoke-tests the result, and verifies the recovered runtime.
- `.github/workflows/release-container-image.yml` publishes immutable release images to GHCR, runs infra `what-if`, deploys infra only when real changes exist, syncs runtime config to App Configuration and Key Vault through GitHub Actions OIDC, rolls out the app revision, and smoke-tests the deployed app.
- `.github/workflows/verify-production-runtime.yml` verifies the hosted runtime contract through GitHub Actions OIDC.
- `scripts/azure/sync-runtime-config.sh` is the workflow implementation for hosted runtime config synchronization.
- `scripts/azure/init-sql.mjs` is the workflow implementation for initial Azure SQL principal and role bootstrap.
- `scripts/azure/smoke-test.sh` and `scripts/azure/verify-production-runtime.sh` are workflow-owned verification helpers.
- `app/routes/health.ts` is available for smoke tests and health probes.

## Azure Subscription And Tenant Requirements

- A target Azure subscription with permission to create:
  - resource groups
  - virtual network and subnets
  - private DNS zones and virtual network links
  - private endpoints
  - Azure Front Door profile, endpoint, origin group, origin, and route resources
  - Azure Container Apps managed environment
  - Azure Container App
  - Azure Container Apps Job
  - Azure SQL logical server and serverless database
  - user-assigned managed identities
  - Azure App Configuration
  - Azure Key Vault
  - Application Insights
  - Log Analytics workspace
- A Microsoft Entra ID tenant for the production `web` app registration.
- Permission to create workload identity federation between GitHub Actions and Azure.
- Network ownership or approval for:
  - the delegated Container Apps infrastructure subnet
  - the private-endpoint subnet
  - `privatelink.database.windows.net`

## GitHub Environment Configuration

### `production`

Required variables:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_RESOURCE_GROUP`
- `AZURE_APP_NAME`
- `ENTRA_CLIENT_ID`

Optional variables:

- `CONTAINER_REGISTRY_SERVER`
- `CONTAINER_REGISTRY_IDENTITY`
- `CONTAINER_REGISTRY_USERNAME`
- `ENTRA_TENANT_ID`
- `ENTRA_AUTHORITY_TENANT`
- `PUBLIC_APP_URL`

Required secrets:

- `ARCADE_SESSION_SECRET`
- `ENTRA_CLIENT_SECRET`

Optional secrets:

- `CONTAINER_REGISTRY_PASSWORD`

Required Azure RBAC for the `production` OIDC identity:

- `Contributor` at the target resource-group scope
- `App Configuration Data Owner` at the target resource-group scope so the recreated store inherits the role during recovery
- `Key Vault Secrets Officer` at the target resource-group scope so the recreated vault inherits the role during recovery

### `production-bootstrap`

Required variables:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_LOCATION`
- `AZURE_RESOURCE_GROUP`
- `AZURE_APP_NAME`
- `SQL_ADMINISTRATOR_LOGIN`

Optional variables:

- `CONTAINER_REGISTRY_SERVER`
- `CONTAINER_REGISTRY_IDENTITY`
- `CONTAINER_REGISTRY_USERNAME`

Required secrets:

- `SQL_ADMINISTRATOR_PASSWORD`

Optional secrets:

- `CONTAINER_REGISTRY_PASSWORD`

Required Azure RBAC for the `production-bootstrap` OIDC identity:

- permission to create or update the target resource group
- permission to deploy the hosted baseline in that resource group
- `Role Based Access Control Administrator` or `User Access Administrator` where `manageRuntimeRoleAssignments=true` will be used

The `production-bootstrap` federated credential subject should match:

- `repo:anaregdesign/arcade-spec:environment:production-bootstrap`

The `production` federated credential subject should match:

- `repo:anaregdesign/arcade-spec:environment:production`

## Runtime Configuration Requirements

These values must exist before the hosted app can boot correctly:

Hosted bootstrap environment values:

- `AZURE_APPCONFIG_ENDPOINT`
- `AZURE_APPCONFIG_LABEL` when labeled App Configuration values are used
- `AZURE_KEY_VAULT_URI`

App Configuration values:

- `ARCADE_AUTH_MODE`
- `PUBLIC_APP_URL`
- `ENTRA_TENANT_ID`
- `ENTRA_AUTHORITY_TENANT`
- `ENTRA_CLIENT_ID`

Key Vault secrets:

- `ARCADE_SESSION_SECRET`
- `ENTRA_CLIENT_SECRET`
- `DATABASE_URL`

Current repository note:

- runtime config sync is workflow-owned through `.github/workflows/release-container-image.yml` and `.github/workflows/bootstrap-azure-recovery.yml`
- runtime secrets stay in Key Vault and App Configuration rather than deployment parameters or repo files
- `PUBLIC_APP_URL` should be the Azure Front Door endpoint URL or the final custom domain URL
- after changing the public host, update the Microsoft Entra app registration redirect URI to `https://<front-door-host-or-custom-domain>/auth/callback`
- keep `AZURE_RESOURCE_GROUP` as the shared prefix and select `green` / `blue` / `dev` through the workflow-managed suffix contract instead of editing resource names per run
- workflow-owned helper scripts derive suffix-aware environment-scoped resource names from `AZURE_APP_NAME` plus the selected suffix, then prefer active same-suffix resources when they already exist

## Azure SQL Provisioning Inputs And Identities

Bootstrap inputs still required from the `production-bootstrap` GitHub Environment:

- `sqlAdministratorLogin`
- `sqlAdministratorPassword`

The template now defines three distinct identities for the database path:

- Container App system-assigned managed identity for runtime reads and writes
- User-assigned migration identity for application startup migrations
- User-assigned SQL bootstrap identity that becomes the Azure SQL Microsoft Entra administrator and is used only by the bootstrap workflow job

The repository target contract for the production data path is:

- Azure Front Door Premium as the public edge endpoint
- Azure SQL `publicNetworkAccess=Disabled`
- no `AllowAzureServices` firewall dependency
- Azure SQL `Private Endpoint` plus `privatelink.database.windows.net`
- hosted App Configuration and Key Vault synced through GitHub Actions OIDC and protected by Azure RBAC
- Container Apps managed environment with `publicNetworkAccess=Disabled`
- runtime, migration, and bootstrap SQL permissions separated

## Workflow Entry Points

- Full bootstrap or worst-case recovery:
  - trigger `.github/workflows/bootstrap-azure-recovery.yml`
  - provide a known-good immutable `image_ref`
- Routine deploy:
  - publish a GitHub Release and let `.github/workflows/release-container-image.yml` run
- Runtime verification:
  - trigger `.github/workflows/verify-production-runtime.yml`

## Suggested Workflow-Only Sequence

1. Confirm `Quality Gates` is green for the target commit.
2. If the resource group or hosted baseline is missing, run `Bootstrap Azure Recovery` with a known-good immutable image reference.
3. Confirm `ensure_resource_group`, `deploy_bootstrap_infra`, `bootstrap_sql`, `sync_runtime_config`, `deploy_app`, `smoke_test`, and `verify_runtime` all succeed.
4. For routine forward deploys after bootstrap, publish a GitHub Release and confirm `publish`, `plan_infra`, `deploy_infra`, `sync_runtime_config`, `deploy_app`, and `smoke_test` succeed.
5. Keep `Verify Production Runtime` available as the recurring hosted contract check.
6. For a dev-phase resource-group switch, update the GitHub Environment variables first:
   - `AZURE_RESOURCE_GROUP`
   - `AZURE_APP_NAME`
   - `AZURE_LOCATION` when the target region also changes

## Repository Rename Note

- The canonical GitHub repository slug is `anaregdesign/arcade-spec`.
- Release workflows publish GHCR images under `ghcr.io/anaregdesign/arcade-spec`.
- Keep the `production` and `production-bootstrap` OIDC subjects aligned with that repository slug after future identity changes.

For the live release baseline, rollback notes, and operational checks, see `docs/production-operations.md`.
