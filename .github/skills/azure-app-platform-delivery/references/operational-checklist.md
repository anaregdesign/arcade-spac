# Operational Checklist

Use this reference before release, after deployment, or when handing work back to the user.

## At Project Start

- Confirm which Azure tenant, subscription, and resource scopes are definitely required.
- Confirm which RBAC assignments are definitely required for developers, runtime identities, migration identities, and deploy identities.
- Confirm whether bootstrap permissions and day-to-day release permissions can be split so the release operator does not keep standing Azure or Microsoft Entra admin rights.
- Confirm whether Azure SQL Microsoft Entra admin setup is required.
- Confirm the VNet, delegated subnet, private-endpoint subnet, private DNS ownership, and `Private Endpoint` approval model for Container Apps to Azure SQL traffic.
- Confirm whether hosted App Configuration and Key Vault should also be private-only, and how local development will reach them.
- Confirm whether a GitHub Actions OIDC-backed deploy identity is enough or whether another Service Principal is still required for migration or external automation.
- Confirm whether the infra deploy will create Azure role assignments and therefore needs `Role Based Access Control Administrator` or `User Access Administrator` at the deployment scope.
- Ask for those prerequisites early so they do not block implementation or release work later.

## User Tasks That GitHub Does Not Replace

- Create the target Azure Resource Group before the first release deployment.
- Create the GitHub `production` Environment.
- Populate the required GitHub Environment variables and any optional registry secrets.
- Create the Microsoft Entra application, Service Principal, and federated credential used by GitHub OIDC.
- Grant the deploy identity the required Azure RBAC, including role-assignment permission when the IaC manages role assignments.
- Populate app-specific App Configuration keys, Key Vault secrets, callback URLs, and auth registration details.
- Publish the GitHub Release that triggers the workflow, unless a separate automation layer creates releases automatically.
- Use the minimum human-permission split in `references/github-repository-operations.md` so bootstrap operators and day-to-day releasers do not inherit the same standing access by default.

## Minimum Human Permission Review

- Confirm who only needs day-to-day release rights and who actually needs bootstrap rights in GitHub, Microsoft Entra ID, and Azure.
- Aim for GitHub `push` access only for the routine release operator after bootstrap is complete.
- Use GitHub `admin`, Microsoft Entra ID app-registration rights, and Azure RBAC-assignment rights only for the bootstrap operator, and prefer time-bound elevation where available.
- Keep the human operator permissions distinct from the GitHub Actions OIDC deploy identity and the runtime Managed Identity.

## Before Push

- Run targeted tests for touched features.
- Run typecheck, lint, and production build.
- Review architecture boundaries and forbidden imports.
- Validate workflow syntax and infrastructure files.
- Confirm the app no longer depends on `.env` or `.env.example` for Azure runtime behavior.
- If local development uses SQLite, confirm no Azure-hosted config, scripts, or docs still point at SQLite.

## Before Release

- Confirm README matches the current architecture and deployment model.
- Confirm screenshots and callback URLs are current.
- Confirm GitHub Environment variables and Azure-side identities exist.
- Confirm the GitHub Environment name matches the federated credential subject exactly.
- Confirm App Configuration keys and Key Vault secrets match the runtime config contract.
- Confirm the `what-if` plan can distinguish app-only releases from real infra changes.
- When the app requires user authentication, confirm the documented local sign-in path still works with the intended dev or test identities.
- Confirm the hosted environment uses Azure SQL Database rather than SQLite.
- Confirm the hosted Azure SQL server is set to the intended `Microsoft Entra ID` admin and `Entra-only` authentication mode.
- Confirm Azure SQL public network access is disabled when the hosted runtime is supposed to use the private path.
- Confirm the Azure SQL server FQDN resolves to the private endpoint IP from the hosted network path.
- Confirm hosted App Configuration and Key Vault use the intended private endpoint route when that hardening is enabled.
- Confirm Container Apps probes are configured and passing against the intended HTTP endpoint.
- Confirm migrations and critical persistence flows were validated against Azure SQL Database, not only against local SQLite.
- Confirm the release workflow runs `plan_infra` before `deploy_infra` and skips infra rollout when the plan reports no real infra changes.
- Confirm the release workflow deploys the immutable release tag, not `latest`.

## After Release

- Check the GitHub Release URL.
- Check the Actions run URL.
- Check the deployed app URL and the `/health` endpoint.
- Confirm the intended Azure revision became healthy.

## After Infrastructure Changes

- Note any partial or failed resources that still need cleanup.
- Note any manual Azure portal or app-registration changes that the user must complete.
- Note any RBAC assignments that were added and their scope.
- Note any private DNS zones, VNet links, or `Private Endpoint` approvals that were added.
- Note any `Microsoft Entra ID` admin changes, `Entra-only` SQL settings, or registry identity assignments that were added.
- Note any App Configuration keys, Key Vault secrets, or callback URLs that still need to be set by the user.

## Handoff

- Report what was changed.
- Report what was verified.
- Report what remains blocked or unverified.
- Report the exact file paths or workflow names that matter for future maintenance.
