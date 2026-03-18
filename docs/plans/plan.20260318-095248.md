# Execution Plan

## Links
- Spec: /Users/hiroki/arcade-spec/docs/spec/front-door-edge-delivery.md

## Section 1 - Stabilize Hosted Smoke Test After Front Door Changes
### Subsection 1.1 - Diagnose and capture the delivery contract
- [x] Confirm the failing GitHub release run and identify which smoke-test check is timing out.
- [x] Update the Front Door delivery spec and operations guidance to reflect post-deploy propagation tolerance.

### Subsection 1.2 - Repair the smoke-test flow
- [x] Extend the release smoke-test retry budget when infrastructure changes were deployed.
- [x] Improve smoke-test failure diagnostics so the last HTTP status and response preview are visible in CI logs.

### Subsection 1.3 - Verify the repair
- [x] Validate the updated shell script syntax and execute the smoke test against the current hosted endpoint.
- [x] Review the workflow diff for the intended conditional retry behavior and mark this plan complete.
