# Template Assets

Use this reference when copying files from `assets/templates/` into a target repository.

## Goals

- Start from working generic files instead of rewriting common Azure and GitHub scaffolding.
- Keep the shared templates free of app-specific vocabulary.
- Apply naming and environment-specific values only in the destination repository.
- Avoid `.env`-driven bootstrap for Azure-hosted apps.

## Placeholder Rules

- Use uppercase placeholder tokens wrapped in double underscores.
- Prefer infrastructure-neutral names such as `__APP_NAME__`, `__SERVICE_NAME__`, `__PUBLIC_APP_URL__`, `__AZURE_APPCONFIG_ENDPOINT__`, and `__KEY_VAULT_URI__`.
- Do not hardcode project names, domain nouns, resource-group names, or callback URLs into the shared templates.
- Keep GitHub variable names generic and reusable across repositories.

## Template Inventory

- `assets/templates/azure.yaml`
- `assets/templates/Dockerfile`
- `assets/templates/app/routes/health.ts`
- `assets/templates/.github/workflows/release-container-image.yml`
- `assets/templates/scripts/azure/postprovision.sh`
- `assets/templates/infra/main.bicep`

`assets/templates/infra/main.bicep` is the shared web-runtime baseline template. Extend it with Azure SQL resources only when the target app actually needs relational persistence.
It keeps the Container App ingress public by default and includes Container Apps VNet integration so the hosted runtime can still reach private endpoints. Extend it with Azure SQL server, database, `Microsoft Entra ID` admin setup, and `Private Endpoint` resources when the target app needs relational persistence. Use App Configuration and Key Vault private endpoints for hosted environments, and add a Container Apps managed environment `Private Endpoint` only when the app ingress must also be private-only.

## Adoption Flow

1. Copy only the files needed for the target repository.
2. Replace placeholder tokens in the copied files, not in the shared asset files.
3. Extend the copied files with Azure App Configuration and Key Vault bootstrap when the target repo follows the secretless config path.
4. Prefer managed identity wiring for ACR pulls if the copied repo uses ACR.
5. Align the copied files with the target repo naming, package manager, and deploy topology.
6. Validate each copied file in the target repo before pushing.

## Validation Expectations

- Validate YAML files with a YAML parser.
- Validate GitHub workflow files with `actionlint`.
- Validate Bicep files with `az bicep build`.
- Validate private DNS, VNet link, and `Private Endpoint` resources when relational persistence is enabled.
- Validate the copied container image build locally or in CI.
