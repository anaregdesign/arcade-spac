# Release Execution Plan

## Links

- Spec: `/docs/spec/production-recovery-and-redeploy.md`

## Section 1 - Local Verification

- [x] Confirm the release target commit and working tree state.
- [x] Run the local verification commands required before release.
- [x] Record any release blockers discovered during local verification.

## Section 2 - Release Delivery

- [x] Push the release target commit to `origin/main`.
- [x] Create a new GitHub release tag that triggers the production workflow.
- [x] Monitor the GitHub Actions release workflow until publish and deploy complete.

## Section 3 - Production Confirmation

- [x] Verify the released image and ready revision match the new tag.
- [x] Verify production `/health` and the hosted smoke path succeed after the release.

## Section 4 - Cleanup

- [x] Archive this execution plan after the release verification is complete.
