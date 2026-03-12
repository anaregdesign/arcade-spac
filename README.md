# Arcade

Arcade is a React Router server-rendered web app for two competitive puzzle games: Minesweeper and Sudoku. It keeps a shared home dashboard, per-game play history, result summaries, rankings, and a profile surface in one tenant-scoped experience.

## Current State

- Local development is working against Azure SQL with SSR, cookie session auth, real Minesweeper and Sudoku gameplay, rankings, result flows, and profile editing.
- Production is running on Azure Container Apps with GitHub Release driven CD, Microsoft Entra ID sign-in, Azure SQL, Application Insights, and Log Analytics.
- The current production baseline is release `v2026.03.13.1` on Container App revision `ca-arcade--0000011`.
- Operational notes for rollback, smoke checks, SQL firewall state, and observability now live in `docs/production-operations.md`.

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
```

## Verified Local Flows

- Sign in with seeded users on `/login`
- Navigate across `/home`, `/games/:gameKey`, `/results/:resultId`, `/rankings`, and `/profile`
- Create completed, pending-save, and abandoned gameplay results
- Retry pending-save results from the result screen
- Edit profile display name, tagline, visibility scope, and favorite game
- Switch ranking scope between overall and game-specific views

## Runtime Configuration

The current runtime reads these environment variables:

- `ARCADE_AUTH_MODE`
- `DATABASE_URL`
- `ARCADE_SESSION_SECRET`
- `NODE_ENV`
- `PUBLIC_APP_URL`
- `ENTRA_TENANT_ID`
- `ENTRA_CLIENT_ID`
- `ENTRA_CLIENT_SECRET`

For local development, the app falls back to SQLite and a local session secret. For Azure hosting, move these values to managed configuration instead of storing them in repo files.

For the current local workflow in this repository, the app is verified against Azure SQL rather than SQLite.

## Azure Deployment Assets

The repository now includes these Azure-oriented assets:

- `azure.yaml` for `azd` service wiring
- `infra/main.bicep` for Azure Container Apps, App Configuration, Key Vault, Log Analytics, and Application Insights
- `infra/main.bicep` also defines an optional Azure SQL serverless database path and a separate user-assigned migration identity
- `.github/workflows/release-container-image.yml` for GitHub Releases to GHCR and Azure deployment
- `scripts/azure/postprovision.sh` for post-provision registry wiring
- `scripts/azure/smoke-test.sh` for post-deploy smoke checks
- `app/routes/health.ts` for smoke checks

## Azure Prerequisites

Before a real hosted deployment, prepare all of the following:

- An Azure subscription, resource group, and deployment region that support Azure Container Apps
- A Microsoft Entra ID tenant and app registration for the production sign-in flow
- GitHub Environment variables for Azure OIDC deployment:
	- `AZURE_CLIENT_ID`
	- `AZURE_TENANT_ID`
	- `AZURE_SUBSCRIPTION_ID`
	- `AZURE_RESOURCE_GROUP`
	- `AZURE_CONTAINER_APP_NAME`
	- `GHCR_PULL_USERNAME`
- GitHub Environment secret:
	- `GHCR_PULL_TOKEN`
- Azure App Configuration values for non-secret runtime settings
- Azure Key Vault secrets for secret runtime values such as `ARCADE_SESSION_SECRET`
- A confidential client secret for the Microsoft Entra ID web app registration
- Azure SQL bootstrap inputs if `deploySql=true` is enabled in the Bicep template:
	- `sqlAdministratorLogin`
	- `sqlAdministratorPassword`
	- `sqlEntraAdminLogin`
	- `sqlEntraAdminObjectId`

See `docs/azure-prerequisites.md` for the detailed checklist and current gaps.
See `docs/production-data-path.md` for the current database cutover contract.
See `docs/production-operations.md` for the current production baseline, smoke test procedure, rollback target, and observability entry points.

## Next Steps

- Tighten SQL local-access handling after the current UX pass is complete, including pruning workstation-specific firewall rules when they are no longer needed.
- Keep release notes, rollback data, and smoke verification steps synchronized with `docs/production-operations.md` after each production release.
- Continue refining player-facing copy and seeded data so older legacy result summaries do not leak into the current UX.
