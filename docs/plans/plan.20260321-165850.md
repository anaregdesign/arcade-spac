# Execution Plan

## Links
- Spec: /docs/spec/specification.md
- Operations: /docs/production-operations.md

## Section 1 - Next Delivery Unit
- [x] Update the release delivery contract so app-only releases skip Azure infrastructure plan/deploy without blocking rollout
- [x] Add release-scope classification to the release workflow before Azure infrastructure planning
- [x] Keep Azure `what-if` as the second-stage infra gate when infra-owned repo files changed
- [x] Validate the updated release workflow logic and capture the result here

## Notes

- Release `v2026.03.21.1` attempted Azure infra convergence even though the delivery slice was app-only and failed on subnet update contention (`AnotherOperationInProgress` on `vnet-arcade-green/snet-pe`).
- The workflow change should prevent app-only releases from entering `plan_infra` / `deploy_infra` at all while preserving `what-if` gating for true infra edits and avoiding over-broad matches on non-baseline Azure helper scripts.
- Validation: `git diff --name-only v2026.03.20.4 v2026.03.21.1 -- infra scripts/azure/append-bicep-resource-parameters.sh scripts/azure/environment-resource-names.sh scripts/azure/resolve-hosted-resource-inputs.sh` returned no paths, which means the narrowed classifier would skip infra for the latest app-only release.
