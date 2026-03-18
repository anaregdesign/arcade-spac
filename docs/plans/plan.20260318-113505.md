# Execution Plan

## Links
- Spec: /Users/hiroki/arcade-spec/docs/spec/azure-delivery-contract-cleanup.md

## Section 1 - Remove Unnecessary Azure Delivery Contract Surface
### Subsection 1.1 - Refactor the template-owned runtime contract
- [x] Update `infra/main.bicep` so routine release no longer needs SQL admin login/password and the Container App carries the migration identity plus startup migration env contract directly.

### Subsection 1.2 - Simplify workflow resource discovery
- [x] Remove bootstrap-only SQL admin secret usage from `.github/workflows/release-container-image.yml`.
- [x] Remove unused `AZURE_APP_NAME` validation from `ensure_resource_group`.
- [x] Replace workflow naming reconstruction and Front Door private-link description filtering with resource discovery or run-scoped values.

### Subsection 1.3 - Delete obsolete helper and app code
- [x] Remove helper code that becomes unnecessary once migration identity and startup migration env values are template-owned.
- [x] Tighten remaining helper scripts to use the cleanup contract only.

### Subsection 1.4 - Align docs and verify
- [x] Update Azure delivery docs to reflect the new `production` and `production-bootstrap` environment contract.
- [x] Run validation, mark the plan complete, and archive it.
