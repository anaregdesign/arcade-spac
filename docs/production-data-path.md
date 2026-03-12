# Production Data Path

This document records the current production data-path contract for Arcade and the gap between the local SQLite implementation and a real Azure-hosted rollout.

## Current Local State

- Local development uses SQLite via `DATABASE_URL=file:./prisma/dev.db`.
- The current runtime can seed and verify local gameplay, rankings, and profile flows against SQLite.
- The hosted runtime must not reuse this file-based path.

## Production Contract

Before Azure deployment is treated as production-ready, all of the following must be true:

1. `DATABASE_URL` points to a non-file relational database.
2. Database migrations can be applied through a production-safe command path.
3. The hosted runtime receives `ARCADE_SESSION_SECRET`, `PUBLIC_APP_URL`, and Entra auth values together with the database connection.
4. Deployment validation rejects SQLite-based settings before rollout.
5. Runtime database permissions stay separate from migration permissions.

## Repo Support Added

- `npm run db:migrate:deploy`
- `npm run db:migrate:status`
- `npm run azure:check:production-data`
- `scripts/azure/check-production-data-path.sh`

These commands do not complete the production database migration by themselves. They establish the command surface and preflight checks that the final Azure data cutover will use.

The Azure infrastructure template now also defines an optional Azure SQL serverless path plus a separate user-assigned migration identity. That infrastructure does not complete the Prisma cutover by itself, but it makes the target Azure resource and identity split explicit.

## Current Limitation

The repository still uses a Prisma schema whose datasource provider is `sqlite`. That means:

- local development is supported
- production relational cutover is not complete yet
- Azure deployment should be treated as incomplete until the Prisma provider and migration path are updated for the chosen hosted database

## Recommended Cutover Sequence

1. Enable the Azure SQL path in `infra/main.bicep` and provision the serverless database together with the migration identity.
2. Set the Azure SQL Entra administrator, then grant runtime access to the Container App identity and elevated migration access only to the migration identity.
3. Update the Prisma datasource provider and migration path for that database.
4. Run `npm run db:migrate:status` against the target environment.
5. Apply `npm run db:migrate:deploy` with the production connection.
6. Run `npm run azure:check:production-data` before rollout.
7. Deploy the app and run the hosted smoke test.

## Why This Remains In Progress

The final database choice and its Azure resource values are external to the current workspace. Until those values exist, the repository can prepare the command and validation path, but it cannot complete the production database cutover end to end.