# Azure Platform Bootstrap

Use this reference when the app needs Azure hosting, Azure-managed secrets, or production-grade deployment primitives.

## Default Platform Choices

- Use Azure Container Apps for React Router apps that need a server runtime.
- Keep the default Container Apps ingress public when the app is meant to be internet-facing.
- Use SQLite for local development when the app needs relational persistence.
- Use Azure SQL Database serverless for Azure-hosted relational persistence, unless workload characteristics force another SKU.
- Use a VNet-integrated Container Apps environment for outbound private connectivity when the workload must reach Azure resources through `Private Endpoint`, including Azure SQL Database.
- For Container Apps to Azure SQL traffic, use Azure SQL `Private Endpoint` with the `privatelink.database.windows.net` private DNS zone, and keep Azure SQL public network access disabled.
- Use a Container Apps managed environment `Private Endpoint` only when ingress itself must be private-only.
- When authentication is required, use `Microsoft Entra ID` for Microsoft authentication and keep app registration setup scriptable with `az` or `az rest`.
- Use Azure App Configuration for non-secret runtime settings.
- Use Key Vault for runtime secrets and secret rotation.
- Use Application Insights and Log Analytics for telemetry and diagnostics.
- Use Managed Identity for deployed app runtime access to Azure resources and Azure SQL.
- Use GitHub Actions OIDC for deployment access to Azure.

## Front-Load Prerequisites

- At project start, identify the Azure tenant, subscription, and resource scopes the work will definitely need.
- Request required RBAC assignments early for developers, runtime identities, migration identities, and deploy identities.
- Request Azure SQL Microsoft Entra admin setup early when hosted relational persistence is in scope.
- Request the VNet, delegated subnet, private-endpoint subnet, private DNS ownership, and any required private-endpoint approvals early when Azure SQL private connectivity is in scope.
- Request App Configuration and Key Vault access early when the app bootstrap depends on them.
- Prefer Managed Identity and GitHub Actions OIDC, but if an unavoidable Service Principal is required, request or provision it during bootstrap rather than near release.

## Treat "SPA" Correctly

- Keep a static-only SPA only when the app has no server-owned secrets, no OAuth callback handling, and no server-side persistence boundary.
- Switch to React Router framework runtime when social login, server sessions, Prisma, Azure SQL, or server-owned API calls appear.
- When authentication is required, align the `Microsoft Entra ID` app registration to the runtime contract: use `web` redirects for server callbacks and `spa` redirects only for true browser-only PKCE flows.
- Preserve SPA-style navigation and presentational component boundaries even when the deployment target is a containerized web app.

## Add the Expected Repository Files

- Add `Dockerfile` for the production image.
- Add `azure.yaml` for app and infra orchestration.
- Add `infra/` for Bicep or Terraform.
- Add `scripts/azure/` for idempotent provisioning or post-provision helpers.
- Add a checked-in server config bootstrap module under `app/lib/server/infrastructure/config/` or the narrowest equivalent.
- Add `app/routes/health.ts` for cheap health checks.
- Add README configuration notes instead of `.env` samples.

## Prefer This Azure Topology

- Virtual network
- Delegated infrastructure subnet for the Container Apps environment
- Separate subnet for `Private Endpoint` resources
- Container Apps environment
- Container App for the web runtime with public ingress by default
- Azure App Configuration store
- Azure SQL logical server plus serverless database when the app needs relational persistence
- Azure SQL `Private Endpoint` plus `privatelink.database.windows.net` private DNS link when the app needs relational persistence
- Key Vault
- Application Insights
- Log Analytics workspace
- Optional Container Apps managed environment `Private Endpoint` plus Private Link-capable edge when ingress must stay private-only
- Optional ACR only when GHCR is not acceptable or private-network requirements force Azure-native image storage

## Correct Common Mistakes

- Do not keep SQLite in an Azure-hosted environment. SQLite is local-development-only storage in this workflow.
- Do not assume SQLite behavior proves Azure SQL Database behavior. Validate migrations and critical queries against Azure SQL Database before release.
- Do not rely on Azure SQL firewall rules or "Allow Azure services and resources to access this server" as the normal app-to-database path. Use `Private Endpoint` plus private DNS.
- Do not inject Azure secrets directly into the repo or into long-lived GitHub secrets if OIDC or Managed Identity can replace them.
- Do not introduce `.env` or `.env.example` for Azure runtime configuration. Use Azure App Configuration plus Key Vault so local development and deployed runtime follow the same secretless model.
- Do not describe local development as "Managed Identity". Local development should use `DefaultAzureCredential`; deployed Azure runtime should use `ManagedIdentityCredential`.
- Do not hide migration execution inside container startup unless the blast radius is understood and rollback is trivial.
- Do not skip a health endpoint. Container Apps deploy and smoke-test flow should have a stable probe target.
- Do not leave callback URLs undocumented. Each environment needs explicit OAuth redirect values.
- Do not confuse private database connectivity with private web ingress. Public Container Apps ingress plus VNet-integrated outbound traffic to Azure SQL `Private Endpoint` is the default for internet-facing apps. Add a Container Apps managed environment `Private Endpoint` only when ingress must also stay private.
- When authentication is required, do not rely on portal-only `Microsoft Entra ID` changes. Keep the `az` or `az rest` command flow with the project notes or bootstrap scripts.

## Keep IaC and Runtime Boundaries Explicit

- Keep Azure resource definitions declarative in `infra/`.
- Keep runtime configuration parsing in server infrastructure code.
- Keep Azure App Configuration ownership explicit for non-secret settings and Key Vault ownership explicit for secrets.
- Keep the template `infra/main.bicep` honest about scope: it should cover the shared web-runtime platform baseline, and it should be extended with Azure SQL resources only when the app actually needs relational persistence.
- Keep provisioning scripts thin and repeatable.
- Keep one place for naming rules, region selection, and environment conventions.

## Minimum Verification

- Validate the infra plan before deploy.
- Build the container image locally or in CI.
- Verify local development can load Azure-backed config after `az login` or `azd auth login` without any `.env` file.
- Verify local development uses the intended SQLite path and that Azure-hosted configuration points to Azure SQL Database instead.
- Verify the Container Apps environment resolves the Azure SQL server FQDN through private DNS and reaches the private IP path when private connectivity is required.
- Verify Azure SQL public network access is disabled when the hosted runtime depends on the private path.
- Verify the health route responds after deploy.
- Verify the app registration audience and redirect URIs match local, staging, and production URLs.
- Verify the app can reach its backing services with production auth mode.
