# GitHub Release Delivery

Use this reference when the app needs GitHub-based CI/CD, GitHub Actions OIDC, container publishing, or release-driven deployment to Azure.

## Default GitHub Delivery Model

- Run quality gates on push and pull request.
- Build and publish the production container image on `release.published`.
- Use one release workflow that sequences `publish`, `plan_infra`, `deploy_infra`, `deploy_app`, and `smoke_test`.
- Deploy only after image publish and infra convergence succeed.
- Promote immutable release-tag images such as `v1.2.3`, not mutable tags such as `latest`.
- Do not assume a registry push alone rolls out a new Azure Container Apps revision. Keep an explicit app deployment step that updates the Container App image.

## OIDC Baseline

- Prefer GitHub Actions OIDC over Azure client secrets.
- Use a dedicated `Microsoft Entra ID` application and Service Principal for GitHub deployment. Keep it separate from runtime Managed Identity and from migration or admin identities.
- Create one federated credential per GitHub Environment when environments have different blast radius, approval rules, or Azure scopes.
- Keep the default GitHub Environment subject format unless the organization deliberately standardizes a custom `sub` template.
- The common production subject is `repo:<owner>/<repo>:environment:production`.
- Use issuer `https://token.actions.githubusercontent.com` and audience `api://AzureADTokenExchange`.
- If the organization requires reusable workflows or custom OIDC claims such as `job_workflow_ref`, configure the GitHub-side subject customization first and then create the matching federated credential in Microsoft Entra.
- Use GitHub Environment protection rules when Environment-scoped subjects are used.

## Azure RBAC for the Deploy Identity

- Scope the deploy identity to the narrowest Azure scope that can own the deployment, usually the target resource group.
- Grant a resource-management role such as `Contributor` only where the workflow actually deploys.
- If the IaC template creates or deletes Azure role assignments, also grant `Microsoft.Authorization/roleAssignments/write` and delete through `Role Based Access Control Administrator` or `User Access Administrator` at the same scope.
- Do not default to `Owner` when narrower roles are sufficient.
- Keep runtime role assignments out of the GitHub deploy identity unless the workflow is explicitly responsible for provisioning them.

## Prefer This Workflow Shape

- `publish`: check out, build, and push the immutable image.
- `plan_infra`: run `what-if` after `publish` and compare against the currently deployed image so app-only releases do not force infra churn.
- `deploy_infra`: validate and deploy Bicep or Terraform only when `plan_infra` reports real infra changes.
- `deploy_app`: update the app runtime to the immutable image after `deploy_infra`, or immediately after `plan_infra` when infra is unchanged.
- `smoke_test`: hit `/health` or another cheap HTTP endpoint after `deploy_app`.
- Run `azure/login` in every job that calls Azure. Do not assume Azure sessions or short-lived tokens survive across jobs.
- Keep infra convergence and app rollout as separate jobs even when the same workflow orchestrates both.
- When infra definitions still require an image parameter, feed `plan_infra` and `deploy_infra` the currently deployed image so the release image alone does not create false-positive infra drift.
- Treat the Container App resource shape as infrastructure, but treat revision rollout as application deployment.
- Skip production deploys for prereleases unless the repository has an explicit prerelease Environment.

## Prefer These GitHub Environment Variables

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_RESOURCE_GROUP`
- `AZURE_APP_NAME`

## Optional Registry Variables and Secrets

- `CONTAINER_REGISTRY_SERVER`
- `CONTAINER_REGISTRY_IDENTITY`
- `CONTAINER_REGISTRY_USERNAME`
- `CONTAINER_REGISTRY_PASSWORD` as an Environment secret only when Managed Identity cannot be used
- If the GHCR package is public, do not add unnecessary pull credentials.
- If the package is private, prefer a deliberate registry-auth path and document why the image cannot stay public.
- Prefer `CONTAINER_REGISTRY_IDENTITY` for ACR. Use username/password only when the platform cannot avoid it.

## Keep Release Metadata Clean

- Update README, screenshots, and configuration contract docs before the release when those artifacts changed.
- Use generated release notes as a baseline, then correct them when deploy behavior or operational caveats matter.
- Avoid mutating old releases to cover broken workflow definitions. Publish a new patch release instead.

## Validate the Workflow and OIDC Contract

- Run YAML validation locally.
- Run `actionlint` before pushing workflow edits.
- Validate the Bicep or Terraform entrypoint before release.
- Validate the `what-if` plan path before first production use.
- Confirm the GitHub job has `permissions.id-token: write` anywhere OIDC login is required.
- Confirm the GitHub Environment name in the workflow matches the federated credential subject exactly.
- If the organization customized the GitHub OIDC `sub` claim, verify the current token claims with `github/actions-oidc-debugger` before cutting the release.

## Verify the Deployment

- Confirm the publish job pushed the expected immutable tag.
- Confirm `plan_infra` reported `no changes` when the release is app-only.
- Confirm the infra deploy job updated the intended Azure scope only when `plan_infra` found real changes.
- Confirm the app deploy job rolled the intended image revision.
- Confirm the smoke test passed.
- Capture the release URL, workflow run URL, deployed app URL, and any remaining manual follow-up in the handoff.
