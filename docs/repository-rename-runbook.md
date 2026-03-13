# Repository Rename Runbook

This runbook captures the ordered steps and external follow-up needed to standardize the repository identity on `anaregdesign/arcade-spec`.

## Canonical Repository Identity

- GitHub repository slug: `anaregdesign/arcade-spec`
- SSH remote URL: `git@github.com:anaregdesign/arcade-spec.git`
- GHCR image namespace after the rename cutover: `ghcr.io/anaregdesign/arcade-spec`

## What Is Already Safe In Repo

- `.github/workflows/release-container-image.yml` derives `IMAGE_NAME` and deploy `IMAGE_REF` from `${{ github.repository }}`.
- Once GitHub reports the repository as `anaregdesign/arcade-spec`, future release builds will automatically push `ghcr.io/anaregdesign/arcade-spec:<tag>`.
- `azure.yaml` does not embed the repository slug directly.

## Workspace Changes Applied

- The local repository spec and execution plan now use `anaregdesign/arcade-spec` as the canonical target name.
- The local `origin` remote should point to `git@github.com:anaregdesign/arcade-spec.git`.
- Repository rename follow-up is documented here so GitHub-side and Azure-side steps are not lost.

## GitHub Follow-Up

1. Rename the GitHub repository to `arcade-spec` if it is still published as `arcade-spac`.
2. Confirm the default branch, branch protections, required checks, and GitHub Environment configuration stayed attached to the renamed repository.
3. Confirm the `production` Environment still exposes the expected Variables and Secrets:
   - `AZURE_CLIENT_ID`
   - `AZURE_TENANT_ID`
   - `AZURE_SUBSCRIPTION_ID`
   - `AZURE_RESOURCE_GROUP`
   - `AZURE_CONTAINER_APP_NAME`
   - `GHCR_PULL_USERNAME`
   - `GHCR_PULL_TOKEN`
4. Confirm the release workflow still has package write permission after the rename.
5. Decide whether the old GHCR package namespace `ghcr.io/anaregdesign/arcade-spac` should remain available for rollback history or be retired after the first successful post-rename release.

## Azure Follow-Up

1. Update any Microsoft Entra workload identity federated credential subjects that include the old repository slug.
2. Verify the GitHub Actions deploy identity still matches the exact repository and `production` Environment subject after the rename.
3. After the first post-rename release, verify that Azure Container Apps can pull the new GHCR image path `ghcr.io/anaregdesign/arcade-spec:<tag>`.
4. Update operational docs that track the current live image only after a release built from the renamed repository is actually deployed.

## Ordered Verification After Rename

1. Run `git remote -v` locally and confirm `origin` uses `git@github.com:anaregdesign/arcade-spec.git`.
2. Publish a release and confirm the workflow pushes a package under `ghcr.io/anaregdesign/arcade-spec`.
3. Confirm the deploy job updates Azure Container Apps successfully.
4. Run the hosted smoke checks from `docs/production-operations.md`.
5. Update the production baseline image references in the operational docs if the deployed image namespace has changed.

## Notes On Historical Values

- Existing production baseline entries that mention `ghcr.io/anaregdesign/arcade-spac` describe historical releases and should only be rewritten when a new release from `anaregdesign/arcade-spec` becomes the live baseline.