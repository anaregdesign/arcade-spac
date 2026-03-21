# Execution Plan

## Links
- Spec: /docs/spec/specification.md
- Legacy reference: /docs/spec/production-rg-arcade-green-release-retarget.md

## Section 9 - Recovery Replica Contract Audit
### Subsection 9.1 - Workflow Goal Alignment
- [x] Re-read the recovery workflow against the operator goal of building a side-by-side replica while leaving the current environment untouched
- [x] Update the canonical spec so recovery targets a non-production suffix replica and only reuses Azure Application / Service Principal identities required for OIDC and OAuth
- [x] Patch `Bootstrap Azure Recovery` so it rejects the routine production suffix instead of performing in-place recovery on the live production target
- [x] Validate the updated recovery workflow YAML locally and record any remaining operator follow-up

## Section 10 - Front Door Private Link Approval Reliability
### Subsection 10.1 - Approval Pipeline Hardening
- [x] Rework the Front Door private-link approval watcher so it uses a deployment-aligned deadline instead of a fixed five-minute retry window
- [x] Wire release and recovery workflows to the new approval wait contract so slow Azure propagation does not produce false timeout failures
- [x] Validate the updated approval watcher and touched workflows locally, then record the remaining hosted follow-up

## Section 11 - Recovery Verification Contract Relaxation
### Subsection 11.1 - Auth Redirect Optionality
- [x] Confirm the current recovery verification failure is the expected shared OAuth callback drift rather than an infra/runtime deployment failure
- [x] Relax recovery verification so `/auth/start` redirect validation is optional until the shared Entra app registration is updated for the recovered Front Door host
- [x] Validate the updated recovery verification contract locally and prepare the hosted blue recovery workflow rerun

## Section 8 - Front Door Asset Delivery Reliability
### Subsection 8.1 - Investigation
- [x] Reproduce the deployed Front Door slowness and CSS delivery failure against the current default domain
- [x] Confirm the deployed HTML references hashed CSS Module bundles while default asset GET requests terminate or fall back incorrectly under browser-style compression
- [x] Prove the same build serves the referenced `/assets/*` files correctly when started locally outside the deployed Azure edge path

### Subsection 8.2 - Runtime And Edge Fix
- [x] Replace `react-router-serve` compression-based startup with a thin custom Node server that serves `build/client` and `public` static files before React Router request handling
- [x] Preserve immutable cache headers for hashed assets while removing origin-side compressed static delivery from the production startup path
- [x] Remove Front Door asset-route edge compression so browser-default CSS and JS transfers complete reliably through Azure Front Door

### Subsection 8.3 - Validation
- [x] Validate the custom runtime locally by fetching hashed CSS assets and confirming `200` plus long-lived cache headers without transfer aborts
- [x] Run the repo quality gates affected by the startup/runtime changes
- [ ] Summarize the release follow-up required to move the deployed Front Door environment onto the fixed runtime and edge contract

Notes:
- Deployed Front Door investigation on 2026-03-19 showed browser-default GET requests for referenced CSS assets terminating mid-transfer, while the same requests succeeded with `accept-encoding: identity`; local origin delivery did not reproduce the failure, which isolates the issue to the deployed compressed asset path rather than CSS Module generation.
- Local validation after switching to `scripts/serve-runtime.mjs` showed `/assets/root-BA8tMkpb.css` and `/assets/manifest-9ea62102.js` returning `200`, `Cache-Control: public, max-age=31536000, immutable`, and no `content-encoding` header.

## Section 1 - Target Contract And Repository State
### Subsection 1.1 - Spec And Inventory
- [x] Write the operator-facing spec for the `rg-arcade-green` release retarget
- [x] Inventory the required `production` and `production-bootstrap` variables and secrets from the workflow contract
- [x] Confirm the target Azure resource group naming and current repo-side mismatches
- [x] Lock the provisioning test assumption that `rg-arcade-green` starts empty and existing resource groups stay out of scope
- [x] Rewrite the GitHub Environment contract so `AZURE_RESOURCE_GROUP` stores only the shared prefix `rg-arcade`

## Section 2 - GitHub Environment Repair
### Subsection 2.1 - Environment Shape
- [x] Create or repair the `production-bootstrap` GitHub Environment
- [x] Update `production` variables so routine release derives `rg-arcade-green` from the shared prefix contract
- [x] Complete the remaining `production-bootstrap` variables so bootstrap/recovery derives full target names from the shared prefix contract

### Subsection 2.2 - Secret Registration
- [x] Generate or retrieve fresh required `production` secrets for the empty-target provisioning test
- [x] Generate or retrieve required `production-bootstrap` secrets for the empty-target provisioning test

### Subsection 2.3 - Identity And Access
- [x] Confirm or create the `production-bootstrap` OIDC identity with the required federated credential
- [x] Grant `production` the required `rg-arcade-green` roles for release-time infra and runtime config sync
- [x] Grant `production-bootstrap` the required bootstrap scope permissions for empty resource-group creation and role assignment

### Subsection 2.4 - Workflow Reliability
- [x] Identify the empty-target Front Door private link approval deadlock in bootstrap/release delivery
- [x] Patch the bootstrap and routine release workflows so deployment starts asynchronously, approval runs, and completion is awaited before downstream jobs
- [x] Identify that RG-scope GitHub OIDC role assignments are destroyed with the empty target resource group
- [x] Patch the bootstrap workflow so bootstrap identity uses stable-scope permissions and restores `production` release RBAC on the recreated RG before production-environment jobs run
- [x] Identify that soft-deleted App Configuration / Key Vault names collide with deterministic global naming after RG recreation
- [x] Add an operator-managed global-name suffix path so bootstrap/release can rotate App Configuration / Key Vault names when clean-slate recovery needs a fresh global name
- [x] Patch bootstrap/release private-link approval so it resolves `cae-${AZURE_APP_NAME}` directly instead of waiting for `ca-${AZURE_APP_NAME}` to exist
- [x] Centralize resource-group suffix selection in workflow code so bootstrap can choose `green` / `blue` / `dev` without mutating the shared prefix variable
- [x] Hoist the routine release and runtime verification `AZURE_RESOURCE_GROUP_SUFFIX` declaration near the top of each workflow so operators can confirm the target suffix without scanning job-local `env` blocks
- [x] Patch bootstrap/release private-link approval so a terminal infra deployment failure surfaces its Azure operation errors immediately instead of timing out on missing private-link connections
- [x] Upgrade bootstrap/release/verification workflows from `azure/login@v2` to `azure/login@v3`
- [x] Verify the touched workflows remain valid after the `azure/login@v3` upgrade
- [x] Patch `scripts/azure/await-frontdoor-private-link.sh` so transient `PrivateEndpointConnectionLockConflict` responses retry instead of aborting bootstrap/release before `production` RBAC restore

### Subsection 2.5 - Existing Resource Reuse
- [x] Capture the canonical operator-facing requirement for suffix-scoped Azure environment isolation plus same-suffix reuse of existing or recoverable Azure resources
- [x] Confirm the latest bootstrap failure on 2026-03-18 is caused by existing `SQL server` state plus recoverable `App Configuration` / `Key Vault` name collisions
- [x] Patch the Azure naming contract so suffix-scoped environments do not reuse environment-scoped resource names across `green` / `blue` / `dev`
- [x] Patch bootstrap/release/verification helper paths so they derive suffix-aware target resource names consistently
- [x] Keep only shared identity resources unsuffixed while active hosted resources are reused only within the same suffix environment
- [x] Preserve same-suffix bootstrap recovery by reusing existing `SQL server` resources and recovering recoverable `App Configuration` / `Key Vault`
- [x] Validate the updated workflow, helper script, and infra contracts locally against the current repository state

## Section 3 - Release Delivery
### Subsection 3.1 - Push And Release
- [ ] Commit and push any additional repository-side changes required after bootstrap retry findings
- [ ] Publish a GitHub Release that triggers the routine release workflow
- [ ] Monitor the workflow and capture the deploy result for `rg-arcade-green`

### Subsection 3.2 - Verification
- [ ] Verify that bootstrap can target `green` / `blue` / `dev` via workflow suffix selection while `AZURE_RESOURCE_GROUP` stays at the shared prefix
- [ ] Rerun the bootstrap workflow with the patched delivery path and confirm it succeeds against empty-target assumptions
- [ ] Run or confirm the hosted verification workflow for the released target
- [ ] Update the active plan to reflect the final release outcome and remaining drift, if any

### Subsection 3.3 - Recovery Image Input Hardening
- [x] Capture the latest bootstrap retry failure where shorthand `image_ref` input fell through to invalid Docker Hub resolution
- [x] Patch the bootstrap workflow so release-tag shorthand resolves once to the canonical current-repository `GHCR` image reference and every image-consuming job reuses that value
- [x] Validate the updated workflow and helper script locally before the next bootstrap rerun

## Section 4 - Workflow Idempotency Hardening
### Subsection 4.1 - Canonical Contract
- [x] Extend the canonical spec so workflow-managed Azure state is idempotent except for run-scoped artifact names
- [x] Identify every remaining workflow-owned Azure write path that still produces avoidable drift on no-op rerun

### Subsection 4.2 - Runtime Config And App Rollout
- [x] Patch `scripts/azure/sync-runtime-config.sh` so unchanged `Key Vault` and `App Configuration` entries are skipped instead of rewritten
- [x] Patch `scripts/azure/postprovision.sh` so unchanged registry configuration does not rewrite the `Container App`
- [x] Patch bootstrap and routine release app rollout steps so unchanged image refs do not issue `az containerapp update`

### Subsection 4.3 - SQL Bootstrap
- [x] Refactor `scripts/azure/init-sql.mjs` so it converges principals and role membership without replaying schema DDL outside Prisma migration state
- [x] Verify the bootstrap workflow still leaves first-run schema creation to the hosted Prisma migration path
- [x] Patch `Bootstrap Azure SQL Principals` so existing `SQL server` reuse re-establishes the bootstrap `Entra administrator` and `ad-only-auth` contract before starting the job
- [x] Add repo checkout plus empty-job cleanup guards to `Bootstrap Azure SQL Principals` so bootstrap scripts can run and failed pre-create exits do not cascade
- [x] Capture failed `Container Apps Job` execution diagnostics from `Bootstrap Azure SQL Principals` so reruns expose container-side startup errors directly in workflow logs
- [x] Patch `Bootstrap Azure SQL Principals` to retry failed SQL bootstrap executions with backoff after converging the reused `SQL server` data-plane contract
- [x] Decouple `Bootstrap Azure SQL Principals` from release-image bundled helper files by injecting `scripts/azure/init-sql.mjs` from the checked-out repo into the transient job execution
- [x] Align `bootstrap_sql` timeout/progress reporting with the SQL bootstrap retry budget so long-running recovery attempts surface whether create, start, execution discovery, or execution polling is stalled

### Subsection 4.4 - Validation
- [x] Run local validation for touched shell scripts, workflow YAML, and targeted app/runtime scripts
- [x] Summarize any remaining non-idempotent behavior that is intentionally limited to run-scoped artifact creation
- [x] Fix the `actionlint` `shellcheck` failure in bootstrap workflow retry loops introduced by the idempotency hardening slice

## Section 5 - Production Verification Recovery
### Subsection 5.1 - Auth Redirect Reliability
- [x] Confirm the original `Verify Production Runtime #125` `No subscriptions found` stop is cleared by restoring the `production` release principal RBAC
- [x] Capture the follow-on `Verify Production Runtime` failure where `/auth/start` returns `504` after the workflow reaches runtime checks
- [x] Remove live Entra OpenID discovery from the request path so `/auth/start` can build the authorization redirect without waiting on external metadata fetches

### Subsection 5.2 - Runtime URL And Verification Hardening
- [x] Confirm the `production` GitHub Environment still pins a stale `PUBLIC_APP_URL` default-domain host and remove the override so runtime config can derive the current Front Door endpoint
- [x] Patch `scripts/azure/sync-runtime-config.sh` so stale `.azurefd.net` overrides are ignored in favor of the currently provisioned Front Door host while custom-domain overrides remain supported
- [x] Patch `scripts/azure/verify-production-runtime.sh` so the auth redirect assertion retries transient first-hit failures before declaring production runtime unhealthy
- [x] Confirm the hosted `Container App` still resolves runtime auth settings lazily from App Configuration / Key Vault on the request path and times out before `/auth/start` responds
- [x] Patch release delivery so `Container App` runtime env is synced from Key Vault-backed secret references plus current public host after each release
- [x] Patch server runtime config resolution so Azure hosting skips remote App Configuration bootstrap when the required runtime settings are already present in `process.env`
- [x] Fix the Azure env bootstrap regression where `ARCADE_SESSION_SECRET` and `DATABASE_URL` still required store-backed values even after the runtime switched to the complete `process.env` path
- [x] Add regression coverage for the Azure complete-env bootstrap path so the server bundle can import without touching App Configuration
- [x] Align hosted smoke-test auth redirect assertions with the runtime-configured Entra authority tenant instead of hardcoding `organizations`
- [x] Extend `Verify Production Runtime` failure output so the workflow prints `Container App` revision, replica, and recent logs when auth/smoke checks still time out after the infrastructure contract passes
- [x] Capture the hosted `Container App` CrashLoopBackOff log showing `prisma migrate deploy` cannot find `datasource.url` because the runtime image omits `prisma.config.ts`
- [x] Patch the runtime Docker image so `prisma.config.ts` is copied into the final stage and startup migrations can resolve the Azure SQL URL before the server starts
- [x] Capture the follow-on hosted startup failure where `prisma migrate deploy` reaches Azure SQL but exits with `P1000 Authentication failed`
- [x] Patch SQL bootstrap principal convergence so reused Azure SQL databases repair stale Entra principal `SID` mappings after runtime or migration identities are recreated with the same name
- [x] Add regression coverage for SQL bootstrap principal reconciliation against current Entra object IDs
- [x] Capture the bootstrap recovery failure where the SQL bootstrap Container Apps Job stays `Running` because `az containerapp job create` serialized `/bin/sh -lc ...` into a single malformed command string
- [x] Patch bootstrap recovery so the SQL bootstrap job passes `--command` and `--args` as separate values and actually executes the injected `init-sql.mjs`
- [x] Capture the follow-on bootstrap recovery failure where `az containerapp job create` still rejects `--args` and aborts before the Azure-hosted SQL bootstrap job starts
- [x] Prove locally that the shared runtime image can switch between default app startup and injected SQL bootstrap command execution via command override
- [x] Use the local command-override result to settle the bootstrap workflow shape before the next recovery rerun
- [x] Validate the same shared `GHCR` image on an isolated Azure `Container Apps` environment by deploying a scratch Runtime resource from local CLI
- [x] Validate the same shared `GHCR` image on the same isolated Azure `Container Apps` environment by deploying and starting a scratch manual Job with execution-time command override from local CLI
- [x] Patch bootstrap recovery to create a simple Azure-hosted SQL bootstrap job and pass command/args/env overrides through `az containerapp job start --yaml`
- [x] Capture the follow-on hosted SQL bootstrap failure where the injected `/tmp/init-sql.mjs` cannot resolve `mssql` from outside `/app/node_modules`
- [x] Patch SQL bootstrap command injection so the transient script is written and executed from `/app` instead of `/tmp`, preserving Node package resolution inside the runtime image
- [x] Capture the follow-on hosted SQL bootstrap failure where runtime and migration principal reconciliation redeclare the same SQL batch variables
- [x] Patch SQL bootstrap reconciliation so runtime and migration principal blocks use distinct SQL variable names inside the shared batch
- [x] Capture the follow-on hosted SQL bootstrap failure where `CREATE USER ... FROM EXTERNAL PROVIDER` cannot resolve runtime or migration principals because the Azure SQL logical server has no Microsoft Entra lookup identity
- [x] Patch hosted runtime and SQL bootstrap identity plumbing so Azure SQL principal creation uses dedicated user-assigned runtime and migration identities with `CREATE USER ... WITH SID, TYPE = E`, avoiding Microsoft Graph resolution during recovery
- [x] Capture the follow-on recovery planning failure where `resolve-hosted-resource-inputs.sh` treated all user-assigned identities as a single pool and aborted before infra deploy when the new runtime identity did not yet exist
- [x] Patch hosted resource resolution so SQL runtime, migration, and bootstrap identities use exact-match-or-default name selection instead of generic single-resource inference
- [x] Capture the follow-on runtime crash where Prisma still returned `P1000` under `DefaultAzureCredential` after SQL principal bootstrap succeeded
- [x] Patch the hosted Prisma path so runtime and migration preserve `DefaultAzureCredential` URLs and target the intended user-assigned identity through `AZURE_CLIENT_ID`
- [x] Remove the temporary `ActiveDirectoryManagedIdentity` rewrite path after confirming Prisma's hosted MSSQL path accepts `DefaultAzureCredential` directly
- [x] Push the SQL bootstrap principal repair to `main` and rerun `Bootstrap Azure Recovery` against `green` with the current immutable image so live Azure SQL principals are reconciled
- [ ] Confirm the recovery workflow, smoke test, and scheduled or manual runtime verification succeed after the SQL principal repair

## Section 6 - Workflow-Owned Migration Split
### Subsection 6.1 - Flow And Contract Redesign
- [x] Re-inventory the release and recovery execution flow against the actual `Private Endpoint` and `Managed Identity` constraints
- [x] Rewrite the canonical spec so GitHub-hosted workflow jobs stay on the Azure control plane and Azure SQL data-plane work moves to Azure-hosted jobs
- [x] Enumerate required GitHub Environment variables, secrets, Azure RBAC, SQL grants, registry preconfiguration, and network prerequisites in the durable docs

### Subsection 6.2 - Runtime And Workflow Refactor
- [x] Remove Prisma migration from `Container App` runtime startup and make the runtime image start the server process only
- [x] Add a dedicated Azure-hosted Prisma migration job path for routine release
- [x] Add a dedicated Azure-hosted Prisma migration job path for bootstrap recovery
- [x] Remove migration identity attachment and startup migration env drift from the runtime `Container App` contract
- [x] Extend runtime verification so it asserts the runtime identity and env split after rollout

### Subsection 6.3 - Validation And Release
- [x] Run local validation for the refactored runtime scripts, workflow YAML, and Azure helper scripts
- [x] Push the workflow-owned migration split to `main`
- [ ] Publish a release that exercises the new migration-job flow and capture the hosted result
- [x] Align routine release with the documented SQL principal bootstrap contract before the Azure-hosted migration job runs
- [ ] Correct the hosted Prisma managed-identity path to stop rewriting `DATABASE_URL`, validate locally, and rerun the routine release until it completes
- [x] Add Azure-hosted SQL preflight logging to the migration job so the next rerun can distinguish managed-identity login failure from Prisma CLI failure
- [x] Prove under the hosted migration identity that direct `mssql` login succeeds even when Prisma CLI still returns `P1000`
- [x] Replace Azure-hosted `prisma migrate deploy` with a repo-owned `mssql` runner that applies checked-in Prisma SQL migrations and records `_prisma_migrations` state
- [x] Validate the repo-owned SQL migration runner locally against a fresh SQL Server database and idempotent rerun behavior
- [x] Patch the runtime image packaging so the Azure-hosted migration job ships `scripts/prisma-sql-migration-runner.mjs`
- [ ] Publish a release that exercises the repo-owned Azure-hosted SQL migration runner and capture the hosted result

Notes:
- Remaining intentional non-idempotent behavior is limited to run-scoped artifact names such as Azure deployment names and transient Container Apps Job / execution names used by workflow runs.
- Local command-override verification used the published `GHCR` image `ghcr.io/anaregdesign/arcade-spec:v2026.03.18.9`; because the package is currently `linux/amd64` only, the local Docker run used `--platform linux/amd64` on the Apple Silicon workstation.
- Local Azure validation on scratch `Container Apps` reproduced the CLI parse failure for `az containerapp job start --args "-lc" ...` but succeeded with `az containerapp job start --yaml /tmp/aca-job-execution.yaml`, so the workflow path needs the YAML execution-override shape rather than direct `--args`.
- Hosted run `23277105400` showed the YAML execution override reaching the job container, but the injected script failed with `ERR_MODULE_NOT_FOUND: Cannot find package 'mssql' imported from /tmp/init-sql.mjs`; the fix is to keep the injected file under `/app` so Node resolves `/app/node_modules`.
- Local Docker validation against `ghcr.io/anaregdesign/arcade-spec:v2026.03.18.9` confirmed that writing the actual injected SQL bootstrap script to `/app/init-sql.injected.mjs` changes the first failure from `ERR_MODULE_NOT_FOUND` to the expected missing-env check (`ARCADE_SQL_SERVER must be set.`), proving package resolution is restored.
- Hosted run `23277508599` moved past module resolution but failed inside Azure SQL because the generated bootstrap batch declared `@principal_name` and `@principal_object_id` twice; the next patch must isolate runtime and migration variable names within the same batch.
- Hosted run `23277832944` moved past batch-variable collisions and showed the deeper Azure SQL constraint: `CREATE USER ... FROM EXTERNAL PROVIDER` failed for both runtime and migration service principals because the logical server had no server identity / Microsoft Graph lookup path (`Msg 33134`). The durable repo-side fix is to bootstrap dedicated runtime and migration user-assigned identities by client ID with `CREATE USER ... WITH SID, TYPE = E`, which avoids Microsoft Graph resolution entirely for Azure SQL Database.
- Hosted run `23278246644` then failed earlier in `Resolve existing hosted resources` because the generic resolver treated all user-assigned identities in `rg-arcade-green` as one ambiguous type and aborted before infra deploy when `id-sql-runtime-arcade-green` was still absent. Identity resources need exact-match-or-default resolution instead of single-resource fallback.
- Hosted run `23278395882` cleared infra deployment and SQL bootstrap, but the new revision `ca-arcade-green--0000013` still entered `CrashLoopBackOff`. The replica log shows `prisma migrate deploy` reaching Azure SQL and failing with `P1000 Authentication failed`, so the remaining issue is now the Prisma Managed Identity connection path rather than principal bootstrap orchestration.
- Release run `23278951042` with image `v2026.03.19.1` proved the runtime wrapper was taking effect, but the later package inspection showed that preserving `DefaultAzureCredential` was the better contract than injecting `ActiveDirectoryManagedIdentity`.
- Release run `23280239848` (`v2026.03.19.4`) proved the Azure-hosted migration job wiring works, but also exposed a contract gap: routine release skipped SQL principal convergence entirely while recovery still ran it. Because the migration identity can drift independently of the runtime image, routine release must run the same Azure-hosted SQL bootstrap job before the migration job.
- Release run `23280741512` (`v2026.03.19.5`) proved routine release now runs SQL principal bootstrap successfully before the migration job, but the migration job still failed with `P1000` after logging `Using ActiveDirectoryManagedIdentity Prisma auth...`. Local package inspection shows both Prisma's MSSQL adapter and query-plan executor already support `authentication=DefaultAzureCredential`, so the hosted contract should preserve `DATABASE_URL` and rely on `AZURE_CLIENT_ID` instead of rewriting to `ActiveDirectoryManagedIdentity`.
- Release run `23281236661` (`v2026.03.19.6`) still failed with `P1000` even after preserving `DefaultAzureCredential`, which means the remaining ambiguity is now between the migration identity login itself and Prisma CLI's SQL Server auth support. The next rerun must log a direct `mssql` preflight under the same migration identity before `prisma migrate deploy`.
- Release run `23281632418` (`v2026.03.19.7`) resolved that ambiguity: the direct `mssql` preflight succeeded under the migration identity and printed the expected Azure SQL login context, but `prisma migrate deploy` still failed with `P1000`. The blocker is Prisma CLI's hosted SQL Server auth path, not Azure SQL principal bootstrap.
- Local validation on 2026-03-19 proved that the checked-in Prisma SQL files apply cleanly through the repo-owned `mssql` runner on a fresh SQL Server database and then skip cleanly on a second run. The custom runner must become the hosted migration contract instead of Prisma CLI.
- Release run `23282301861` (`v2026.03.19.8`) reached the new Azure-hosted migration job, but the container failed with `ERR_MODULE_NOT_FOUND: Cannot find module '/app/scripts/prisma-sql-migration-runner.mjs'`. The repo-side logic is correct; the next rerun only needs the runtime image to copy the new runner file.
- Release run `23284457421` (`v2026.03.19.10`) completed `success`; the last remaining hosted blocker was the smoke test's hardcoded `organizations` authority assertion, not the app-side tenant-scoped redirect contract.

## Section 7 - Workflow Role Split
### Subsection 7.1 - Contract And Plan
- [x] Rewrite the durable workflow contract so entry workflows own only role-specific jobs and shared rollout responsibilities move to a reusable workflow
- [x] Add the execution slice for the workflow role split to the active plan before substantial YAML refactoring

### Subsection 7.2 - Reusable Rollout Refactor
- [x] Extract the duplicated `sync_runtime_config -> bootstrap_sql -> migration -> deploy_app -> smoke_test` path into a shared reusable workflow
- [x] Refactor `Release Azure Delivery` so it builds/publishes the image, plans/deploys infra, then calls the shared rollout workflow
- [x] Refactor `Bootstrap Azure Recovery` so it resolves the recovery image, bootstraps infra/RBAC, then calls the shared rollout workflow before `verify_runtime`
- [x] Preserve environment boundaries so release keeps `production`, recovery keeps `production-bootstrap` for bootstrap-only jobs, and shared rollout uses the correct caller-provided environment names

### Subsection 7.3 - Validation
- [x] Validate the refactored workflow YAML locally and capture any remaining hosted follow-up

Notes:
- Local validation for the workflow role split used Ruby YAML parse, `actionlint`, and `git diff --check` for the three touched workflow files. Hosted validation remains the next follow-up.
- Release run `23285650832` (`v2026.03.19.12`) reached reusable workflow resolution but failed at workflow startup because the caller job did not grant `id-token: write`; reusable workflow callers need to declare the OIDC permission budget that nested jobs consume.
