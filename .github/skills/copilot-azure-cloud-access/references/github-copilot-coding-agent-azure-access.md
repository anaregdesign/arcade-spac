# GitHub Copilot Coding Agent Azure Access

Use this reference when the repository should let GitHub Copilot coding agent inspect Azure resources from the cloud.

## Default Model

- Use a dedicated GitHub `copilot` Environment. Do not reuse the `production` Environment for Copilot coding agent.
- Use a dedicated Azure identity for Copilot coding agent. Do not reuse the production deploy identity, runtime Managed Identity, or migration identity.
- Prefer a User Assigned Managed Identity with a federated credential for Copilot coding agent Azure access. This follows the `azd coding-agent config` baseline from Microsoft Learn.
- Prefer `azd coding-agent config` when the repository wants the standard bootstrap path for Azure MCP Server and GitHub Copilot coding agent.
- Keep Copilot coding agent Azure access read-mostly by default. Widen permissions only when the repository explicitly wants the agent to make Azure changes autonomously.

## Why `copilot` Must Stay Separate

- The `copilot` Environment is for ephemeral cloud-side development work, not release promotion.
- The `production` Environment usually has a broader blast radius, stricter approval rules, and a deploy identity that can mutate resources.
- GitHub Docs for Copilot coding agent use a dedicated `copilot` Environment and environment-scoped variables or secrets.
- Inference from GitHub and Microsoft guidance: a separate `copilot` Environment makes least-privilege review and OIDC subject management easier because its federated credential can stay read-scoped.

## Preferred Identity Shape

- Preferred: User Assigned Managed Identity plus federated credential trusted by GitHub OIDC.
- Alternative: Microsoft Entra application plus Service Principal only when the organization cannot use the managed-identity path.
- Keep one federated credential per GitHub Environment.
- The common `copilot` OIDC subject is `repo:<owner>/<repo>:environment:copilot`.
- If the organization customizes the GitHub OIDC `sub` claim, make the federated credential match the customized claim before rollout.
- Keep the Copilot identity at the narrowest Azure scope that still lets the agent inspect the intended environment, usually the target resource group.

## Minimum Azure Permissions For `az` Read Access

- For Azure Resource Manager metadata reads through `az`, start with `Reader` at the target resource-group scope.
- `Reader` is the Microsoft Learn default used by the `azd` Copilot coding-agent extension.
- `Reader` is enough for resource discovery tasks such as `az group show`, `az resource list`, `az containerapp show`, and inspection of deployment topology.
- Do not give `Contributor` or broader write roles unless the repository explicitly wants Copilot coding agent to mutate Azure resources directly.
- If the agent must inspect observability data, add only the narrower read role that matches that surface, such as `Monitoring Reader`, instead of widening to a general write role.

## Data-Plane Guardrails

- Do not grant production Key Vault secret-read access to Copilot coding agent by default.
- Do not grant App Configuration data-plane access to production stores by default.
- If the agent truly needs config or secret inspection, prefer dedicated development or staging stores with scrubbed data.
- If data-plane reads are still required, add only the specific read role for that store, such as `App Configuration Data Reader`, and document the blast radius explicitly.

## Minimum Human Permissions

- Day-to-day Copilot task delegator: GitHub `write` permission is enough after a repository administrator has finished the `copilot` Environment and MCP setup.
- Bootstrap operator: repository `admin` is required to configure the `copilot` Environment and repository-level Copilot coding-agent MCP settings.
- Azure and Microsoft Entra ID human permissions are only needed during bootstrap. After bootstrap, Copilot coding agent should use its own OIDC-backed identity.

## GitHub `copilot` Environment Values

- Required for Azure OIDC login:
  - `AZURE_CLIENT_ID`
  - `AZURE_TENANT_ID`
  - `AZURE_SUBSCRIPTION_ID`
- Optional but usually useful:
  - `AZURE_RESOURCE_GROUP`
- Use GitHub Environment variables for non-secret identifiers.
- Use GitHub Environment secrets only for actual secrets.
- For MCP server configuration values that must be available through Copilot's MCP configuration, use `COPILOT_MCP_`-prefixed variables or secrets as documented by GitHub.

## Workflow Shape

- Add `.github/workflows/copilot-setup-steps.yml`.
- Keep exactly one job named `copilot-setup-steps`.
- Keep job permissions narrow: usually `contents: read` and `id-token: write`.
- Add an `azure/login@v2` step that uses the `copilot` Environment-scoped `AZURE_*` values.
- Add one cheap Azure verification step, such as `az account show` plus `az group show` when `AZURE_RESOURCE_GROUP` is set.
- Install only the toolchain that the coding agent actually needs. Do not mirror the full production release workflow.

## Recommended Bootstrap Flow

1. Create the GitHub `copilot` Environment.
2. Add the `AZURE_*` values to the `copilot` Environment.
3. Bootstrap Azure access with `azd coding-agent config`, or manually create the managed identity, federated credential, role assignment, and workflow file in the same shape.
4. Merge the generated or copied `copilot-setup-steps.yml` into the default branch.
5. If the repository uses Azure MCP Server, add the MCP configuration under GitHub `Settings` -> `Copilot` -> `Coding agent`.
6. Test the setup with a read-only prompt such as listing resource groups or showing the target resource group.

## Validation

- Manually run `copilot-setup-steps.yml` from the Actions tab after merging it to the default branch.
- Confirm OIDC login succeeds without any Azure client secret.
- Confirm the Azure identity is separate from `production` deploy identity and runtime Managed Identity.
- Confirm the Azure role assignment for Copilot coding agent is `Reader` at resource-group scope unless a narrower or wider scope was deliberately chosen.
- Confirm Copilot coding agent can inspect the intended environment with `az` or Azure MCP tools but cannot mutate resources unless that was explicitly intended.
- Confirm no production Key Vault or App Configuration data-plane read was granted by default.

## Official Sources

- GitHub Copilot setup workflow and `copilot` Environment variables: [Customizing the development environment for GitHub Copilot coding agent](https://docs.github.com/en/copilot/how-tos/agents/copilot-coding-agent/customizing-the-development-environment-for-copilot-coding-agent)
- GitHub MCP and Copilot environment administration: [Extending GitHub Copilot coding agent with the Model Context Protocol (MCP)](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp)
- Azure MCP Server with Copilot coding agent: [Connect GitHub Copilot coding agent to the Azure MCP Server](https://learn.microsoft.com/en-us/azure/developer/azure-mcp-server/how-to/github-copilot-coding-agent)
- `azd` bootstrap path and default `Reader` role: [Quickstart - Enable Copilot Coding Agent Azure access with the azd extension](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/extensions/copilot-coding-agent-extension)
- Azure RBAC built-in roles: [Azure built-in roles](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles)
