# Production Operations

This runbook records the repository-side production contract for Arcade on Azure. Production bootstrap, recovery, release, and verification are all workflow-driven through GitHub Actions OIDC.

## Repository Target Contract

- Resource group: `rg-arcade-spec-dev`
- Container App: `ca-arcade`
- Container Apps environment: `cae-arcade`
- Azure Front Door profile: `afd-arcade`
- Public app URL: Azure Front Door endpoint host or the final custom domain
- App ingress: external through Azure Front Door
- Container Apps environment exposure: VNet-integrated delegated subnet with `publicNetworkAccess=Disabled`
- Azure SQL: `Microsoft Entra ID` only auth, `publicNetworkAccess=Disabled`, `Private Endpoint`, and `privatelink.database.windows.net`
- App Configuration and Key Vault: workflow-synced hosted config stores with Azure RBAC protected access
- Runtime bootstrap: `AZURE_APPCONFIG_ENDPOINT` and `AZURE_KEY_VAULT_URI` env values, `Arcade:` App Configuration keys, and Key Vault references for secrets
- Health route: `/health`

## Workflow Entry Points

- Full bootstrap or worst-case recovery:
  - `.github/workflows/bootstrap-azure-recovery.yml`
  - uses the `production-bootstrap` OIDC identity to create the resource group, deploy the hosted baseline, approve Azure Front Door private-link requests, and bootstrap initial Azure SQL principals
  - uses the `production` OIDC identity to sync runtime config, deploy the recovery image, smoke-test the result, and verify the runtime contract
- Routine deploy:
  - `.github/workflows/release-container-image.yml`
  - job shape: `publish` -> `plan_infra` -> `deploy_infra` -> `sync_runtime_config` -> `deploy_app` -> `smoke_test`
- Runtime verification:
  - `.github/workflows/verify-production-runtime.yml`

## Current Verification Status

- The repository contract was updated on March 14, 2026 to prefer Azure SQL private connectivity and `Entra-only` auth.
- The repository contract was updated on March 18, 2026 to publish through Azure Front Door Premium with a private-link origin to Azure Container Apps.
- The repository contract now expects resource-group bootstrap, initial Azure SQL principal creation, runtime config sync, release deploy, smoke test, and runtime verification to be workflow-driven through GitHub Actions OIDC.
- The routine release workflow still passes `manageRuntimeRoleAssignments=false`, so least-privilege day-to-day delivery remains narrower than the bootstrap workflow.
- The routine `production` Environment no longer carries SQL admin login/password; that bootstrap-only secret surface is isolated to `production-bootstrap`.
- This workspace did not perform a production or shared-environment deployment.

## Rollback Guidance

- Do not restore Azure SQL public access or the `AllowAzureServices` firewall rule as a rollback shortcut.
- Keep the private-network contract intact while restoring the previous known-good image.
- Use GitHub workflow paths instead of local Azure CLI:
  - for routine rollback, rerun the appropriate release path with the known-good image or release tag
  - when resource-group recreation or full convergence is safer, run `Bootstrap Azure Recovery` with the known-good immutable `image_ref`
- Re-run hosted verification after rollback through the workflow path.

## Routine Release Procedure

1. Confirm the `Quality Gates` workflow passed for the release target commit.
2. Keep the GitHub `production` Environment runtime values and secrets current.
3. When redeploying into another resource group during dev, update `AZURE_RESOURCE_GROUP` and `AZURE_APP_NAME` first.
4. Keep `PUBLIC_APP_URL` aligned to the final custom domain URL, or leave it unset so the workflow derives the current Front Door host automatically.
5. Update the Microsoft Entra app registration redirect URI when the public host changes.
6. Publish the release so the GitHub workflow runs `publish`, `plan_infra`, `deploy_infra`, `sync_runtime_config`, `deploy_app`, and `smoke_test`.
7. Confirm the workflow completed successfully.
8. Use `Verify Production Runtime` for the post-release contract check.
9. Verify hosted sign-in, gameplay, result, rankings, and profile screens in a browser.

## Full Bootstrap Or Recovery Procedure

1. Choose a known-good release tag or immutable full `image_ref` such as `v2026.03.18.4` or `ghcr.io/anaregdesign/arcade-spec:v2026.03.18.4`.
2. Confirm `AZURE_RESOURCE_GROUP`, `AZURE_LOCATION`, and `AZURE_APP_NAME` point at the target environment.
3. Trigger `Bootstrap Azure Recovery`.
4. Confirm `ensure_resource_group`, `deploy_bootstrap_infra`, `bootstrap_sql`, `sync_runtime_config`, `deploy_app`, `smoke_test`, and `verify_runtime` all succeed.
5. Verify hosted sign-in and the core browser flows through the recovered public host.
6. Refresh this document with the exact live Front Door host, image reference, revision, and any cloud-side deviations from the target contract.

## Operational Notes

- The repository contract now treats Azure Front Door as the canonical public entrypoint. Keep `PUBLIC_APP_URL`, browser smoke checks, and Entra redirect URIs aligned to that host.
- The repository contract no longer keeps a supported local Azure CLI bootstrap or recovery path.
- GitHub Environment owns the canonical app identity through `AZURE_APP_NAME`; the Container App target is always derived as `ca-${AZURE_APP_NAME}` across bootstrap, release, verification, and workflow-owned helper scripts.
- `Bootstrap Azure Recovery` owns resource-group creation and initial Azure SQL principal bootstrap through GitHub Actions OIDC.
- `Release Azure Delivery` owns routine infra convergence, runtime config sync, image rollout, and smoke testing through GitHub Actions OIDC.
- `Verify Production Runtime` owns the supported hosted contract verification path.
- If `sync_runtime_config` fails, treat missing resource-group scope `App Configuration Data Owner` or `Key Vault Secrets Officer` rights on the `production` OIDC identity as bootstrap drift first.
- If bootstrap infra convergence fails while `manageRuntimeRoleAssignments=true`, treat missing `Role Based Access Control Administrator` or `User Access Administrator` on the `production-bootstrap` OIDC identity as bootstrap drift.
- If the hosted rollout has not happened yet, treat any live public SQL dependency or direct Container App public-host dependency as configuration drift that still needs to be remediated through the GitHub workflow path.
