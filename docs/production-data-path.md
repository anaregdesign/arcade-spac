# Production Data Path

This document records the repository contract for Arcade's hosted relational path and the workflow-owned checks that must pass before an Azure deployment is treated as production-ready.

## Current Local State

- The Prisma datasource is `sqlserver`, so local development should use either a local SQL Server compatible target or an Azure SQL path supplied through `DATABASE_URL`.
- The app can still fall back to in-memory fixture data for UI review when no database path is available.
- Hosted environments must not use a local file database or SQL login/password runtime auth.

## Hosted Production Contract

Before Azure deployment is treated as production-ready, all of the following must be true:

1. `DATABASE_URL` points to Azure SQL or another hosted SQL Server compatible endpoint and does not use a SQLite-style `file:` URL.
2. The hosted Azure SQL path uses `Microsoft Entra ID` authentication, with `authentication=DefaultAzureCredential` for the managed runtime path so Prisma can resolve the Container Apps identity without driver-specific MSI endpoint wiring.
3. Azure SQL public network access is `Disabled`, and the runtime reaches `<server>.database.windows.net` through `Private Endpoint` plus private DNS.
4. The hosted runtime resolves `Arcade:*` App Configuration keys and the Key Vault-backed `ARCADE_SESSION_SECRET`, `DATABASE_URL`, and `ENTRA_CLIENT_SECRET` values through a managed configuration path rather than repo files.
5. Database migrations run through the hosted migration identity path rather than through local DBA steps.
6. Runtime, migration, and bootstrap SQL permissions stay separated.

## Repo Support Added

- `infra/main.bicep`
- `.github/workflows/bootstrap-azure-recovery.yml`
- `.github/workflows/release-container-image.yml`
- `.github/workflows/verify-production-runtime.yml`
- `scripts/start-with-migrations.mjs`
- `scripts/azure/init-sql.mjs`
- `scripts/azure/verify-production-runtime.sh`

These assets establish the repository-side contract for the hosted data path. They intentionally prefer workflow execution over local Azure bootstrap.

## Runtime, Migration, And Bootstrap Identity Split

- Container App system-assigned managed identity: runtime reads and writes only, typically `db_datareader` and `db_datawriter`
- User-assigned migration identity: controlled schema changes and application startup migrations
- User-assigned SQL bootstrap identity: Azure SQL Microsoft Entra administrator used only by the bootstrap workflow job
- SQL administrator login/password: GitHub Environment bootstrap secret, never runtime auth

## Workflow-Owned Cutover Sequence

1. `Bootstrap Azure Recovery` creates or updates the resource group and deploys the hosted baseline from `infra/main.bicep`.
2. The same workflow runs an Azure-hosted Container Apps Job under the SQL bootstrap identity to create the initial database principals and least-privilege role memberships for the runtime and migration identities.
3. The workflow syncs runtime config into App Configuration and Key Vault.
4. The workflow deploys the chosen immutable image while keeping the migration identity attachment and startup migration database URL on the template-owned Container App contract.
5. Application startup runs `db:migrate:deploy` through the migration identity path.
6. `Verify Production Runtime` confirms the hosted data path contract after rollout.

## Remaining Verification

- This repository change does not itself prove that the live Azure environment has already moved to the private path.
- `Release Azure Delivery` and `Bootstrap Azure Recovery` now both depend on workflow-owned Azure SQL bootstrap and runtime config sync paths.
- After the next successful workflow run, verify the hosted Container Apps path resolves Azure SQL through private DNS and that the runtime no longer depends on `AllowAzureServices`.
