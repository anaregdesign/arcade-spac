# Execution Plan

## Links
- Spec: /docs/spec/product-requirements.md
- Flow: /docs/spec/screen-flow.md

## Section 1. Highest Priority: Unblock Azure Production Readiness
- [ ] Prepare the production data path so the hosted runtime can use a real relational store instead of the local SQLite path.
- [ ] Validate the hosted runtime after production data and app registration values are available.

### Subsection 1.1. Prepare the production data path
- [x] Define the production database contract, migration commands, and deployment-time checks.
- [x] Record the remaining blocker between the current SQLite implementation and the final hosted relational store.
- [ ] Replace the remaining SQLite-only Prisma runtime with an Azure SQL Database-compatible Prisma path.
- [ ] Provision and seed the actual Azure SQL Database resources used by the hosted app.

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
- [ ] Provision the Azure SQL logical server and database from the repo-managed infrastructure path.
- [ ] Apply migrations and seed data to Azure SQL Database.
- [ ] Point the hosted Container App at the Azure SQL Database connection string instead of any SQLite path.

### Subsection 1.2. Validate the hosted runtime
- [x] Configure deployment workflow and hosted smoke verification for the MVP user journeys.
- [ ] Validate the Azure-hosted login, gameplay, rankings, profile, and result-sharing flows.

#### SubSubSection 1.2.1. Hosted smoke and health checks
- [x] Verify health checks, container packaging, and startup behavior for the deployed web runtime configuration path.

#### SubSubSection 1.2.2. Hosted end-to-end verification
- [ ] Validate the Azure-hosted login, gameplay, rankings, profile, and result-sharing flows with real deployment values.

## Section 2. Secondary Priority: Keep Azure Runtime Wiring Ready
- [x] Complete Azure-aligned hosting, configuration, secrets, telemetry, and identity setup without restructuring the application later.

### Subsection 2.1. Application packaging and runtime configuration
- [x] Scaffold Azure Container Apps deployment assets, release workflow, and deployment prerequisite documentation.
- [x] Finalize runtime configuration boundaries for local and Azure execution.

#### SubSubSection 2.1.1. Container runtime assets
- [x] Add Azure-ready server configuration, health checks, container packaging, and deployment assets for the web runtime.

#### SubSubSection 2.1.2. Runtime configuration boundaries
- [x] Keep Azure runtime settings explicit and fail fast when hosted configuration is incomplete.

### Subsection 2.2. Infrastructure and identity wiring
- [x] Define Azure hosting, configuration, secrets, telemetry, identity, and production data resources.
- [x] Wire Microsoft Entra ID, managed identity, and deployment-time configuration without introducing local-only assumptions.

#### SubSubSection 2.2.1. Identity wiring
- [x] Add Microsoft Entra ID sign-in and callback scaffolding with deployment-time configuration hooks.

#### SubSubSection 2.2.2. Data resource wiring
- [x] Define the production relational resource and migration identity path for Azure.

## Section 3. Completed Application Foundation
- [x] Stabilize the local MVP application surface.

### Subsection 3.1. Runtime and persistence foundation
- [x] Bootstrap the application runtime, baseline dependencies, and architecture-aligned project structure.
- [x] Implement domain models, persistence, seeded data, and ranking or scoring calculations for local development.

#### SubSubSection 3.1.1. Bootstrap
- [x] Scaffold the React Router framework app in this repository and install the baseline dependencies needed for the MVP.

#### SubSubSection 3.1.2. Local persistence
- [x] Create the initial domain and persistence model for users, games, play results, rankings, and onboarding state with local development seeds.

### Subsection 3.2. Core product flows
- [x] Implement authenticated application flows, shared layout, and navigation across the required core screens.
- [x] Implement Minesweeper and Sudoku gameplay flows, result handling, interruption handling, and pending-save recovery.
- [x] Implement leaderboard, profile, charting, Microsoft Teams sharing flow, and developer-facing verification notes.

#### SubSubSection 3.2.1. Shell and dashboard
- [x] Implement the shared application shell, login entry, home dashboard, and core navigation so the main user journey is executable.

#### SubSubSection 3.2.2. Gameplay and results
- [x] Remove the remaining SSR runtime error on the game workspace and result routes.
- [x] Implement game workspace interactions, result screen flow, interruption confirmation, and pending-save handling for both games.

#### SubSubSection 3.2.3. Rankings, profile, and sharing
- [x] Implement leaderboard and profile screens with the seeded aggregates, trend views, and Teams-share-ready result summaries.
- [x] Ensure the result flow exposes Teams-share-ready messaging and return navigation consistent with the screen flow.

## External Prerequisites
- [x] Document the Azure subscription, tenant, app registration, callback URLs, App Configuration endpoint, Key Vault values, and deployment identities required to perform a real hosted deployment