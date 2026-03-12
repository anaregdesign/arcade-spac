# Arcade

Arcade is a React Router server-rendered web app for two competitive puzzle games: Minesweeper and Sudoku. It keeps a shared home dashboard, per-game play history, result summaries, rankings, and a profile surface in one tenant-scoped experience.

## Current State

- Local development runtime is working with SSR, cookie session auth, seeded users, seeded rankings, gameplay result flows, rankings, and profile editing.
- Production deployment scaffolding now exists for Azure Container Apps, GitHub release-based container publishing, App Configuration, Key Vault, and Application Insights.
- Real Microsoft Entra ID sign-in and production relational persistence are still pending. Local development still uses seeded identities and SQLite.

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

The current runtime reads these environment variables:

- `DATABASE_URL`
- `ARCADE_SESSION_SECRET`
- `NODE_ENV`

For local development, the app falls back to SQLite and a local session secret. For Azure hosting, move these values to managed configuration instead of storing them in repo files.

## Azure Deployment Assets

The repository now includes these Azure-oriented assets:

- `azure.yaml` for `azd` service wiring
- `infra/main.bicep` for Azure Container Apps, App Configuration, Key Vault, Log Analytics, and Application Insights
- `.github/workflows/release-container-image.yml` for GitHub Releases to GHCR and Azure deployment
- `scripts/azure/postprovision.sh` for post-provision registry wiring
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

See `docs/azure-prerequisites.md` for the detailed checklist and current gaps.

## Current Azure Gaps

The app is not yet ready for a production Azure rollout without further work.

- The Prisma datasource still targets SQLite, which is suitable for local development but not for Azure Container Apps production hosting.
- Real Microsoft Entra ID callback handling has not replaced the seeded local sign-in path yet.
- The Bicep template does not yet provision a production relational database or migration identity.
- Secretless runtime configuration is scaffolded at the infrastructure layer, but the application runtime does not yet consume Azure App Configuration or Key Vault directly.

## Next Steps

- Move production persistence to an Azure-hosted relational database supported by Prisma for multi-instance hosting.
- Replace seeded sign-in with Microsoft Entra ID web auth and route callback handling.
- Wire the app runtime to Azure App Configuration, Key Vault, and managed identity.
- Run `azd provision --preview` and `azd up` only after the production data and auth path are in place.
