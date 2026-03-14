# Execution Plan

## Links
- Spec: `/docs/spec/production-recovery-and-redeploy.md`
- Related: `/docs/spec/azure-private-sql-and-entra-hardening.md`

## Section 1 - Confirm live Azure drift
- [x] Capture the current production-like Azure resource drift beyond the failing SQL public network check.
- [x] Decide whether the existing Container Apps environment can be converged in place or must be recreated for VNet integration.

## Section 2 - Converge live Azure resources with the private runtime contract
### Subsection 2.1 - Networking and platform remediation
- [x] Apply the required Azure networking and platform changes through the one-off local override path.
- [x] Ensure Azure SQL, App Configuration, Key Vault, and Container Apps all match the intended private-connectivity contract.

### Subsection 2.2 - Runtime contract remediation
- [x] Confirm the live runtime configuration path is still valid after the infra changes.
- [x] Re-run the release or direct app rollout only if the infra remediation changes require it.

## Section 3 - Validate and close
- [x] Run the live production verification and smoke checks after remediation.
- [x] Update the active plan with the final outcome and archive it if all tracked work is complete.

## Outcome
- Recreated `cae-arcade` and `ca-arcade` on the VNet-integrated private topology after Azure rejected in-place subnet attachment for the existing managed environment.
- Synced runtime config to App Configuration and Key Vault, rotated the Entra confidential client secret, updated the redirect URI to `https://ca-arcade.mangomoss-700713f4.japaneast.azurecontainerapps.io/auth/callback`, and removed public SQL firewall allowances.
- Verified the live environment with `scripts/azure/verify-production-runtime.sh` and `scripts/azure/smoke-test.sh`.
