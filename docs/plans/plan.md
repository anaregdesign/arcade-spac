# Execution Plan

## Links
- Spec: /docs/spec/specification.md
- Operations: /docs/production-operations.md

## Section 1 - Result recommendation refresh
### Subsection 1.1 - Spec and shared card alignment
- [ ] Update the durable spec to capture the result screen recommendation refresh and reduced detail density
- [ ] Extract a shared game preview card that can be reused by Home and Result screens without changing the Home dashboard behavior

### Subsection 1.2 - Result screen recommendation update
- [ ] Extend result recommendation data with thumbnail preview metadata
- [ ] Replace the result recommendation cards with the shared preview card and reduce non-essential recommendation copy above the grid

### Subsection 1.3 - Verification
- [ ] Install dependencies if the local toolchain is unavailable, then run typecheck
- [ ] Run targeted unit tests for the touched home and result use cases
- [ ] Run the production build
