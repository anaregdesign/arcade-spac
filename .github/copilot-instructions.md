# Copilot Instructions

This repository vendors local skills under `.github/skills/`:

- `react-router-prisma-app-architecture`
- `azure-app-platform-delivery`
- `entra-user-auth-registration`
- `copilot-azure-cloud-access`
- `spec-driven-workflow`
- `learning-content-authoring`

Use them deliberately and combine them by concern.

## Skill Roles

- Treat `react-router-prisma-app-architecture` as the app-code architecture skill for React Router + Prisma application work.
- Treat `azure-app-platform-delivery` as the preferred Azure extension for Azure hosting, Azure SQL, secretless configuration via App Configuration and Key Vault, IaC, and GitHub release delivery; install it after `react-router-prisma-app-architecture`.
- Treat `entra-user-auth-registration` as the auth-specific extension for end-user Microsoft Entra ID auth contract design, redirect URIs, callback paths, and app-registration changes; add it only when the task changes end-user auth contract or app registration.
- Treat `copilot-azure-cloud-access` as the Copilot cloud-access extension for GitHub Copilot coding agent Azure access, Copilot Environment setup, Azure MCP wiring, and Copilot OIDC access; add it only when the task changes the Copilot Environment, Azure MCP, or Copilot OIDC access.
- Treat `spec-driven-workflow` as an independent spec and planning skill.
- Treat `learning-content-authoring` as the preferred content-authoring skill for source-backed study material, quiz generation, answerability review, ambiguity reduction, and paired study and quiz section design.

## Default Invocation Order

- For non-trivial application-development work, call `spec-driven-workflow` first even when the user asks directly for implementation.
- After `spec-driven-workflow`, add `react-router-prisma-app-architecture` when the task changes React Router + Prisma app-code architecture, route/module placement, UI boundaries, client/server/domain boundaries, or verification.
- Add `azure-app-platform-delivery` only when the task also changes Azure hosting, Azure SQL, secretless config, infrastructure as code, deployment topology, or release automation; always install it after `react-router-prisma-app-architecture`.
- Add `entra-user-auth-registration` only when the task changes end-user auth contract or app registration.
- Add `copilot-azure-cloud-access` only when the task changes the Copilot Environment, Azure MCP, or Copilot OIDC access.
- When more than one skill is needed, combine them in this order by default: `spec-driven-workflow`, `react-router-prisma-app-architecture`, `azure-app-platform-delivery`, `entra-user-auth-registration`, then `copilot-azure-cloud-access` for the matching deltas only.

## Spec Workflow Expectations

- Use `spec-driven-workflow` to create or update durable user-facing requirements under `/docs/spec/`.
- Use `spec-driven-workflow` to maintain the temporary execution plan at `/docs/plans/plan.md` while work is active.
- Use `spec-driven-workflow` to archive a completed plan as `/docs/plans/plan.YYYYMMDD-HHMMSS.md` when the tracked work is finished.
- Drive the implementation sequence from the workflow defined by `spec-driven-workflow` rather than skipping directly to code changes.

## Local Skill Layout

- App-code architecture skill: `.github/skills/react-router-prisma-app-architecture/`
- Preferred Azure extension skill: `.github/skills/azure-app-platform-delivery/`
- Entra auth extension skill: `.github/skills/entra-user-auth-registration/`
- Copilot cloud-access extension skill: `.github/skills/copilot-azure-cloud-access/`
- Independent spec and planning skill: `.github/skills/spec-driven-workflow/`
- Learning content authoring skill: `.github/skills/learning-content-authoring/`

Keep sibling skill directories stable so relative links (e.g. `../react-router-prisma-app-architecture/`) remain valid.

## Deployment Policy

- Treat GitHub Workflow based release automation as the only approved CD path for production and shared Azure environments in this repository.
- Do not run direct local-environment production deploy commands such as `azd deploy`, `azd up`, `az containerapp update`, or similar Azure CLI/CD commands when the goal is to release to a shared or production environment.
- If a user asks to deploy, validate readiness locally when useful, but route the actual CD step through the repository's GitHub Workflow.
