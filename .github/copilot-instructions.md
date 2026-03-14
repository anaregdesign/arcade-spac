# Copilot Instructions

This repository vendors local skills under `.github/skills/`:

- `enforce-react-spa-architecture`
- `react-router-prisma-app-architecture`
- `azure-spa-clean-architecture-bootstrap`
- `azure-app-platform-delivery`
- `spec-driven-workflow`

Use them deliberately and combine them by concern.

## Skill Roles

- Treat `enforce-react-spa-architecture` as the base app-code architecture skill for React Router + Prisma application work.
- Treat `react-router-prisma-app-architecture` as the preferred app-code architecture skill for React Router + Prisma application work; it supersedes `enforce-react-spa-architecture` for new work.
- Treat `azure-spa-clean-architecture-bootstrap` as the Azure extension that depends on `enforce-react-spa-architecture` for Azure hosting, identity, secretless configuration, IaC, and release automation guidance.
- Treat `azure-app-platform-delivery` as the preferred Azure extension for Azure hosting, Azure SQL, secretless configuration via App Configuration and Key Vault, IaC, and GitHub release delivery; install it after `react-router-prisma-app-architecture`.
- Treat `spec-driven-workflow` as an independent spec and planning skill.

## Default Invocation Order

- For non-trivial application-development work, call `spec-driven-workflow` first even when the user asks directly for implementation.
- After `spec-driven-workflow`, add `react-router-prisma-app-architecture` when the task changes React Router + Prisma app-code architecture, route/module placement, UI boundaries, client/server/domain boundaries, or verification.
- Add `azure-app-platform-delivery` only when the task also changes Azure hosting, Azure SQL, secretless config, infrastructure as code, deployment topology, or release automation; always install it after `react-router-prisma-app-architecture`.
- When more than one skill is needed, combine them in this order by default: `spec-driven-workflow`, `react-router-prisma-app-architecture`, then `azure-app-platform-delivery` for Azure-specific deltas only.

## Spec Workflow Expectations

- Use `spec-driven-workflow` to create or update durable user-facing requirements under `/docs/spec/`.
- Use `spec-driven-workflow` to maintain the temporary execution plan at `/docs/plans/plan.md` while work is active.
- Use `spec-driven-workflow` to archive a completed plan as `/docs/plans/plan.YYYYMMDD-HHMMSS.md` when the tracked work is finished.
- Drive the implementation sequence from the workflow defined by `spec-driven-workflow` rather than skipping directly to code changes.

## Local Skill Layout

- Base app-code architecture skill: `.github/skills/enforce-react-spa-architecture/`
- Preferred app-code architecture skill: `.github/skills/react-router-prisma-app-architecture/`
- Legacy Azure extension skill: `.github/skills/azure-spa-clean-architecture-bootstrap/`
- Preferred Azure extension skill: `.github/skills/azure-app-platform-delivery/`
- Independent spec and planning skill: `.github/skills/spec-driven-workflow/`

Keep sibling skill directories stable so relative links (e.g. `../react-router-prisma-app-architecture/`) remain valid.

## Deployment Policy

- Treat GitHub Workflow based release automation as the only approved CD path for production and shared Azure environments in this repository.
- Do not run direct local-environment production deploy commands such as `azd deploy`, `azd up`, `az containerapp update`, or similar Azure CLI/CD commands when the goal is to release to a shared or production environment.
- If a user asks to deploy, validate readiness locally when useful, but route the actual CD step through the repository's GitHub Workflow.
