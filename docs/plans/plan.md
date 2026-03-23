# Execution Plan

## Links
- Spec: /docs/spec/specification.md
- Operations: /docs/production-operations.md

## Section 1 - Next Delivery Unit
- [x] Confirm the release failure is caused by routine release entering the shared runtime-config sync path even when the release only needs artifact publication
- [x] Keep bootstrap recovery as the full convergence reference path and isolate the change to routine release classification only
- [x] Extend `release-container-image.yml` so routine release decides whether it needs rollout at all, and whether runtime-config sync or database jobs are required
- [x] Gate `shared-azure-rollout.yml` runtime-config and database jobs behind explicit workflow-call inputs while preserving the deploy and smoke path when rollout is still required
- [x] Align the Azure delivery spec and runbooks with the new release-stage classification contract
- [x] Validate the touched workflow files after the change
