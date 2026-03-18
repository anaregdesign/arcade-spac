# Execution Plan

## Links
- Spec: /Users/hiroki/arcade-spec/docs/spec/minimal-azure-redeploy-contract.md

## Section 1 - Simplify The Hosted Azure Contract
### Subsection 1.1 - Capture the target contract
- [x] Update the durable spec documents so they reflect the new minimal-local-ops redeploy contract.
- [x] Confirm the current IaC and workflow surfaces that should be removed or simplified.

### Subsection 1.2 - Remove unnecessary IaC paths
- [x] Simplify `infra/main.bicep` so the hosted baseline no longer depends on optional Azure SQL or private config-store branches.
- [x] Keep Azure SQL private connectivity and runtime/migration identity boundaries intact after the simplification.

### Subsection 1.3 - Move routine config sync into GitHub OIDC delivery
- [x] Update runtime config sync helpers so the workflow can resolve the required Azure store endpoints with minimal explicit inputs.
- [x] Add a release workflow job that syncs runtime config through GitHub Actions OIDC before app rollout.

### Subsection 1.4 - Align documentation and verification
- [x] Update README, prerequisites, operations runbook, and relevant specs to remove routine local Azure data-plane steps.
- [x] Update verification scripts and related guidance to match the new App Configuration / Key Vault access contract.

### Subsection 1.5 - Validate the change
- [x] Run targeted validation for the updated Bicep, workflow-adjacent scripts, and affected repository checks.
