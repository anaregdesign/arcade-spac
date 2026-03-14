# Execution Plan

## Links
- Spec: /docs/spec/production-runtime-verification-cli-compatibility.md

## Section 1 - Restore Verification And Ship Release
### Subsection 1.1 - Patch the production verification contract
- [x] Capture the delivery requirement in a dedicated spec for verification compatibility and release handling
- [x] Update `scripts/azure/verify-production-runtime.sh` so Key Vault and App Configuration checks avoid Azure CLI default API version drift
- [x] Run targeted verification for the updated production verification script

### Subsection 1.2 - Validate and deliver
- [x] Run repository verification needed before push
- [x] Commit the CI fix in a reviewable unit
- [x] Push `main` to `origin`
- [x] Publish a new GitHub Release through the repository workflow path
- [x] Confirm the triggered GitHub Actions runs and archive the completed plan
