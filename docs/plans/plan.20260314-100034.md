# Execution Plan

## Links
- Spec: `/docs/spec/azure-private-sql-and-entra-hardening.md`

## Section 1 - Re-open the remaining hardening slice
- [x] Confirm the remaining repo-side tasks after the private-network IaC change and keep this plan current.

## Section 2 - Implement Azure-backed runtime bootstrap
### Subsection 2.1 - App runtime config loading
- [x] Add the Azure SDK dependencies and implement a server-side runtime config bootstrap that reads non-secret settings from App Configuration and secrets from Key Vault.
- [x] Keep the existing local-development fallback path intact when Azure-backed bootstrap is unavailable or intentionally unset.

### Subsection 2.2 - Runtime store synchronization path
- [x] Add a repository-side script that can populate the expected App Configuration keys and Key Vault secrets from explicit inputs.
- [x] Update repo verification so the production data-path checks match the secretless runtime contract.

## Section 3 - Align documentation and workflow guidance
- [x] Update README and Azure docs so they describe the Azure-backed runtime bootstrap as the current target contract.
- [x] Record the remaining cloud-side deploy and live-verification steps without violating the repository deploy policy.

## Section 4 - Validate and close
- [x] Run the relevant install, typecheck, and build validation after the runtime bootstrap changes.
- [x] Archive `/docs/plans/plan.md` after all tracked work is complete.
