# Execution Plan

## Links
- Spec: `/docs/spec/feature-specs.md`
- Product: `/docs/spec/product-specs.md`
- Operations: `/docs/production-operations.md`
- Prerequisites: `/docs/azure-prerequisites.md`

## Section 1 - External Organization Sign-In Rollout
### Subsection 1.1 - Durable Contract Alignment
- [x] Update checked-in docs to state the multi-tenant workforce auth contract and required hosted settings

### Subsection 1.2 - Hosted Auth Configuration
- [x] Update the `production` GitHub Environment auth authority tenant to `organizations`
- [x] Reconfirm the production Entra app registration still matches the intended `web` + `AzureADMultipleOrgs` contract

### Subsection 1.3 - Verification
- [x] Verify the affected runtime and delivery assumptions after the hosted config change
- [x] Summarize whether a follow-up GitHub workflow run is still required for live runtime sync

Notes:
- `production` GitHub Environment now stores `ENTRA_AUTHORITY_TENANT=organizations`.
- The production app registration `arcade-spec-prod-web` already uses `signInAudience=AzureADMultipleOrgs`.
- A follow-up GitHub workflow rollout is still required before the live hosted runtime picks up the new authority tenant from workflow-synced runtime config.
