# Production Data Path

This document records the repository contract for Arcade's hosted relational path after separating `runtime startup`, `Prisma migration`, and `Azure SQL principal bootstrap`.

## Current Local State

- The Prisma datasource is `sqlserver`, so local development should use either a local SQL Server compatible target or an Azure SQL path supplied through `DATABASE_URL`.
- The app can still fall back to in-memory fixture data for UI review when no database path is available.
- Hosted environments must not use a local file database or SQL login/password runtime auth.

## Hosted Production Contract

Before Azure deployment is treated as production-ready, all of the following must be true:

1. `DATABASE_URL` points to Azure SQL or another hosted SQL Server compatible endpoint and does not use a SQLite-style `file:` URL.
2. The hosted Azure SQL path uses `Microsoft Entra ID` authentication, and runtime / migration processes rewrite `DefaultAzureCredential` URLs to `ActiveDirectoryManagedIdentity` only inside Azure-hosted execution.
3. Azure SQL public network access is `Disabled`, and runtime reaches `<server>.database.windows.net` through `Private Endpoint` plus private DNS.
4. The hosted runtime resolves `Arcade:*` App Configuration keys and the Key Vault-backed `ARCADE_SESSION_SECRET`, `DATABASE_URL`, and `ENTRA_CLIENT_SECRET` values through a managed configuration path rather than repo files.
5. Azure SQL principal bootstrap runs only through the SQL bootstrap identity path.
6. Prisma migration runs only through the migration identity path.
7. Runtime server startup runs only through the runtime identity path.

## Repo Support Added

- `infra/main.bicep`
- `.github/workflows/bootstrap-azure-recovery.yml`
- `.github/workflows/release-container-image.yml`
- `.github/workflows/verify-production-runtime.yml`
- `scripts/azure/init-sql.mjs`
- `scripts/azure/run-prisma-migration-job.sh`
- `scripts/run-migrations.mjs`
- `scripts/start-server.mjs`
- `scripts/azure/verify-production-runtime.sh`

These assets establish the repository-side contract for the hosted data path. They intentionally prefer workflow execution over local Azure bootstrap.

## Runtime, Migration, And Bootstrap Identity Split

- Container App system-assigned managed identity: App Configuration and Key Vault access only
- User-assigned SQL runtime identity: application runtime reads and writes only, typically `db_datareader` and `db_datawriter`
- User-assigned SQL migration identity: workflow-owned schema changes only
- User-assigned SQL bootstrap identity: Azure SQL Microsoft Entra administrator used only by the bootstrap workflow job
- SQL administrator login/password: bootstrap-only fallback for fresh logical-server creation, never runtime auth

## Workflow-Owned Cutover Sequence

1. `Bootstrap Azure Recovery` creates or updates the resource group and deploys the hosted baseline from `infra/main.bicep`.
2. The same workflow runs an Azure-hosted `Container Apps Job` under the SQL bootstrap identity to create or reconcile the initial database principals and least-privilege role memberships for the runtime and migration identities.
3. `Release Azure Delivery` and `Bootstrap Azure Recovery` both sync runtime config into App Configuration and Key Vault.
4. `Release Azure Delivery` and `Bootstrap Azure Recovery` both run an Azure-hosted `Container Apps Job` under the migration identity to execute `Prisma migrate deploy`.
5. The workflow deploys the chosen immutable image to the runtime `Container App`.
6. Runtime server startup begins immediately and does not wait for migration.
7. `Verify Production Runtime` confirms the hosted data path contract after rollout.

## Guardrails

- GitHub-hosted workflow jobs do not connect directly to Azure SQL `Private Endpoint`.
- Runtime `Container App` does not attach the migration identity.
- Runtime `Container App` does not expose `AZURE_SQL_MIGRATION_CLIENT_ID` or `STARTUP_MIGRATION_DATABASE_URL`.
- `Verify Production Runtime` asserts the runtime identity and env contract after rollout.
