---
name: azure-app-platform-delivery
description: "Own Azure app platform and production release delivery for React Router + Prisma web apps. Use when the request mentions Azure Container Apps, Azure SQL Database, App Configuration, Key Vault, Managed Identity, workload identity, DefaultAzureCredential, Dockerfile, azure.yaml, Bicep, GitHub Actions OIDC, GitHub `production` Environment, GHCR, deploy_infra, deploy_app, smoke tests, platform bootstrap, or deployment verification. Do not use this skill for end-user Microsoft Entra ID login contract design, app registration changes, or GitHub Copilot coding agent cloud access."
---

# Azure App Platform Delivery

## Overview

Use this skill as the Azure platform and delivery extension on top of `react-router-prisma-app-architecture`.
This skill owns:

- Azure Container Apps hosting and network topology
- Azure SQL connectivity and hosted persistence boundaries
- Azure App Configuration, Key Vault, `ManagedIdentityCredential`, and local `DefaultAzureCredential`
- IaC, `azure.yaml`, container packaging, and shared Azure runtime templates
- GitHub `production` Environment, GitHub Actions OIDC, release workflow design, and smoke-test verification

This skill does not own:

- end-user `Microsoft Entra ID` auth contract, redirect URI design, or app registration updates
- GitHub Copilot coding agent cloud-side Azure access through the `copilot` Environment
- spec or planning workflow
- base React Router + Prisma code architecture rules

When the task is primarily app authentication, load [`../entra-user-auth-registration/SKILL.md`](../entra-user-auth-registration/SKILL.md).
When the task is primarily GitHub Copilot coding agent Azure access, load [`../copilot-azure-cloud-access/SKILL.md`](../copilot-azure-cloud-access/SKILL.md).

## Companion Skill Requirement

- Install `react-router-prisma-app-architecture` together with this skill.
- Use this skill only after the companion skill has established code structure, UI guardrails, and verification boundaries.
- Keep Azure-specific concerns here and keep app-code architecture in the companion skill.

## Quick Start

1. Confirm the runtime boundary:
   - keep pure SPA mode only for truly static apps
   - switch to React Router framework runtime before adding secrets, Prisma, hosted SQL access, or protected server behavior
2. Front-load platform prerequisites:
   - Azure tenant, subscription, resource group, and required RBAC
   - VNet, delegated subnet, `Private Endpoint`, and private DNS requirements
   - Azure SQL admin and migration identity requirements
   - GitHub `production` Environment and OIDC deploy identity requirements
3. Read the platform references:
   - Azure hosting baseline: [`references/azure-platform-bootstrap.md`](references/azure-platform-bootstrap.md)
   - Azure identity and SQL overview: [`references/azure-identity-and-sql.md`](references/azure-identity-and-sql.md)
   - Azure SQL identity and permission guidance: [`references/azure-sql-identity-and-permissions.md`](references/azure-sql-identity-and-permissions.md)
   - workload identity and secretless config: [`references/azure-workload-identity-and-secretless-config.md`](references/azure-workload-identity-and-secretless-config.md)
4. Read the delivery references:
   - repository bootstrap and human permissions: [`references/github-repository-operations.md`](references/github-repository-operations.md)
   - GitHub release workflow design: [`references/github-release-delivery.md`](references/github-release-delivery.md)
   - release and handoff checks: [`references/operational-checklist.md`](references/operational-checklist.md)
   - shared template inventory: [`references/template-assets.md`](references/template-assets.md)
5. Start from the shared runtime and delivery assets:
   - `assets/templates/azure.yaml`
   - `assets/templates/Dockerfile`
   - `assets/templates/app/routes/health.ts`
   - `assets/templates/infra/main.bicep`
   - `assets/templates/scripts/azure/postprovision.sh`
   - `assets/templates/.github/workflows/release-azure-delivery.yml`

## Use This Skill For

- Azure Container Apps topology, ingress, probes, and `Private Endpoint` decisions
- Azure SQL Database hosting, connectivity, identity, and migration boundaries
- Azure App Configuration, Key Vault, and secretless runtime bootstrap
- `azure.yaml`, `Dockerfile`, `infra/main.bicep`, and shared runtime template adoption
- GitHub `production` Environment setup, OIDC deploy identity, GHCR release workflow design, and smoke tests
- human bootstrap responsibilities and least-privilege release permissions

## Use Sibling Skills Instead For

- end-user auth, redirect URIs, cookie or PKCE contract, and app registration updates:
  [`../entra-user-auth-registration/SKILL.md`](../entra-user-auth-registration/SKILL.md)
- GitHub Copilot coding agent `copilot` Environment, Azure MCP, and read-scoped cloud access:
  [`../copilot-azure-cloud-access/SKILL.md`](../copilot-azure-cloud-access/SKILL.md)
- spec-first planning:
   [`../spec-driven-workflow/SKILL.md`](../spec-driven-workflow/SKILL.md)

## Non-Negotiable Rules

- Treat SQLite as local-development-only storage.
- Use Azure SQL Database for every Azure-hosted relational environment.
- Prefer `ManagedIdentityCredential` in hosted runtime and `DefaultAzureCredential` locally after `az login` or `azd auth login`.
- Keep App Configuration and Key Vault as the runtime source of truth instead of `.env`.
- Use GitHub Actions OIDC to Azure. Do not store Azure client secrets in GitHub.
- Keep infra convergence and app rollout separate, even when one workflow orchestrates both.
- Prefer `what-if`-driven infra skip over file-path heuristics.
- Do not assume a container registry push alone updates Azure Container Apps.
- Keep human bootstrap permissions narrower than the standing permissions of day-to-day releasers.

## Implementation Workflow

### 1. Establish Azure runtime boundaries

- choose Container Apps topology, ingress, and backing-service connectivity
- document required Azure scopes, RBAC, and network ownership early
- separate runtime identity, migration identity, and deploy identity

### 2. Bootstrap secretless config and persistence

- use App Configuration for non-secret settings and Key Vault for secrets
- verify local `DefaultAzureCredential` and hosted `ManagedIdentityCredential` flows explicitly
- validate Azure SQL connectivity and provider differences before release

### 3. Adopt runtime assets deliberately

- copy and rename the shared templates into the target repository
- keep app-specific naming and callback values only in the destination repository
- keep `/health` stable and cheap for probes and smoke tests

### 4. Prepare release delivery

- use the shared `release-azure-delivery.yml` workflow shape
- keep `publish`, `plan_infra`, `deploy_infra`, `deploy_app`, and `smoke_test` distinct
- keep the GitHub `production` Environment and its OIDC subject stable

### 5. Verify and hand off

- validate workflow YAML and Bicep before release
- verify `what-if` can distinguish app-only releases from real infra changes
- capture the release URL, workflow URL, deployed app URL, and remaining manual follow-up

## Placement Guide

- Azure runtime and IaC: `infra/`, `azure.yaml`, `Dockerfile`
- runtime bootstrap config: `app/lib/server/infrastructure/config/`
- Azure SQL and SDK adapters: `app/lib/server/infrastructure/repositories/`, `app/lib/server/infrastructure/gateways/`
- deployment helpers: `scripts/azure/`
- release workflows: `.github/workflows/`
- health probes: `app/routes/health.ts`

## References

- base architecture skill: [`../react-router-prisma-app-architecture/SKILL.md`](../react-router-prisma-app-architecture/SKILL.md)
- Azure hosting baseline: [`references/azure-platform-bootstrap.md`](references/azure-platform-bootstrap.md)
- Azure identity and SQL overview: [`references/azure-identity-and-sql.md`](references/azure-identity-and-sql.md)
- Azure SQL identity and permissions: [`references/azure-sql-identity-and-permissions.md`](references/azure-sql-identity-and-permissions.md)
- workload identity and secretless config: [`references/azure-workload-identity-and-secretless-config.md`](references/azure-workload-identity-and-secretless-config.md)
- repository operations: [`references/github-repository-operations.md`](references/github-repository-operations.md)
- release delivery: [`references/github-release-delivery.md`](references/github-release-delivery.md)
- operational checklist: [`references/operational-checklist.md`](references/operational-checklist.md)
- template inventory: [`references/template-assets.md`](references/template-assets.md)
- auth sibling skill: [`../entra-user-auth-registration/SKILL.md`](../entra-user-auth-registration/SKILL.md)
- Copilot sibling skill: [`../copilot-azure-cloud-access/SKILL.md`](../copilot-azure-cloud-access/SKILL.md)
