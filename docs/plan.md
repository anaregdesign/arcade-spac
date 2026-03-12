# Execution Plan

## Links
- Spec: /docs/spec/product-requirements.md
- Flow: /docs/spec/screen-flow.md

## Long-Term
- [ ] Deploy a working Arcade application to Azure and verify the MVP flows on the hosted environment
- [ ] Complete Azure-aligned identity, configuration, infrastructure, and delivery setup without restructuring the application later

## Mid-Term
- [ ] Bootstrap the application runtime, baseline dependencies, and architecture-aligned project structure
- [ ] Implement domain models, persistence, seeded data, and ranking or scoring calculations for local development
- [ ] Implement authenticated application flows, shared layout, and navigation across all required screens
- [ ] Implement Minesweeper and Sudoku gameplay flows, result handling, interruption handling, and pending-save recovery
- [ ] Implement leaderboard, profile, charting, Microsoft Teams sharing flow, and verification or developer documentation
- [ ] Add Azure-ready server configuration, health checks, container packaging, and deployment assets for the web runtime
- [ ] Define and wire Azure infrastructure for hosting, configuration, secrets, telemetry, identity, and production data services
- [ ] Configure Microsoft Entra ID runtime settings, deployment workflow, and post-deploy smoke verification for the hosted app

## Short-Term
- [x] Scaffold the React Router framework app in this repository and install the baseline dependencies needed for the MVP
- [x] Create the initial domain and persistence model for users, games, play results, rankings, and onboarding state with local development seeds
- [x] Implement the shared application shell, login entry, home dashboard, and core navigation so the main user journey is executable
- [ ] Implement game workspace interactions, result screen flow, interruption confirmation, and pending-save handling for both games
- [ ] Implement leaderboard and profile screens with the seeded aggregates, trend views, and Teams-share-ready result summaries

## External Prerequisites
- [ ] Document the Azure subscription, tenant, app registration, callback URLs, App Configuration endpoint, Key Vault values, and deployment identities required to perform a real hosted deployment