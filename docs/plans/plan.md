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

### Subsection 4.4 - Validation
- [x] Run local validation for touched shell scripts, workflow YAML, and targeted app/runtime scripts
- [x] Summarize any remaining non-idempotent behavior that is intentionally limited to run-scoped artifact creation
- [x] Fix the `actionlint` `shellcheck` failure in bootstrap workflow retry loops introduced by the idempotency hardening slice

Notes:
- Remaining intentional non-idempotent behavior is limited to run-scoped artifact names such as Azure deployment names and transient Container Apps Job / execution names used by workflow runs.
