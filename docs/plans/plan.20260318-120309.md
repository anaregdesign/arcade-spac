# Execution Plan

## Links
- Spec: /Users/hiroki/arcade-spec/docs/spec/env-driven-azure-redeploy-contract.md

## Section 1 - Make Azure Redeploy Deterministic For Recreated Resource Groups
### Subsection 1.1 - Align IaC with GitHub Environment owned names
- [x] Update `infra/main.bicep` so Container App resource naming is caller-controlled from GitHub Environment while internal-only resource names stay template-derived.

### Subsection 1.2 - Simplify workflow target resolution
- [x] Update bootstrap, release, and verification workflows to require and use `AZURE_CONTAINER_APP_NAME`.
- [x] Replace container app discovery with env-driven targeting and keep only the minimum lookup required for managed environment operations.
- [x] Keep empty-resource-group and recreated-resource-group behavior safe through retries or fail-fast checks where needed.

### Subsection 1.3 - Align docs and validate
- [x] Update the Azure delivery docs to document `AZURE_CONTAINER_APP_NAME` as part of the GitHub Environment contract.
- [x] Run validation, then archive the plan.
