# Copilot Instructions

This repository vendors three local skills under `.github/skills/`:

- `spec-driven-workflow`
- `enforce-react-spa-architecture`
- `azure-spa-clean-architecture-bootstrap`

Use them deliberately and by concern.

## Skill Selection

- Call `spec-driven-workflow` when the task needs `/doc/spec/`, `/doc/plan.md`, ordered `Section`/`Subsection` planning, or deliberate commit-unit planning.
- Call `enforce-react-spa-architecture` when the task changes React Router + Prisma app-code architecture, route/module placement, UI boundaries, client/server/domain boundaries, or verification expectations for the app itself.
- Call `azure-spa-clean-architecture-bootstrap` when the task changes Azure hosting, Microsoft Entra ID or other identity wiring, secretless configuration, Azure infrastructure as code, deployment topology, or release automation.

## Combining Skills

- When a task spans planning plus implementation, use `spec-driven-workflow` for the spec and temporary plan artifacts, then use the relevant implementation skill for the code or platform work.
- When a task spans React SPA architecture and Azure concerns, use `enforce-react-spa-architecture` as the base skill and add `azure-spa-clean-architecture-bootstrap` only for Azure-specific deltas.
- Do not use `azure-spa-clean-architecture-bootstrap` as a replacement for `enforce-react-spa-architecture`; the Azure skill extends the base app-code architecture skill.
- When a task spans all three concerns, combine them in this order: `spec-driven-workflow`, `enforce-react-spa-architecture`, then `azure-spa-clean-architecture-bootstrap` for the Azure-only portions.

## Local Skill Layout

- Base app-code architecture skill: `.github/skills/enforce-react-spa-architecture/`
- Azure extension skill: `.github/skills/azure-spa-clean-architecture-bootstrap/`
- Independent spec and planning skill: `.github/skills/spec-driven-workflow/`

Keep the two SPA skills as sibling directories so the Azure skill's relative links into `../enforce-react-spa-architecture/` remain valid.