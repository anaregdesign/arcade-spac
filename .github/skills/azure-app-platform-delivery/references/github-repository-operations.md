# GitHub Repository Operations

Use this reference when creating or hardening the target GitHub repository for Azure delivery.

## Repository Bootstrap

- Create the repository before wiring release automation.
- Prefer an organization-owned repository for production workloads.
- Keep the default branch name explicit and consistent across workflow docs.
- Add a short repository description that matches the deployed system, not just the framework stack.

## Minimum Repository Structure

- `README.md`
- `.gitignore`
- `.github/workflows/`
- `azure.yaml`
- `infra/`
- `scripts/azure/`

## Default Branch Governance

- Protect the default branch.
- Require pull requests unless the team intentionally works trunk-only.
- Require status checks for test, typecheck, build, and any deploy-gating workflow.
- Restrict force pushes and branch deletion on the default branch.
- Prefer linear history or squash merge consistently; do not mix merge policies without a reason.

## GitHub Environments

- Create a `production` Environment for release deploys.
- Store deployment IDs and non-secret config as Environment variables, not as repo-wide secrets.
- Store only actual secrets as Environment secrets.
- Prefer Azure App Configuration and Key Vault as the runtime config stores rather than expanding GitHub-hosted variables into an `.env`-style runtime source of truth.
- Add protection rules when production deploys should require approval.
- Keep the OIDC federated credential subject aligned with the repository and Environment name.
- Keep release workflow names and Environment names stable once the OIDC subject is issued, or rotate the federated credential deliberately.

## Recommended Environment Variables

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_RESOURCE_GROUP`
- `AZURE_APP_NAME`

## Optional Environment Secrets

- `CONTAINER_REGISTRY_PASSWORD` only if the registry cannot use Managed Identity
- Provider secrets that cannot be replaced by platform identity

## Optional Environment Variables

- `CONTAINER_REGISTRY_SERVER`
- `CONTAINER_REGISTRY_IDENTITY`
- `CONTAINER_REGISTRY_USERNAME`

## GHCR Package Policy

- Prefer public GHCR packages for public apps when there is no security or licensing reason to hide the image.
- If the image must be private, document why and add the minimum registry pull credentials needed by the runtime platform.
- Keep package naming aligned with `ghcr.io/<owner>/<repo>` unless there is a deliberate multi-image strategy.

## Release Policy

- Trigger production image publish from `release.published`.
- Use one release workflow that can run `publish`, `plan_infra`, `deploy_infra`, `deploy_app`, and `smoke_test`.
- Deploy only from immutable release tags.
- Use a new patch release to fix a broken workflow definition instead of mutating an older release.
- Keep prerelease handling explicit. Either skip production deploys for prereleases or send them to a separate Environment.

## OIDC and Azure Access

- Prefer GitHub Actions OIDC over Azure client secrets.
- Scope the federated credential subject to the exact repository and Environment.
- Give the deploy identity only the Azure role scope it needs.
- Keep runtime Managed Identity separate from the deploy identity.
- If the repository will definitely deploy to Azure, request the OIDC-backed Azure application, Service Principal, federated credential, and scoped RBAC assignment early in the project instead of waiting until release cutover.
- If the infra template manages role assignments, request `Role Based Access Control Administrator` or `User Access Administrator` at the deployment scope in addition to the resource-management role.
- Do not default to `Owner` when the narrower role set is enough.

## User-Owned Bootstrap Work

- Create the target Azure Resource Group before the release workflow attempts `az deployment group create`.
- Create the GitHub `production` Environment and populate the required Environment variables.
- Create any optional registry variables or secrets only when the runtime cannot avoid them.
- Create the Microsoft Entra application, Service Principal, and federated credential for GitHub OIDC.
- Grant the deploy identity the required Azure RBAC at the intended scope.
- Populate app-specific Azure App Configuration keys, Key Vault secrets, callback URLs, and any authentication registration values that cannot be derived generically.
- Publish the GitHub Release that triggers the workflow, unless another automation layer creates releases on the user's behalf.

## Minimum Human Permissions

Use this section for human operators. Do not confuse these permissions with the GitHub Actions OIDC deploy identity or the runtime Managed Identity.

### Day-To-Day Release Operator

- GitHub: `push` access is enough to create or edit a GitHub Release.
- GitHub: if the repository uses required reviewers on the `production` Environment, a separate reviewer still needs approval rights for that Environment.
- Azure: none, if bootstrap is already complete and the workflow deploys through its own OIDC identity.
- Microsoft Entra ID: none, if bootstrap is already complete.

### Bootstrap Operator

- GitHub: `admin` access is the practical minimum when the repository uses GitHub Environments, because repository admins configure Environments and organization-repository Environment secrets or variables require `admin` access. For a personal-account repository, the repository owner is the equivalent minimum.
- GitHub: if repository-level or Environment-level Actions settings are overridden by organization policy, involve the organization admin instead of widening repository permissions ad hoc.
- Microsoft Entra ID: if the tenant still allows member users to register applications, a normal member user may be enough to create a new app registration they own.
- Microsoft Entra ID: if `Users can register applications` is disabled, `Application Developer` is the least built-in role that restores app-registration creation without using a broader app-admin role.
- Microsoft Entra ID: if the OIDC application already exists, `Application Owner` on that application is enough to manage that application's federated credentials.
- Microsoft Entra ID: if the same person must assign Microsoft Entra roles to other users, `Privileged Role Administrator` is required.
- Azure: `Contributor` at subscription scope is the practical minimum when the same person must create the target Resource Group, because resource-group creation requires `Microsoft.Resources/subscriptions/resourceGroups/write`.
- Azure: `Role Based Access Control Administrator` at the deployment scope is the least built-in role for granting Azure RBAC to the deploy identity. `User Access Administrator` also works, but this skill prefers `Role Based Access Control Administrator` where possible.
- Azure: this template creates Azure RBAC assignments in `infra/main.bicep`, so `Contributor` alone is not enough for full bootstrap.
- Azure: if the same person must populate runtime config, add only the data-plane roles actually needed, such as `App Configuration Data Owner` and `Key Vault Secrets Officer`.

### Practical Minimum For This Skill

- One bootstrap operator: GitHub `admin`, Microsoft Entra ID `Application Developer` or existing-app `Application Owner`, Azure `Contributor` plus `Role Based Access Control Administrator`.
- One day-to-day releaser: GitHub `push` access only, unless Environment approval rules add a separate reviewer step.
- If the bootstrap operator also seeds App Configuration or Key Vault, add only the minimum data-plane role for that store instead of broad subscription access.

### Least-Privilege Notes

- Prefer separating bootstrap work from day-to-day release work instead of giving one human standing access to everything.
- Prefer time-bound elevation or PIM for privileged Microsoft Entra ID and Azure roles.
- Keep the human bootstrap operator, the GitHub Actions OIDC deploy identity, the runtime Managed Identity, and any migration or admin identity separate.

### Official Sources

- GitHub Environments: [Managing environments for deployment](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)
- GitHub secrets and variables: [Using secrets in GitHub Actions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)
- GitHub Releases permissions: [REST API endpoints for releases](https://docs.github.com/en/rest/releases/releases)
- Microsoft Entra app-registration delegation: [Delegate application management administrator permissions](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/delegate-app-roles)
- Microsoft Entra app-registration quickstart: [How to register an app in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)
- Microsoft Entra role reference: [Microsoft Entra built-in roles](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference)
- Microsoft Entra federated credentials: [Configure an application to trust a managed identity](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-config-app-trust-managed-identity)
- Azure RBAC built-in roles: [Azure built-in roles](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles)
- Azure permission reference: [Azure permissions for Management and governance](https://learn.microsoft.com/en-us/azure/role-based-access-control/permissions/management-and-governance)
- Azure App Configuration access: [Azure App Configuration roles and permissions](https://learn.microsoft.com/en-us/azure/azure-app-configuration/concept-enable-rbac)
- Azure Key Vault roles: [Azure built-in roles for Security](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/security)

## Repository Hygiene

- Keep README deployment instructions current.
- Keep screenshots and public URLs current when user-facing behavior changed.
- Keep configuration contract docs synchronized with App Configuration keys, Key Vault secret names, and runtime config parsing.
- Keep workflow files validated with `actionlint`.

## Optional Governance Files

- Add `CODEOWNERS` when review ownership matters.
- Add issue and pull request templates when the team needs consistent change intake.
- Add Dependabot or Renovate only when the team will actually triage update noise.
- Add a security policy if the repository is public and externally consumed.

## Handoff Checklist

- Report the repository URL.
- Report the default branch.
- Report which GitHub Environments were created.
- Report which Variables and Secrets were populated.
- Report which required checks or branch protections still need manual setup.
