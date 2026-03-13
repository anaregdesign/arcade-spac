# Copilot Instructions

This repository vendors three local skills under `.github/skills/`:

- `enforce-react-spa-architecture`
- `azure-spa-clean-architecture-bootstrap`
- `spec-driven-workflow`

Use them deliberately and combine them by concern.

## Skill Roles

- Treat `enforce-react-spa-architecture` as the base app-code architecture skill for React Router + Prisma application work.
- Treat `azure-spa-clean-architecture-bootstrap` as the Azure extension that depends on `enforce-react-spa-architecture` for Azure hosting, identity, secretless configuration, IaC, and release automation guidance.
- Treat `spec-driven-workflow` as an independent spec and planning skill.

## Default Invocation Order

- For non-trivial application-development work, call `spec-driven-workflow` first even when the user asks directly for implementation.
- After `spec-driven-workflow`, add `enforce-react-spa-architecture` when the task changes React Router + Prisma app-code architecture, route/module placement, UI boundaries, client/server/domain boundaries, or verification.
- Add `azure-spa-clean-architecture-bootstrap` only when the task also changes Azure hosting, identity, secretless config, infrastructure as code, deployment topology, or release automation.
- When more than one skill is needed, combine them in this order by default: `spec-driven-workflow`, `enforce-react-spa-architecture`, then `azure-spa-clean-architecture-bootstrap` for Azure-specific deltas only.

## Spec Workflow Expectations

- Use `spec-driven-workflow` to create or update durable user-facing requirements under `/docs/spec/`.
- Use `spec-driven-workflow` to maintain the temporary execution plan at `/docs/plans/plan.md` while work is active.
- Use `spec-driven-workflow` to archive a completed plan as `/docs/plans/plan.YYYYMMDD-HHMMSS.md` when the tracked work is finished.
- Drive the implementation sequence from the workflow defined by `spec-driven-workflow` rather than skipping directly to code changes.

## Local Skill Layout

- Base app-code architecture skill: `.github/skills/enforce-react-spa-architecture/`
- Azure extension skill: `.github/skills/azure-spa-clean-architecture-bootstrap/`
- Independent spec and planning skill: `.github/skills/spec-driven-workflow/`

Keep the two SPA skills as sibling directories so the Azure skill's relative links into `../enforce-react-spa-architecture/` remain valid.

## Deployment Policy

- Treat GitHub Workflow based release automation as the only approved CD path for production and shared Azure environments in this repository.
- Do not run direct local-environment production deploy commands such as `azd deploy`, `azd up`, `az containerapp update`, or similar Azure CLI/CD commands when the goal is to release to a shared or production environment.
- If a user asks to deploy, validate readiness locally when useful, but route the actual CD step through the repository's GitHub Workflow.
