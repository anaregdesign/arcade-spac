# Azure Deployment Prerequisites

This checklist captures what is already scaffolded in the repository and what still must be provided before the Arcade app can be deployed as a real Azure-hosted application.

## Already Scaffolded In Repo

- `azure.yaml` targets Azure Container Apps.
- `infra/main.bicep` provisions a VNet-integrated Container Apps environment, a delegated Container Apps subnet, a private-endpoint subnet, Azure SQL, App Configuration, Key Vault, Application Insights, and Log Analytics.
- `infra/main.bicep` also provisions private DNS zones and `Private Endpoint` resources for Azure SQL, App Configuration, and Key Vault when those paths are enabled.
- `.github/workflows/release-container-image.yml` publishes immutable release images to GHCR and updates the Azure Container App through GitHub Actions OIDC.
- `scripts/azure/postprovision.sh` can attach a private container registry to the provisioned Container App.
- `scripts/azure/sync-runtime-config.sh` can populate the expected App Configuration keys and Key Vault secrets for the runtime bootstrap.
- `scripts/azure/smoke-test.sh` verifies the deployed `health` and `login` routes.
- `scripts/azure/verify-production-runtime.sh` verifies the private-network runtime contract for Azure SQL, App Configuration, Key Vault, and Container Apps.
- `app/routes/health.ts` is available for smoke tests and health probes.

## Azure Subscription And Tenant Requirements

- A target Azure subscription with permission to create:
  - Virtual network and subnets
  - Private DNS zones and virtual network links
  - Private Endpoints
  - Azure Container Apps Managed Environment
  - Azure Container App
  - Azure SQL logical server and serverless database
  - User-assigned managed identity for schema migrations
  - Azure App Configuration
  - Azure Key Vault
  - Application Insights
  - Log Analytics Workspace
- A Microsoft Entra ID tenant for the production `web` app registration
- A Microsoft Entra ID user, group, or application that can be set as the Azure SQL Entra administrator
- Permission to create workload identity federation between GitHub Actions and Azure
- Network ownership or approval for:
  - the delegated Container Apps infrastructure subnet
  - the private-endpoint subnet
  - `privatelink.database.windows.net`
  - `privatelink.azconfig.io`
  - `privatelink.vaultcore.azure.net`

## GitHub Repository Configuration

Set the following GitHub Environment variables for the `production` environment:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_RESOURCE_GROUP`
- `AZURE_CONTAINER_APP_NAME`
- `GHCR_PULL_USERNAME`

Set the following GitHub Environment secrets:

- `GHCR_PULL_TOKEN`

## Runtime Configuration Requirements

These values are needed before the app can boot correctly in Azure:

Hosted bootstrap environment values:

- `AZURE_APPCONFIG_ENDPOINT`
- `AZURE_APPCONFIG_LABEL` when labeled App Configuration values are used
- `AZURE_KEY_VAULT_URI`

App Configuration values:

- `ARCADE_AUTH_MODE`
- `PUBLIC_APP_URL`
- `ENTRA_TENANT_ID`
- `ENTRA_AUTHORITY_TENANT`
- `ENTRA_CLIENT_ID`

Key Vault secrets:

- `ARCADE_SESSION_SECRET`
- `ENTRA_CLIENT_SECRET`
- `DATABASE_URL` only when `deploySql=false` and the app is targeting an externally managed relational database path

Recommended placement:

- App Configuration keys under the `Arcade:` prefix
- Key Vault secrets named `arcade-session-secret`, `entra-client-secret`, and `database-url`
- App Configuration Key Vault references for `Arcade:ARCADE_SESSION_SECRET`, `Arcade:ENTRA_CLIENT_SECRET`, and `Arcade:DATABASE_URL`
- Container App managed identity with App Configuration Data Reader and Key Vault Secrets User access

Current repository note:

- The server runtime now loads the `Arcade:` App Configuration keys through `@azure/app-configuration-provider`.
- `npm run azure:sync:runtime-config` is the repository-supported sync path for App Configuration and Key Vault.
- Run that sync only from a host that can reach the private App Configuration and Key Vault data plane.
- The GitHub release workflow updates the image and verifies runtime state, but it does not populate the private App Configuration or Key Vault data plane.
- When `deploySql=true`, the sync script can derive a managed-identity `DATABASE_URL` from Azure SQL metadata when explicit `DATABASE_URL` is not provided.

## Azure SQL Provisioning Inputs

When enabling the production relational resource path in `infra/main.bicep`, provide all of the following:

- `deploySql=true`
- `sqlDatabaseName`
- `sqlAdministratorLogin`
- `sqlAdministratorPassword`
- `sqlEntraAdminLogin`
- `sqlEntraAdminObjectId`
- `sqlEntraAdminPrincipalType` when the Entra admin is not a group
- `sqlEntraAdminTenantId` when the Entra admin lives outside the deployment tenant default

The SQL administrator login and password are bootstrap-only or break-glass inputs for Azure SQL creation. They must not be reused by the app runtime.

The template now defines two distinct identities for the database path:

- Container App system-assigned managed identity for runtime database access after database roles are granted
- User-assigned managed identity for migration execution and elevated schema-change operations

The repository target contract for the production data path is:

- Azure SQL `publicNetworkAccess=Disabled`
- No `AllowAzureServices` firewall dependency
- Azure SQL `Private Endpoint` plus `privatelink.database.windows.net`
- Hosted App Configuration and Key Vault behind private endpoints
- `Microsoft Entra ID` web sign-in with explicit tenant audience and confidential client secret stored outside repo files
- Runtime and migration database permissions separated

## Repository Rename Note

- The canonical GitHub repository slug is `anaregdesign/arcade-spec`.
- Release workflows publish GHCR images under `ghcr.io/anaregdesign/arcade-spec` because the workflow derives the image name from `${{ github.repository }}`.
- Keep the release metadata in `docs/production-operations.md` aligned with the live production release after each deployment.

## Ongoing Operational Concerns

These are no longer bootstrap blockers, but they still need active operational discipline:

1. Keep runtime database access least-privilege and separate from elevated migration access.
2. Keep the current rollback target, private endpoint inventory, and smoke procedure updated after every release.
3. Verify the hosted DNS path resolves the Azure SQL, App Configuration, and Key Vault FQDNs through private DNS after rollout.
4. Keep Application Insights and Log Analytics access available to the release operator for first-line troubleshooting.

## Suggested Verification Sequence

1. Confirm `npm run typecheck` and `npm run build` pass locally.
2. Run `npm run azure:check:production-data` against the intended hosted settings.
3. Run `az bicep build --file infra/main.bicep`.
4. Run `azd provision --preview` and review the generated plan, especially the VNet, private-endpoint, private DNS, and optional Azure SQL resources.
5. Provision Azure resources.
6. Confirm the Azure SQL Entra administrator, `Entra-only` auth, and database role split between the runtime and migration identities.
7. Run `npm run azure:sync:runtime-config` from a host that can reach the private App Configuration and Key Vault data plane.
8. Publish a release so the GitHub workflow pushes an immutable image.
9. Verify `https://<container-app-fqdn>/health`.
10. Run `scripts/azure/verify-production-runtime.sh`.
11. Smoke-test login, gameplay, result, rankings, and profile flows in the hosted environment.

For the latest verified production values and rollback notes, see `docs/production-operations.md`.
