# Execution Plan

## Links
- Spec: /Users/hiroki/arcade-spec/docs/spec/env-driven-azure-redeploy-contract.md

## Section 1 - Collapse Azure Redeploy Naming To AZURE_APP_NAME
### Subsection 1.1 - Refit IaC and workflows to a single source of truth
- [x] Remove `AZURE_CONTAINER_APP_NAME` from workflow contracts and derive the Container App target as `ca-${AZURE_APP_NAME}`.
- [x] Return `infra/main.bicep` to an `appName`-owned Container App naming contract.

### Subsection 1.2 - Remove redundant app and script contract surface
- [x] Update workflow-owned helper scripts and app runtime detection to use `AZURE_APP_NAME` only.
- [x] Remove the runtime `AZURE_CONTAINER_APP_NAME` env injection and verification dependency.

### Subsection 1.3 - Update docs and revalidate
- [x] Rewrite the Azure delivery docs/specs around the `AZURE_APP_NAME` single-source contract.
- [x] Run validation, then archive the updated plan.
