# Azure SQL Identity And Permissions

Use this reference when the app needs Azure SQL Database, `Managed Identity` access, or distinct runtime and migration permissions.

## Prefer This Azure SQL Pattern

- Use SQLite only for local development. Use Azure SQL Database for any Azure-hosted environment that persists relational data.
- Set a Microsoft Entra admin on the Azure SQL logical server.
- Prefer `Microsoft Entra ID` only authentication for hosted environments. Treat any SQL login/password path as bootstrap-only or break-glass.
- Create database users from external provider identities.
- Grant runtime identities only the least privilege they need.
- Reserve elevated roles for migration or break-glass identities.

## Private Connectivity Is Part Of The Contract

- Put Azure SQL behind a `Private Endpoint` in a dedicated subnet.
- Link `privatelink.database.windows.net` to the VNet used by the Container Apps environment so the runtime keeps using `<server>.database.windows.net` while DNS resolves to the private IP.
- Keep Azure SQL public network access disabled.
- Do not use "Allow Azure services and resources to access this server" as the normal runtime connectivity model.
- Keep the app ingress decision separate from database connectivity. A web app can stay publicly reachable while still reaching Azure SQL privately through VNet-integrated Container Apps.

## Keep Runtime and Migration Permissions Separate

- Runtime app Managed Identity: prefer `db_datareader` and `db_datawriter`
- Migration identity: add only the elevated roles needed for controlled schema change workflows
- Avoid giving the web runtime identity ownership-style or DDL-heavy privileges

## Keep SQL Server and Prisma Boundaries Honest

- Keep Prisma imports inside server infrastructure.
- Keep repository interfaces in `domain`.
- Keep transport DTOs and session shapes outside `domain`.
- Treat SQLite-to-Azure-SQL provider changes, native-type tuning, and migration regeneration as real migration work, not as a trivial config flip.

## Verification

- Verify no Azure-hosted environment still points at SQLite.
- Verify the deployed runtime Managed Identity can reach Azure SQL and only the intended database roles are granted.
- Verify the hosted Azure SQL server has the intended `Microsoft Entra ID` admin and `Entra-only` authentication setting.
- Verify the Azure SQL server FQDN resolves to the private endpoint IP from the hosted network path.
- Verify Azure SQL public network access is disabled and the private DNS zone is linked to the intended VNet.
- Verify migrations and critical query paths against Azure SQL Database, not only against local SQLite.
- Verify runtime and migration identities stay separate in docs, IaC, and operational runbooks.
