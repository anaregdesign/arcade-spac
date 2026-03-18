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
