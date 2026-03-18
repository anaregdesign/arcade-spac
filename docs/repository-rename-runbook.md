# Repository Rename Runbook

This runbook captures the remaining GitHub-side and Azure-side follow-up after standardizing the repository identity on `anaregdesign/arcade-spec`.

## Canonical Repository Identity

- GitHub repository slug: `anaregdesign/arcade-spec`
- SSH remote URL: `git@github.com:anaregdesign/arcade-spec.git`
- GHCR image namespace: `ghcr.io/anaregdesign/arcade-spec`

## What Is Already Safe In Repo

- `.github/workflows/release-container-image.yml` derives `IMAGE_NAME` and deploy `IMAGE_REF` from `${{ github.repository }}`.
- `.github/workflows/bootstrap-azure-recovery.yml` and `.github/workflows/release-container-image.yml` both assume the canonical GHCR namespace above.
- `azure.yaml` does not embed the repository slug directly.

## GitHub Follow-Up

1. Keep `main` branch protection and required checks as an explicit follow-up. The repository currently has no branch protection on `main`.
2. Keep the `production` Environment attached to the renamed repository with these required variables:
   - `AZURE_CLIENT_ID`
   - `AZURE_TENANT_ID`
   - `AZURE_SUBSCRIPTION_ID`
   - `AZURE_RESOURCE_GROUP`
   - `AZURE_APP_NAME`
   - `ENTRA_CLIENT_ID`
   - `SQL_ADMINISTRATOR_LOGIN`
3. Keep the `production` Environment aligned with these required secrets:
   - `ARCADE_SESSION_SECRET`
   - `ENTRA_CLIENT_SECRET`
   - `SQL_ADMINISTRATOR_PASSWORD`
4. Keep the `production-bootstrap` Environment attached to the renamed repository with these required variables:
   - `AZURE_CLIENT_ID`
   - `AZURE_TENANT_ID`
   - `AZURE_SUBSCRIPTION_ID`
   - `AZURE_LOCATION`
   - `AZURE_RESOURCE_GROUP`
   - `AZURE_APP_NAME`
   - `SQL_ADMINISTRATOR_LOGIN`
5. Keep the `production-bootstrap` Environment aligned with the required `SQL_ADMINISTRATOR_PASSWORD` secret.
6. Add optional `CONTAINER_REGISTRY_*` values only when the runtime cannot use public GHCR or a managed-identity registry path.

## Azure Follow-Up

1. Keep the routine release federated credential subject aligned to `repo:anaregdesign/arcade-spec:environment:production`.
2. Keep the bootstrap federated credential subject aligned to `repo:anaregdesign/arcade-spec:environment:production-bootstrap`.
3. Keep verifying that both GitHub Actions identities match the exact repository slug after future identity changes.
4. Keep `docs/production-operations.md` aligned with the current live image after each successful deploy or recovery workflow run.

## Verified Audit Findings

- Repository metadata resolves as `anaregdesign/arcade-spec` with default branch `main`.
- The routine release OIDC subject is `repo:anaregdesign/arcade-spec:environment:production`.
- GHCR images publish under `ghcr.io/anaregdesign/arcade-spec`.
- The `production` Environment still exists after the rename.
- The `main` branch is currently unprotected.

## Ordered Verification After Rename

1. Confirm the routine release federated credential subject is `repo:anaregdesign/arcade-spec:environment:production`.
2. Confirm the bootstrap federated credential subject is `repo:anaregdesign/arcade-spec:environment:production-bootstrap`.
3. Publish a release and confirm the workflow pushes a package under `ghcr.io/anaregdesign/arcade-spec`.
4. Trigger `Bootstrap Azure Recovery` and confirm the workflow accepts an immutable image reference under the same GHCR namespace.
5. Update the operational docs if the deployed image namespace has changed.
