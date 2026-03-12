# Execution Plan

## Links
- Spec: /docs/spec/product-requirements.md
- Flow: /docs/spec/screen-flow.md

## Section 1. Reach Azure-Hosted MVP Verification
- [ ] Deploy a working Arcade application to Azure and verify the MVP flows on the hosted environment.
- [ ] Complete Azure-aligned identity, configuration, infrastructure, and delivery setup without restructuring the application later.

### Subsection 1.1. Stabilize the local MVP application surface
- [x] Bootstrap the application runtime, baseline dependencies, and architecture-aligned project structure.
- [x] Implement domain models, persistence, seeded data, and ranking or scoring calculations for local development.
- [x] Implement authenticated application flows, shared layout, and navigation across the required core screens.
- [ ] Implement Minesweeper and Sudoku gameplay flows, result handling, interruption handling, and pending-save recovery.
- [x] Implement leaderboard, profile, charting, Microsoft Teams sharing flow, and developer-facing verification notes.

#### SubSubSection 1.1.1. Runtime and persistence foundation
- [x] Scaffold the React Router framework app in this repository and install the baseline dependencies needed for the MVP.
- [x] Create the initial domain and persistence model for users, games, play results, rankings, and onboarding state with local development seeds.

#### SubSubSection 1.1.2. Authenticated shell and dashboard foundation
- [x] Implement the shared application shell, login entry, home dashboard, and core navigation so the main user journey is executable.

#### SubSubSection 1.1.3. Gameplay and result workflow
- [x] Remove the remaining SSR runtime error on the game workspace and result routes.
- [x] Implement game workspace interactions, result screen flow, interruption confirmation, and pending-save handling for both games.

#### SubSubSection 1.1.4. Rankings, profile, and sharing workflow
- [x] Implement leaderboard and profile screens with the seeded aggregates, trend views, and Teams-share-ready result summaries.
- [x] Ensure the result flow exposes Teams-share-ready messaging and return navigation consistent with the screen flow.

### Subsection 1.2. Prepare the application runtime for Azure hosting
- [ ] Add Azure-ready server configuration, health checks, container packaging, and deployment assets for the web runtime.
- [ ] Define and wire Azure infrastructure for hosting, configuration, secrets, telemetry, identity, and production data services.
- [ ] Configure Microsoft Entra ID runtime settings, deployment workflow, and post-deploy smoke verification for the hosted app.

#### SubSubSection 1.2.1. Application packaging and runtime configuration
- [x] Scaffold Azure Container Apps deployment assets, release workflow, and deployment prerequisite documentation.
- [x] Finalize runtime configuration boundaries for local and Azure execution.
- [ ] Verify health checks, container packaging, and startup behavior for the deployed web runtime.

#### SubSubSection 1.2.2. Infrastructure and identity wiring
- [ ] Define Azure hosting, configuration, secrets, telemetry, and production data resources.
- [ ] Wire Microsoft Entra ID, managed identity, and deployment-time configuration without introducing local-only assumptions.

#### SubSubSection 1.2.3. Delivery and hosted verification
- [ ] Configure deployment workflow and hosted smoke verification for the MVP user journeys.
- [ ] Validate the Azure-hosted login, gameplay, rankings, profile, and result-sharing flows.

## External Prerequisites
- [x] Document the Azure subscription, tenant, app registration, callback URLs, App Configuration endpoint, Key Vault values, and deployment identities required to perform a real hosted deployment