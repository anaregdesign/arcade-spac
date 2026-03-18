# Arcade

Arcade is a React Router server-rendered web app for two competitive puzzle games: Minesweeper and Sudoku. It keeps a shared home dashboard, per-game play history, result summaries, rankings, and a profile surface in one tenant-scoped experience.

## Current State

- Local development is working against SQL Server compatible paths with SSR, cookie session auth, real Minesweeper and Sudoku gameplay, rankings, result flows, and profile editing.
- The repository target for hosted environments is Azure Container Apps with GitHub Release driven CD, `Microsoft Entra ID` sign-in, Azure SQL over `Private Endpoint`, App Configuration and Key Vault backed runtime config, Application Insights, and Log Analytics.
- Operational notes for rollback, smoke checks, private-network verification, and observability live in `docs/production-operations.md`.

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

If `DATABASE_URL` is not configured or the local SQL path is unavailable, the development server falls back to in-memory fixture data for browser-based UI review on `/login`, `/home`, `/games/:gameKey`, `/results/:resultId`, `/rankings`, and `/profile`.

### Useful Commands

```bash
npm run typecheck
npm run build
npm run db:generate
npm run db:migrate
npm run db:migrate:deploy
npm run db:migrate:status
npm run db:seed
```

## Verified Local Flows

- Sign in with seeded users on `/login`
- Navigate across `/home`, `/games/:gameKey`, `/results/:resultId`, `/rankings`, and `/profile`
- Create completed, pending-save, and abandoned gameplay results
- Retry pending-save results from the result screen
- Edit profile display name, tagline, visibility scope, and favorite game
- Switch ranking scope between overall and game-specific views

## Runtime Configuration

The hosted runtime now boots from Azure App Configuration plus Key Vault references through `@azure/app-configuration-provider`.

Hosted bootstrap environment values:

- `NODE_ENV`
- `AZURE_APPCONFIG_ENDPOINT`
- `AZURE_APPCONFIG_LABEL` when labeled App Configuration values are used
- `AZURE_KEY_VAULT_URI`

Azure App Configuration keys use the `Arcade:` prefix and hold non-secret settings such as:

- `Arcade:ARCADE_AUTH_MODE`
- `Arcade:PUBLIC_APP_URL`
- `Arcade:ENTRA_TENANT_ID`
- `Arcade:ENTRA_AUTHORITY_TENANT`
- `Arcade:ENTRA_CLIENT_ID`

Azure Key Vault remains the source of truth for secrets:

- `arcade-session-secret`
- `database-url`
- `entra-client-secret`

Azure App Configuration should reference those Key Vault secrets for:

- `Arcade:ARCADE_SESSION_SECRET`
- `Arcade:DATABASE_URL`
- `Arcade:ENTRA_CLIENT_SECRET`

For local development, the app still supports shell-based fallback when `AZURE_APPCONFIG_ENDPOINT` is intentionally unset or when the signed-in Azure path is unavailable. Do not add `.env` files to this repository.

Hosted runtime config sync is workflow-owned. Use GitHub `Release Azure Delivery` or `Bootstrap Azure Recovery` instead of local Azure sync entrypoints.

## Azure Deployment Assets

The repository now includes these Azure-oriented assets:

- `azure.yaml` for `azd` service wiring
- `infra/main.bicep` for VNet-integrated Azure Container Apps, Azure SQL, App Configuration, Key Vault, Log Analytics, and Application Insights
- `infra/main.bicep` also defines the Azure SQL serverless database path, SQL `Private Endpoint` resources, private DNS links, Container App `/health` probes, a SQL bootstrap identity, and a separate user-assigned migration identity
- `.github/workflows/bootstrap-azure-recovery.yml` for OIDC-only resource-group creation, hosted baseline bootstrap, SQL principal bootstrap, and recovery deploy
- `.github/workflows/quality-gates.yml` for push / pull request validation of app code, Bicep, and GitHub workflow syntax
- `.github/workflows/release-container-image.yml` for GitHub Releases to GHCR plus `plan_infra`, conditional `deploy_infra`, `sync_runtime_config`, `deploy_app`, and `smoke_test`
- `scripts/azure/postprovision.sh` for post-provision registry wiring
- `scripts/azure/sync-runtime-config.sh` for App Configuration and Key Vault runtime config synchronization
- `scripts/azure/smoke-test.sh` for post-deploy smoke checks
- `scripts/azure/verify-production-runtime.sh` for private-network and runtime verification
- `app/routes/health.ts` for smoke checks

## Azure Prerequisites

Before a real hosted deployment, prepare all of the following:

- An Azure subscription and deployment region that support Azure Container Apps, Azure SQL, private DNS, and `Private Endpoint`
- A target resource-group name for the GitHub bootstrap workflow to create or reconcile
- A Microsoft Entra ID tenant and `web` app registration for the production sign-in flow
- A virtual network plan that includes a delegated Container Apps infrastructure subnet and a separate private-endpoint subnet
- Private DNS ownership or approval for:
  - `privatelink.database.windows.net`
- GitHub `production` Environment variables for routine OIDC release:
  - `AZURE_CLIENT_ID`
  - `AZURE_TENANT_ID`
  - `AZURE_SUBSCRIPTION_ID`
  - `AZURE_RESOURCE_GROUP`
  - `AZURE_APP_NAME`
- GitHub `production` Environment variables for runtime config sync:
  - `ENTRA_CLIENT_ID`
  - `ENTRA_TENANT_ID` when it differs from `AZURE_TENANT_ID`
  - `ENTRA_AUTHORITY_TENANT` when the sign-in audience should not default to `ENTRA_TENANT_ID`
  - `PUBLIC_APP_URL` when a custom domain should override the default Front Door host
  - `SQL_ADMINISTRATOR_LOGIN`
- GitHub `production-bootstrap` Environment variables for OIDC recovery bootstrap:
  - `AZURE_CLIENT_ID`
  - `AZURE_TENANT_ID`
  - `AZURE_SUBSCRIPTION_ID`
  - `AZURE_LOCATION`
  - `AZURE_RESOURCE_GROUP`
  - `AZURE_APP_NAME`
  - `SQL_ADMINISTRATOR_LOGIN`
- Azure RBAC split:
  - Day-to-day GitHub release identity: `Contributor`, `App Configuration Data Owner`, and `Key Vault Secrets Officer` at the target resource-group scope so recovery can recreate the stores without a second grant step
  - GitHub `production-bootstrap` identity: subscription or recovery-scope `Contributor`, plus `Role Based Access Control Administrator` or `User Access Administrator` when `manageRuntimeRoleAssignments=true`
- Optional GitHub Environment variables for non-public or non-GHCR registry paths:
  - `CONTAINER_REGISTRY_SERVER`
  - `CONTAINER_REGISTRY_IDENTITY`
  - `CONTAINER_REGISTRY_USERNAME`
- Optional GitHub Environment secret:
  - `CONTAINER_REGISTRY_PASSWORD`
- GitHub `production` Environment secrets for runtime config sync and SQL bootstrap:
  - `ARCADE_SESSION_SECRET`
  - `ENTRA_CLIENT_SECRET`
  - `SQL_ADMINISTRATOR_PASSWORD`
- GitHub `production-bootstrap` Environment secret:
  - `SQL_ADMINISTRATOR_PASSWORD`
- Azure App Configuration values for non-secret runtime settings
- Azure Key Vault secrets for secret runtime values such as `ARCADE_SESSION_SECRET` and the Entra confidential client secret
- A dev or test `Microsoft Entra ID` app registration for local sign-in verification if the team wants production-like auth locally
- A known-good immutable image reference for `.github/workflows/bootstrap-azure-recovery.yml`

See `docs/azure-prerequisites.md` for the detailed checklist and current gaps.
See `docs/production-data-path.md` for the current database cutover contract.
See `docs/production-operations.md` for the current repository target contract, smoke test procedure, rollback target, and observability entry points.
See `docs/repository-rename-runbook.md` for repository rename, GHCR namespace, and Azure OIDC follow-up steps.

## Next Steps

- Keep the GitHub `production` Environment runtime values and secrets aligned so the release workflow can sync App Configuration and Key Vault before each rollout.
- Keep the GitHub `production-bootstrap` Environment aligned so `Bootstrap Azure Recovery` can recreate the resource group and hosted baseline entirely through OIDC.
- Keep runtime Managed Identity RBAC bootstrap separate from day-to-day release delivery. Routine releases now pass `manageRuntimeRoleAssignments=false` and should not require `roleAssignments/write`.
- Keep the `Quality Gates` workflow required on `main` once branch protection is configured.
- Keep release notes, rollback data, and smoke verification steps synchronized with `docs/production-operations.md` after each production release.
- Keep local auth verification aligned with a documented dev or test Entra registration when production-like sign-in coverage is required.
