# Execution Plan

## Links
- Spec: /docs/spec/product-requirements.md
- Flow: /docs/spec/screen-flow.md

## Section 1. Highest Priority: Reach Azure Production Go-Live
- [x] Prepare the production data path so the hosted runtime can use a real relational store instead of the local SQLite path.
- [x] Roll out the production release image through the GitHub release path and land it on the hosted Container App.
- [ ] Validate the hosted runtime, Microsoft Entra ID login path, and final go-live guardrails needed for production release.

### Subsection 1.1. Prepare the production data path
- [x] Define the production database contract, migration commands, and deployment-time checks.
- [x] Record the remaining blocker between the current SQLite implementation and the final hosted relational store.
- [x] Replace the remaining SQLite-only Prisma runtime with an Azure SQL Database-compatible Prisma path.
- [x] Provision and seed the actual Azure SQL Database resources used by the hosted app.

#### SubSubSection 1.1.1. Data contract and commands
- [x] Add explicit production migration and status commands alongside a production-readiness data check.

#### SubSubSection 1.1.2. Data deployment guardrails
- [x] Add a reusable validation script that flags local-only database settings before a hosted rollout.

#### SubSubSection 1.1.3. Data cutover documentation
- [x] Document the exact production data-path prerequisites, current limitations, and cutover sequence.

#### SubSubSection 1.1.4. Prisma SQL Server migration
- [x] Switch the Prisma datasource, generated client, and runtime bootstrap from SQLite to SQL Server.
- [x] Regenerate the initial migration and seed path for Azure SQL Database.

#### SubSubSection 1.1.5. Azure SQL rollout
- [x] Provision the Azure SQL logical server and database from the repo-managed infrastructure path.
- [x] Apply migrations and seed data to Azure SQL Database.
- [x] Point the hosted Container App at the Azure SQL Database connection string instead of any SQLite path.

#### SubSubSection 1.1.6. Hosted image cutover
- [x] Push the release-ready SQL Server-compatible commits to the default GitHub branch.
- [x] Publish a non-prerelease GitHub release so the repository workflow builds and publishes the immutable GHCR image.
- [x] Ensure a GitHub release automatically drives Azure CD for production by providing the required `production` environment values and OIDC wiring.
- [x] Update the Azure Container App revision to run the latest release image instead of the preview image when workflow CD is blocked.
- [x] Confirm the new revision starts cleanly with Azure SQL and the intended hosted auth mode enabled.

### Subsection 1.2. Validate the hosted runtime
- [x] Configure deployment workflow and hosted smoke verification for the MVP user journeys.
- [ ] Validate the Azure-hosted login, gameplay, rankings, profile, and result-sharing flows.
- [ ] Close the remaining production go-live checks for runtime safety, monitoring, and rollback.

#### SubSubSection 1.2.1. Hosted smoke and health checks
- [x] Verify health checks, container packaging, and startup behavior for the deployed web runtime configuration path.

#### SubSubSection 1.2.2. Hosted end-to-end verification
- [x] Validate the Azure-hosted local-auth login, gameplay, rankings, profile, and result-sharing flows with real deployment values.

#### SubSubSection 1.2.3. Hosted Entra ID verification
- [x] Complete the production Microsoft Entra ID runtime configuration, callback URLs, and secret wiring.
- [x] Verify Microsoft Entra ID sign-in, callback, session establishment, and sign-out on the hosted app.

#### SubSubSection 1.2.4. Production go-live guardrails
- [x] Verify the production revision exposes `/health` successfully and stays healthy after rollout.
- [x] Record the exact release tag, image reference, and deployed Container App revision used for production.
- [ ] Capture the exact rollback target, SQL firewall state, and managed identity configuration needed for emergency recovery.
- [ ] Confirm release-time observability inputs are in place: Application Insights visibility, error inspection path, and post-release smoke procedure.

Current production baseline:
- `Release tag`: `v2026.03.12.4`
- `Image`: `ghcr.io/anaregdesign/arcade-spac:v2026.03.12.4`
- `Container App revision`: `ca-arcade--0000010`
- `Managed identity`: `SystemAssigned` principal `ed42b2bc-ba63-4860-a3be-605e14bfae93`
- `Rollback target`: `ca-arcade--0000009` on image `ghcr.io/anaregdesign/arcade-spac:v2026.03.12.3`

## Section 2. Secondary Priority: Close Local UX Gaps Before Wider Rollout
- [x] Make the game screens actually playable instead of result simulation only.
- [ ] Run the app locally as a player, identify any UI that feels unpleasant for a game flow, and fix the highest-impact issues.
- [ ] Clean up broken links, unnecessary copy, and unnecessary icons so the product feels intentional.

### Subsection 2.1. Local gameplay and UX audit
- [x] Replace placeholder gameplay flows with real game interaction for the shipped game screens.
- [ ] Exercise the local login, home, gameplay, results, rankings, and profile flows with a game-player mindset.
- [ ] Record concrete UI friction points that make the app feel slow, unclear, noisy, or awkward during play.
- [ ] Implement and verify the highest-impact UX fixes before wider rollout.
- [ ] Remove broken or misleading navigation targets, trim developer-facing copy, and keep only icons that improve clarity.
- [ ] Restore local Azure SQL access for the developer runtime or document an approved local fallback so the Section 2 walkthrough can run end to end again.

#### SubSubSection 2.1.0. Actual gameplay implementation
- [x] Make `Minesweeper` playable in the shipped game screen, with real board interaction and result capture.
- [x] Make `Sudoku` playable in the shipped game screen, with real puzzle interaction and result capture.

#### SubSubSection 2.1.1. Local player walkthrough
- [ ] Run the app locally and walk the primary user journeys end to end.

#### SubSubSection 2.1.2. Friction inventory
- [ ] Capture specific UI problems, affected screens, and why they feel bad in a game context.

Current friction inventory:
- `Result discoverability`: home `Recent results` items show status and points, but they need an explicit link back to the saved result screen.
- `Cross-game navigation`: the game workspace and result screens need a direct way to jump to the other shipped game, matching the screen-flow spec.
- `Local walkthrough blocker`: the local runtime currently fails against Azure SQL because the current Entra principal cannot modify the SQL server firewall or public network access.

#### SubSubSection 2.1.3. UX polish fixes
- [ ] Fix the highest-priority UX issues and re-verify the affected flows locally.

#### SubSubSection 2.1.4. Link and chrome cleanup
- [ ] Remove or repair broken links and any navigation that does not work as presented.
- [ ] Remove unnecessary explanatory text, placeholder labels, and any icons that do not improve comprehension.

## Section 3. Secondary Priority: Keep Azure Runtime Wiring Ready
- [x] Complete Azure-aligned hosting, configuration, secrets, telemetry, and identity setup without restructuring the application later.

### Subsection 3.1. Application packaging and runtime configuration
- [x] Scaffold Azure Container Apps deployment assets, release workflow, and deployment prerequisite documentation.
- [x] Finalize runtime configuration boundaries for local and Azure execution.

#### SubSubSection 3.1.1. Container runtime assets
- [x] Add Azure-ready server configuration, health checks, container packaging, and deployment assets for the web runtime.

#### SubSubSection 3.1.2. Runtime configuration boundaries
- [x] Keep Azure runtime settings explicit and fail fast when hosted configuration is incomplete.

### Subsection 3.2. Infrastructure and identity wiring
- [x] Define Azure hosting, configuration, secrets, telemetry, identity, and production data resources.
- [x] Wire Microsoft Entra ID, managed identity, and deployment-time configuration without introducing local-only assumptions.

#### SubSubSection 3.2.1. Identity wiring
- [x] Add Microsoft Entra ID sign-in and callback scaffolding with deployment-time configuration hooks.

#### SubSubSection 3.2.2. Data resource wiring
- [x] Define the production relational resource and migration identity path for Azure.

## Section 4. Completed Application Foundation
- [x] Stabilize the local MVP application surface.

### Subsection 4.1. Runtime and persistence foundation
- [x] Bootstrap the application runtime, baseline dependencies, and architecture-aligned project structure.
- [x] Implement domain models, persistence, seeded data, and ranking or scoring calculations for local development.

#### SubSubSection 4.1.1. Bootstrap
- [x] Scaffold the React Router framework app in this repository and install the baseline dependencies needed for the MVP.

#### SubSubSection 4.1.2. Local persistence
- [x] Create the initial domain and persistence model for users, games, play results, rankings, and onboarding state with local development seeds.

### Subsection 4.2. Core product flows
- [x] Implement authenticated application flows, shared layout, and navigation across the required core screens.
- [x] Implement Minesweeper and Sudoku gameplay flows, result handling, interruption handling, and pending-save recovery.
- [x] Implement leaderboard, profile, charting, Microsoft Teams sharing flow, and developer-facing verification notes.

#### SubSubSection 4.2.1. Shell and dashboard
- [x] Implement the shared application shell, login entry, home dashboard, and core navigation so the main user journey is executable.

#### SubSubSection 4.2.2. Gameplay and results
- [x] Remove the remaining SSR runtime error on the game workspace and result routes.
- [x] Implement game workspace interactions, result screen flow, interruption confirmation, and pending-save handling for both games.

#### SubSubSection 4.2.3. Rankings, profile, and sharing
- [x] Implement leaderboard and profile screens with the seeded aggregates, trend views, and Teams-share-ready result summaries.
- [x] Ensure the result flow exposes Teams-share-ready messaging and return navigation consistent with the screen flow.

## External Prerequisites
- [x] Document the Azure subscription, tenant, app registration, callback URLs, App Configuration endpoint, Key Vault values, and deployment identities required to perform a real hosted deployment