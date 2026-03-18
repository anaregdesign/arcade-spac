# Execution Plan

## Links
- Spec: /docs/spec/production-rg-arcade-release-retarget.md

## Section 1 - Target Contract And Repository State
### Subsection 1.1 - Spec And Inventory
- [x] Write the operator-facing spec for the `rg-arcade` release retarget
- [x] Inventory the required `production` and `production-bootstrap` variables and secrets from the workflow contract
- [x] Confirm the target Azure resource group naming and current repo-side mismatches
- [x] Lock the provisioning test assumption that `rg-arcade` starts empty and existing resource groups stay out of scope

## Section 2 - GitHub Environment Repair
### Subsection 2.1 - Environment Shape
- [x] Create or repair the `production-bootstrap` GitHub Environment
- [x] Update `production` variables so routine release targets `rg-arcade`
- [x] Complete the remaining `production-bootstrap` variables so bootstrap/recovery targets `rg-arcade`

### Subsection 2.2 - Secret Registration
- [x] Generate or retrieve fresh required `production` secrets for the empty-target provisioning test
- [x] Generate or retrieve required `production-bootstrap` secrets for the empty-target provisioning test

### Subsection 2.3 - Identity And Access
- [x] Confirm or create the `production-bootstrap` OIDC identity with the required federated credential
- [x] Grant `production` the required `rg-arcade` roles for release-time infra and runtime config sync
- [x] Grant `production-bootstrap` the required bootstrap scope permissions for empty resource-group creation and role assignment

### Subsection 2.4 - Workflow Reliability
- [x] Identify the empty-target Front Door private link approval deadlock in bootstrap/release delivery
- [x] Patch the bootstrap and routine release workflows so deployment starts asynchronously, approval runs, and completion is awaited before downstream jobs

## Section 3 - Release Delivery
### Subsection 3.1 - Push And Release
- [ ] Commit and push any repository-side changes required for this retarget
- [ ] Publish a GitHub Release that triggers the routine release workflow
- [ ] Monitor the workflow and capture the deploy result for `rg-arcade`

### Subsection 3.2 - Verification
- [ ] Rerun the bootstrap workflow with the patched delivery path and confirm it succeeds against empty-target assumptions
- [ ] Run or confirm the hosted verification workflow for the released target
- [ ] Update the active plan to reflect the final release outcome and remaining drift, if any
