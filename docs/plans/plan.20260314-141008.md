# Execution Plan

## Links
- Spec: [../spec/platform-delivery-specs.md](../spec/platform-delivery-specs.md)

## Section 1 - Capture the failing delivery state
- [x] Inspect the failing `Quality Gates` and `Release Azure Delivery` runs and record the actionable root causes.
- [x] Update this plan if more failing checks are discovered while investigating.
- [x] Confirm that `Quality Gates` fails because `rhysd/actionlint@v1` cannot be resolved at workflow setup time.
- [x] Confirm that `Release Azure Delivery` fails because the GitHub `production` Environment is missing `AZURE_APP_NAME`.
- [x] Confirm that the next `Quality Gates` retry also needs `npm run db:generate` before typecheck because CI does not have a generated Prisma client by default.
- [x] Confirm that the next `Release Azure Delivery` retry still fails because `plan_infra` evaluates bootstrap-only Azure role assignments and the routine deploy identity does not have `Microsoft.Authorization/roleAssignments/write`.

## Section 2 - Fix repository-side delivery regressions
### Subsection 2.1 - Quality gate remediation
- [x] Apply the repository-side fix for the failing push CI run.
- [x] Re-run the relevant local validation for the quality gate change.

### Subsection 2.2 - Release workflow remediation
- [x] Set the GitHub `production` Environment variable `AZURE_APP_NAME` to the canonical app name without weakening the repo-side contract.
- [x] Re-run the relevant validation for the release workflow change.
- [x] Split bootstrap-only runtime RBAC provisioning from the day-to-day release workflow so `plan_infra` and `deploy_infra` do not require `roleAssignments/write`.
- [x] Re-run the relevant validation for the least-privilege release path.

## Section 3 - Ship and verify
- [x] Commit the first remediation with Conventional Commit messages.
- [x] Push `main` to `origin`.
- [x] Publish a new GitHub release and monitor the resulting workflow run.
- [x] Commit the least-privilege release remediation with a Conventional Commit message.
- [x] Push `main` to `origin`.
- [x] Publish a new GitHub release and monitor the resulting workflow run.
- [x] Archive this plan after the tracked work is complete.
