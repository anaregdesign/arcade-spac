# Execution Plan

## Links
- Spec: /Users/hiroki/arcade-spec/docs/spec/bicep-constant-centralization.md

## Section 1 - Centralize Bicep Constants
### Subsection 1.1 - Capture the current constant surface
- [x] Identify the hardcoded resource names and contract strings in `infra/main.bicep` that should move to the top-level `var` block.
- [x] Keep the refactor bounded so behavior and deploy contract stay unchanged.

### Subsection 1.2 - Refactor the Bicep file
- [x] Add centralized `var` definitions for the meaningful fixed names and string literals.
- [x] Replace inline literals in resource bodies with the new top-level `var` references.

### Subsection 1.3 - Validate and close
- [x] Run the relevant Bicep validation and review the diff for behavior-preserving cleanup only.
