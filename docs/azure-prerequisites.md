# Azure Deployment Prerequisites

This checklist captures the repository contract for Azure-hosted delivery after the workflow split between `control plane`, `SQL principal bootstrap`, `Prisma migration`, and `runtime startup`.

## Execution Model

- GitHub-hosted workflow jobs own Azure control-plane operations only:
  - resource group creation
  - Bicep deployment
  - Azure Front Door private-link approval
  - App Configuration / Key Vault sync
  - Container App image rollout
  - hosted smoke test and runtime verification
- Azure-hosted `Container Apps Job` executions own Azure SQL data-plane operations:
  - `Release Azure Delivery` and `Bootstrap Azure Recovery` both run `bootstrap_sql` under the SQL bootstrap identity
  - `Release Azure Delivery` and `Bootstrap Azure Recovery` both run dedicated Prisma migration jobs under the SQL migration identity
- `Container App runtime` starts the server only. It does not run `Prisma migration` during replica startup.

## Already Scaffolded In Repo

- `infra/main.bicep` provisions a VNet-integrated Container Apps environment, delegated Container Apps subnet, private-endpoint subnet, Azure Front Door Premium, Azure SQL, App Configuration, Key Vault, Application Insights, Log Analytics, a SQL runtime identity, a SQL migration identity, and a SQL bootstrap identity.
- `.github/workflows/bootstrap-azure-recovery.yml` creates the resource group, deploys the hosted baseline, restores production release RBAC, bootstraps Azure SQL principals through an Azure-hosted job, syncs runtime config, runs Prisma migration through an Azure-hosted job, deploys the recovery image, smoke-tests it, and verifies the runtime contract.
- `.github/workflows/release-container-image.yml` publishes immutable release images to GHCR, runs infra `what-if`, deploys infra only when real changes exist, syncs runtime config, bootstraps Azure SQL principals through an Azure-hosted job, runs Prisma migration through an Azure-hosted job, deploys the app revision, and smoke-tests it.
- `scripts/azure/init-sql.mjs` is the Azure SQL principal reconciliation implementation.
- `scripts/azure/run-sql-bootstrap-job.sh` is the workflow helper that starts the Azure-hosted SQL bootstrap job.
- `scripts/azure/run-prisma-migration-job.sh` is the workflow helper that starts the Azure-hosted Prisma migration job.
- `scripts/run-migrations.mjs` is the image entrypoint for the migration job.
- `scripts/start-server.mjs` is the image entrypoint for runtime server startup.

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

## Required Identity Split

### GitHub `production` OIDC identity

Purpose:

- routine infra convergence
- runtime config sync
- migration job create/start
- app rollout
- runtime verification

Required Azure RBAC:

- `Contributor` at the target resource-group scope
- `App Configuration Data Owner` on the target App Configuration store
- `Key Vault Secrets Officer` on the target Key Vault

### GitHub `production-bootstrap` OIDC identity

Purpose:

- resource-group creation
- bootstrap infra deployment with `manageRuntimeRoleAssignments=true`
- recovery-time RBAC restore
- SQL bootstrap job create/start

Required Azure RBAC:

- permission to create or update the target resource group
- permission to deploy the hosted baseline in that resource group
- `Role Based Access Control Administrator` or `User Access Administrator` on the scopes where recovery restores release-time RBAC

### Container App system-assigned identity

Purpose:

- runtime access to App Configuration and Key Vault references

Required Azure RBAC:

- `App Configuration Data Reader` on the target App Configuration store
- `Key Vault Secrets User` on the target Key Vault

### SQL runtime user-assigned identity

Purpose:

- application runtime reads and writes

Required SQL grants:

- database user with `TYPE = E`
- `db_datareader`
- `db_datawriter`

### SQL migration user-assigned identity

Purpose:

- workflow-owned `Prisma migration`

Required SQL grants:

- database user with `TYPE = E`
- `db_datareader`
- `db_datawriter`
- `db_ddladmin`

### SQL bootstrap user-assigned identity

Purpose:

- Azure SQL principal reconciliation only

Required Azure SQL server contract:

- configured as Azure SQL Microsoft Entra administrator
- Azure SQL `Entra-only` auth enabled

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

### `production-bootstrap`

Required variables:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_LOCATION`
- `AZURE_RESOURCE_GROUP`
- `AZURE_APP_NAME`
- `PRODUCTION_AZURE_PRINCIPAL_ID`

Conditionally required variables:

- `SQL_ADMINISTRATOR_LOGIN`
  Use when a fresh Azure SQL logical server may need to be created.

Optional variables:

- `CONTAINER_REGISTRY_SERVER`
- `CONTAINER_REGISTRY_IDENTITY`
- `CONTAINER_REGISTRY_USERNAME`

Conditionally required secrets:

- `SQL_ADMINISTRATOR_PASSWORD`
  Use when a fresh Azure SQL logical server may need to be created.

Optional secrets:

- `CONTAINER_REGISTRY_PASSWORD`

### OIDC subject contract

- `production`: `repo:anaregdesign/arcade-spec:environment:production`
- `production-bootstrap`: `repo:anaregdesign/arcade-spec:environment:production-bootstrap`

## Registry Prerequisites

- Preferred: `CONTAINER_REGISTRY_IDENTITY` is configured and has pull access to the target registry.
- Fallback: `CONTAINER_REGISTRY_SERVER`, `CONTAINER_REGISTRY_USERNAME`, and `CONTAINER_REGISTRY_PASSWORD` are configured together.
- If neither contract is complete, Azure-hosted `Container Apps Job` creation must fail before execution starts.

## Runtime Configuration Requirements

Hosted bootstrap environment values:

- `AZURE_APPCONFIG_ENDPOINT`
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

- `DATABASE_URL` remains `DefaultAzureCredential` based at rest in Key Vault / App Configuration.
- runtime and migration entrypoints rewrite that URL to `ActiveDirectoryManagedIdentity` only inside the Azure-hosted process when `IDENTITY_ENDPOINT` and `IDENTITY_HEADER` are present.
- keep `AZURE_RESOURCE_GROUP` as the shared prefix and select `green` / `blue` / `dev` through the workflow-managed suffix contract instead of editing resource names per run.

## Workflow Entry Points

- Full bootstrap or worst-case recovery:
  - trigger `.github/workflows/bootstrap-azure-recovery.yml`
  - provide a known-good release tag or immutable full `image_ref`
- Routine deploy:
  - publish a GitHub Release and let `.github/workflows/release-container-image.yml` run
- Runtime verification:
  - trigger `.github/workflows/verify-production-runtime.yml`

## Suggested Workflow-Only Sequence

1. Confirm `Quality Gates` is green for the target commit.
2. If the resource group or hosted baseline is missing, run `Bootstrap Azure Recovery`.
3. Confirm `bootstrap_sql` and `run_database_migration` both succeed before trusting the recovered app rollout.
4. For routine forward deploys, publish a GitHub Release and confirm `migrate_database` succeeds before `deploy_app`.
5. Keep `Verify Production Runtime` available as the recurring hosted contract check.

For the live release baseline, rollback notes, and operational checks, see `docs/production-operations.md`.
