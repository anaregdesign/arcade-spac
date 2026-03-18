# Execution Plan

## Links
- Spec: /Users/hiroki/arcade-spec/docs/spec/bicep-constant-centralization.md

## Section 1 - Minimize Public Bicep Parameter Surface
### Subsection 1.1 - Confirm the necessary contract boundary
- [x] Verify which `infra/main.bicep` parameters are actually caller-controlled from the current GitHub workflow contract.
- [x] Keep bootstrap-only Azure SQL create-time inputs if they are still required.

### Subsection 1.2 - Remove internal-only parameters
- [x] Convert internal-only `infra/main.bicep` parameters into template-owned constants or inline values.
- [x] Keep the grouped `var` structure and comments coherent after the contract reduction.

### Subsection 1.3 - Validate and archive
- [x] Run Bicep validation and diff hygiene checks.
- [x] Mark the plan complete and archive it.
