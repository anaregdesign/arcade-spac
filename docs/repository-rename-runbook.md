# Repository Rename Runbook

This runbook captures the remaining external follow-up needed after standardizing the repository identity on `anaregdesign/arcade-spec`.

## Canonical Repository Identity

- GitHub repository slug: `anaregdesign/arcade-spec`
- SSH remote URL: `git@github.com:anaregdesign/arcade-spec.git`
- GHCR image namespace after the rename cutover: `ghcr.io/anaregdesign/arcade-spec`

## Rename Status

- The GitHub repository now resolves as `anaregdesign/arcade-spec`.
- The local `origin` remote now points to `git@github.com:anaregdesign/arcade-spec.git`.

## What Is Already Safe In Repo

- `.github/workflows/release-container-image.yml` derives `IMAGE_NAME` and deploy `IMAGE_REF` from `${{ github.repository }}`.
- Future release builds will automatically push `ghcr.io/anaregdesign/arcade-spec:<tag>` because GitHub now reports the repository as `anaregdesign/arcade-spec`.
- `azure.yaml` does not embed the repository slug directly.

## Workspace Changes Applied

- The local repository spec and execution plan now use `anaregdesign/arcade-spec` as the canonical target name.
- The local `origin` remote points to `git@github.com:anaregdesign/arcade-spec.git`.
- Repository rename follow-up is documented here so GitHub-side and Azure-side steps are not lost.

## GitHub Follow-Up

1. Keep `main` branch protection and required checks as an explicit follow-up. The repository currently has no branch protection on `main`.
2. Keep the `production` Environment attached to the renamed repository. It currently exposes these Variables:
   - `AZURE_CLIENT_ID`
   - `AZURE_TENANT_ID`
   - `AZURE_SUBSCRIPTION_ID`
   - `AZURE_RESOURCE_GROUP`
   - `AZURE_CONTAINER_APP_NAME`
3. Do not assume GHCR pull credentials exist. The current `production` Environment has no visible Actions secrets, and the optional `Configure GHCR auth for private packages` step is therefore skipped.
4. Keep the release workflow package write permission as-is. The latest inspected release run still published to GHCR successfully after the repository rename.
5. Decide whether the old GHCR package namespace `ghcr.io/anaregdesign/arcade-spac` should remain available for rollback history or be retired now that the first successful post-rename release has completed.

## Azure Follow-Up

1. The deploy app registration federated credential subject has been corrected to `repo:anaregdesign/arcade-spec:environment:production`.
2. Keep verifying that the GitHub Actions deploy identity matches the exact repository and `production` Environment subject after future identity changes.
3. Azure Container Apps has now pulled and started the new GHCR image path `ghcr.io/anaregdesign/arcade-spec:v2026.03.13.9` successfully.
4. Keep `docs/production-operations.md` aligned with the current live image after each future release.

## Verified Audit Findings

- Repository metadata now resolves as `anaregdesign/arcade-spec` with default branch `main`.
- The Azure deploy federated credential now reports `repo:anaregdesign/arcade-spec:environment:production`.
- The release workflow for `v2026.03.13.9` completed successfully, including publish, Azure deploy, and smoke test.
- The live Container App now points to `ghcr.io/anaregdesign/arcade-spec:v2026.03.13.9` on revision `ca-arcade--0000020`.
- The `production` Environment still exists after the rename.
- The `main` branch is currently unprotected.

## Ordered Verification After Rename

1. Run `git remote -v` locally and confirm `origin` uses `git@github.com:anaregdesign/arcade-spec.git`.
2. Confirm the deploy app registration federated credential subject is `repo:anaregdesign/arcade-spec:environment:production`.
3. Publish a release and confirm the workflow pushes a package under `ghcr.io/anaregdesign/arcade-spec`.
4. Confirm the deploy job updates Azure Container Apps successfully.
5. Run the hosted smoke checks from `docs/production-operations.md`.
6. Update the production baseline image references in the operational docs if the deployed image namespace has changed.

## Notes On Historical Values

- Remaining references to `ghcr.io/anaregdesign/arcade-spac` now exist only to preserve rollback history for pre-cutover releases.