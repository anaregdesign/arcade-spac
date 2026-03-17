# Execution Plan

## Links
- Spec: /docs/spec/home-recommendation-ucb-ranking.md

## Section 1 - Release-Time Migration Enforcement
### Subsection 1.1 - Runtime And Delivery Changes
- [x] Update the recommendation specs to require pending Prisma migrations before the app revision starts serving traffic
- [x] Package Prisma CLI and migration files into the runtime image and run migrations before the server process starts
- [x] Update the release workflow to attach the SQL migration identity and set the migration client ID on the container app revision
- [x] Extend runtime health verification so smoke tests fail when recommendation schema migrations are missing

### Subsection 1.2 - Verification And Release
- [x] Run targeted tests, typecheck, and build
- [x] Validate the updated release workflow locally with actionlint
- [x] Verify the startup migration script syntax locally
- [ ] Commit, push, and release through the GitHub workflow path
