# Project Instructions

## Mandatory Skill Order

- For this repository, always consult `spec-driven-workflow` first before starting any non-trivial product, UI, route, API, workflow, or behavior change.
- Treat direct implementation requests as subject to the same rule. Review the skill before substantial work even when the user does not explicitly mention spec or plan artifacts.
- After `spec-driven-workflow`, add the implementation skill that matches the change:
  - `react-router-prisma-app-architecture` for app-code and UI work
  - `azure-app-platform-delivery` for Azure hosting, Azure SQL, secretless config, IaC, and GitHub release delivery — always install after `react-router-prisma-app-architecture`

## Spec Workflow

- Keep durable user-facing requirements under `/docs/spec/`.
- Use `/docs/plans/plan.md` as a temporary execution tracker while work is active.
- Archive completed execution plans as `/docs/plans/plan.YYYYMMDD-HHMMSS.md` when tracked work is finished.

## Documentation Consistency

- Follow `/docs/` paths, not legacy `/doc/` paths, when applying `spec-driven-workflow` in this repository.

## Deployment Policy

- For this repository, production and shared-environment CD must always run through the configured GitHub Workflow.
- Do not perform production or shared-environment deployments directly from a local agent session with `azd deploy`, `azd up`, `az containerapp update`, or equivalent Azure CLI commands unless the user explicitly asks to change this policy.
- When deployment is requested, prepare or validate the change locally as needed, then direct the release through the repository's GitHub Workflow path.
