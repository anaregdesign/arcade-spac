# Execution Plan

## Links
- Spec: /Users/hiroki/arcade-spec/docs/spec/oidc-only-azure-bootstrap-recovery.md

## Section 1 - Shift Azure Bootstrap And Recovery To OIDC-Only Delivery
### Subsection 1.1 - Capture the target contract
- [x] Confirm the repo surfaces that still assume local Azure bootstrap or local recovery execution.
- [x] Define the workflow-only bootstrap contract and the separation between bootstrap and routine release identities.

### Subsection 1.2 - Implement OIDC bootstrap delivery
- [x] Update `infra/main.bicep` so SQL bootstrap can run from a workflow-owned Azure execution path without external SQL Entra admin inputs.
- [x] Add a bootstrap workflow that creates the resource group, deploys the hosted baseline, and bootstraps initial Azure SQL principals through GitHub Actions OIDC.
- [x] Keep the routine release workflow aligned with the new SQL bootstrap and identity contract.

### Subsection 1.3 - Remove Obsolete Bootstrap Entrypoints And Docs
- [x] Remove local-only npm script entrypoints and any local bootstrap / recovery runbook that the new workflow replaces.
- [x] Update README and Azure docs to describe the workflow-only bootstrap and recovery path.

### Subsection 1.4 - Validate and close
- [x] Run the relevant Bicep, workflow, shell, and repository validation for the updated delivery path.
