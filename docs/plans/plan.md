# Execution Plan

## Links
- Spec: /docs/spec/specification.md
- Legacy reference: /docs/spec/production-rg-arcade-green-release-retarget.md

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
- [ ] Push the SQL bootstrap principal repair to `main` and rerun `Bootstrap Azure Recovery` against `green` with the current immutable image so live Azure SQL principals are reconciled
- [ ] Confirm the recovery workflow, smoke test, and scheduled or manual runtime verification succeed after the SQL principal repair

Notes:
- Remaining intentional non-idempotent behavior is limited to run-scoped artifact names such as Azure deployment names and transient Container Apps Job / execution names used by workflow runs.
- Local command-override verification used the published `GHCR` image `ghcr.io/anaregdesign/arcade-spec:v2026.03.18.9`; because the package is currently `linux/amd64` only, the local Docker run used `--platform linux/amd64` on the Apple Silicon workstation.
- Local Azure validation on scratch `Container Apps` reproduced the CLI parse failure for `az containerapp job start --args "-lc" ...` but succeeded with `az containerapp job start --yaml /tmp/aca-job-execution.yaml`, so the workflow path needs the YAML execution-override shape rather than direct `--args`.
- Hosted run `23277105400` showed the YAML execution override reaching the job container, but the injected script failed with `ERR_MODULE_NOT_FOUND: Cannot find package 'mssql' imported from /tmp/init-sql.mjs`; the fix is to keep the injected file under `/app` so Node resolves `/app/node_modules`.
- Local Docker validation against `ghcr.io/anaregdesign/arcade-spec:v2026.03.18.9` confirmed that writing the actual injected SQL bootstrap script to `/app/init-sql.injected.mjs` changes the first failure from `ERR_MODULE_NOT_FOUND` to the expected missing-env check (`ARCADE_SQL_SERVER must be set.`), proving package resolution is restored.
- Hosted run `23277508599` moved past module resolution but failed inside Azure SQL because the generated bootstrap batch declared `@principal_name` and `@principal_object_id` twice; the next patch must isolate runtime and migration variable names within the same batch.
- Hosted run `23277832944` moved past batch-variable collisions and showed the deeper Azure SQL constraint: `CREATE USER ... FROM EXTERNAL PROVIDER` failed for both runtime and migration service principals because the logical server had no server identity / Microsoft Graph lookup path (`Msg 33134`). The durable repo-side fix is to bootstrap dedicated runtime and migration user-assigned identities by client ID with `CREATE USER ... WITH SID, TYPE = E`, which avoids Microsoft Graph resolution entirely for Azure SQL Database.
- Hosted run `23278246644` then failed earlier in `Resolve existing hosted resources` because the generic resolver treated all user-assigned identities in `rg-arcade-green` as one ambiguous type and aborted before infra deploy when `id-sql-runtime-arcade-green` was still absent. Identity resources need exact-match-or-default resolution instead of single-resource fallback.
