# Execution Plan

## Links
- Spec: /Users/hiroki/arcade-spec/docs/spec/bicep-constant-centralization.md

## Section 1 - Improve Bicep Constant Readability
### Subsection 1.1 - Reshape the constant block
- [x] Group the top-level `var` definitions in `infra/main.bicep` by meaning without changing deploy behavior.
- [x] Add a short comment for each `var` so its contract role is explicit when reading the file.

### Subsection 1.2 - Validate the cleanup
- [x] Run Bicep validation and confirm the diff is a readability-only refactor.
