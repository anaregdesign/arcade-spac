# Execution Plan

## Links
- Spec: [../spec/platform-delivery-specs.md](../spec/platform-delivery-specs.md)

## Section 1 - Define the updated delivery contract
- [x] Add or update the spec for CI/CD, IaC, and provisioning best-practice adoption.
- [x] Create the active execution plan for this delivery unit.

## Section 2 - Rebuild GitHub delivery workflows
### Subsection 2.1 - Release workflow hardening
- [x] Update the release workflow to use `publish`, `plan_infra`, `deploy_infra`, `deploy_app`, and `smoke_test`.
- [x] Switch the GitHub Environment contract to `AZURE_APP_NAME` plus generic registry variables and secrets.
- [x] Keep immutable image rollout explicit and use `what-if` output to skip infra deploy when there are no real changes.

### Subsection 2.2 - Quality gates before release
- [x] Add a push / pull request workflow that runs the required repository quality gates.
- [x] Ensure the quality gate validates GitHub workflow files and the Bicep entrypoint in addition to app checks.

## Section 3 - Align scripts and docs with the new contract
### Subsection 3.1 - Script compatibility
- [x] Update Azure helper scripts to derive Container App names from `AZURE_APP_NAME` when possible and keep explicit override support.
- [x] Keep runtime verification compatible with the hardened release workflow contract.
- [x] Remove unused runtime-secret deployment parameters from `infra/main.bicep` so release-time `what-if` can run without repo-hosted secret inputs.

### Subsection 3.2 - Repository and runbook documentation
- [x] Update prerequisite docs with the new GitHub Environment variable, secret, and RBAC expectations.
- [x] Update operations docs and rename runbooks with the new workflow shape and registry contract.

## Section 4 - Validate and close out
- [x] Run the relevant local verification commands for the touched workflows, scripts, and app code.
- [x] Summarize the best-practice gaps that were found and confirm the implemented repo-side remediations.
- [x] Archive this plan after all tracked work is complete.
