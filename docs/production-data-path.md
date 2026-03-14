# Production Data Path

This document records the repository contract for Arcade's hosted relational path and the checks that must pass before an Azure deployment is treated as production-ready.

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
5. Database migrations can be applied through a production-safe command path that is separate from app startup.
6. Runtime database permissions stay separate from migration permissions.

## Repo Support Added

- `infra/main.bicep`
- `npm run db:migrate:deploy`
- `npm run db:migrate:status`
- `npm run azure:check:production-data`
- `npm run azure:sync:runtime-config`
- `scripts/azure/check-production-data-path.sh`
- `scripts/azure/init-sql.mjs`
- `scripts/azure/verify-production-runtime.sh`

These assets establish the repository-side contract for the hosted data path. They do not by themselves complete a cloud rollout.

## Runtime and Migration Identity Split

- Container App system-assigned managed identity: runtime reads and writes only, typically `db_datareader` and `db_datawriter`
- User-assigned migration identity: controlled schema changes and elevated migration work
- SQL administrator login/password: bootstrap-only or break-glass, never runtime auth

## Recommended Cutover Sequence

1. Provision the VNet-integrated Container Apps environment, Azure SQL serverless database, private DNS zones, and `Private Endpoint` resources from `infra/main.bicep`.
2. Confirm Azure SQL `publicNetworkAccess=Disabled`, `Entra-only` authentication, and the intended Entra administrator.
3. Create database principals from external provider identities for the runtime and migration identities, then grant least privilege roles.
4. Run `npm run db:migrate:status` against the target environment.
5. Apply `npm run db:migrate:deploy` with the migration identity path.
6. Run `npm run azure:check:production-data` against the intended App Configuration and Key Vault inputs.
7. Run `npm run azure:sync:runtime-config` from a host that can reach the private App Configuration and Key Vault data plane.
8. Deploy the app through the GitHub release workflow.
9. Run `scripts/azure/verify-production-runtime.sh` and the hosted smoke test.

## Remaining Verification

- This repository change does not itself prove that the live Azure environment has already moved to the private path.
- The GitHub release workflow now separates `plan_infra`, `deploy_infra`, and `deploy_app`, but it still does not populate private App Configuration or Key Vault data-plane values.
- After the next GitHub-workflow deployment, verify the hosted Container Apps path resolves Azure SQL through private DNS and that the runtime no longer depends on `AllowAzureServices`.
