# Arcade

Arcade is a React Router server-rendered web app for two competitive puzzle games: Minesweeper and Sudoku. It keeps a shared home dashboard, per-game play history, result summaries, rankings, and a profile surface in one tenant-scoped experience.

## Current State

- Local development is working against SQL Server compatible paths with SSR, cookie session auth, real Minesweeper and Sudoku gameplay, rankings, result flows, and profile editing.
- The repository target for hosted environments is Azure Container Apps with GitHub Release driven CD, `Microsoft Entra ID` sign-in, Azure SQL over `Private Endpoint`, private App Configuration and Key Vault access, Application Insights, and Log Analytics.
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
npm run azure:check:production-data
npm run azure:sync:runtime-config
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

`npm run azure:sync:runtime-config` is the repository-supported sync path for those keys and secrets. Run it only from a host that can reach the private App Configuration and Key Vault data plane.

## Azure Deployment Assets

The repository now includes these Azure-oriented assets:

- `azure.yaml` for `azd` service wiring
- `infra/main.bicep` for VNet-integrated Azure Container Apps, private-endpoint subnets, Azure SQL, App Configuration, Key Vault, Log Analytics, and Application Insights
- `infra/main.bicep` also defines the Azure SQL serverless database path, `Private Endpoint` resources, private DNS links, Container App `/health` probes, and a separate user-assigned migration identity
- `.github/workflows/quality-gates.yml` for push / pull request validation of app code, Bicep, and GitHub workflow syntax
- `.github/workflows/release-container-image.yml` for GitHub Releases to GHCR plus `plan_infra`, conditional `deploy_infra`, `deploy_app`, and `smoke_test`
- `scripts/azure/postprovision.sh` for post-provision registry wiring
- `scripts/azure/sync-runtime-config.sh` for App Configuration and Key Vault runtime config synchronization
- `scripts/azure/smoke-test.sh` for post-deploy smoke checks
- `scripts/azure/verify-production-runtime.sh` for private-network and runtime verification
- `app/routes/health.ts` for smoke checks

## Azure Prerequisites

Before a real hosted deployment, prepare all of the following:

- An Azure subscription, resource group, and deployment region that support Azure Container Apps, Azure SQL, private DNS, and `Private Endpoint`
- A Microsoft Entra ID tenant and `web` app registration for the production sign-in flow
- A virtual network plan that includes a delegated Container Apps infrastructure subnet and a separate private-endpoint subnet
- Private DNS ownership or approval for:
  - `privatelink.database.windows.net`
  - `privatelink.azconfig.io`
  - `privatelink.vaultcore.azure.net`
- GitHub Environment variables for Azure OIDC deployment:
  - `AZURE_CLIENT_ID`
  - `AZURE_TENANT_ID`
  - `AZURE_SUBSCRIPTION_ID`
  - `AZURE_RESOURCE_GROUP`
  - `AZURE_APP_NAME`
- Azure RBAC split:
  - Day-to-day GitHub release identity: `Contributor` at the target resource-group scope
  - Bootstrap operator or elevated provisioning path: `Role Based Access Control Administrator` or `User Access Administrator` when `manageRuntimeRoleAssignments=true`
- Optional GitHub Environment variables for non-public or non-GHCR registry paths:
  - `CONTAINER_REGISTRY_SERVER`
  - `CONTAINER_REGISTRY_IDENTITY`
  - `CONTAINER_REGISTRY_USERNAME`
- Optional GitHub Environment secret:
  - `CONTAINER_REGISTRY_PASSWORD`
- Azure App Configuration values for non-secret runtime settings
- Azure Key Vault secrets for secret runtime values such as `ARCADE_SESSION_SECRET` and the Entra confidential client secret
- A private-network-reachable operator path for `npm run azure:sync:runtime-config`
- A dev or test `Microsoft Entra ID` app registration for local sign-in verification if the team wants production-like auth locally
- Azure SQL bootstrap inputs if `deploySql=true` is enabled in the Bicep template:
	- `sqlAdministratorLogin`
	- `sqlAdministratorPassword`
	- `sqlEntraAdminLogin`
	- `sqlEntraAdminObjectId`

See `docs/azure-prerequisites.md` for the detailed checklist and current gaps.
See `docs/production-data-path.md` for the current database cutover contract.
See `docs/production-operations.md` for the current repository target contract, smoke test procedure, rollback target, and observability entry points.
See `docs/repository-rename-runbook.md` for repository rename, GHCR namespace, and Azure OIDC follow-up steps.

## Next Steps

- Sync App Configuration and Key Vault from a host that can reach the private data plane, then roll out the new private-network contract through the repository GitHub Workflow path.
- Keep runtime Managed Identity RBAC bootstrap separate from day-to-day release delivery. Routine releases now pass `manageRuntimeRoleAssignments=false` and should not require `roleAssignments/write`.
- Keep the `Quality Gates` workflow required on `main` once branch protection is configured.
- Keep release notes, rollback data, and smoke verification steps synchronized with `docs/production-operations.md` after each production release.
- Keep local auth verification aligned with a documented dev or test Entra registration when production-like sign-in coverage is required.
