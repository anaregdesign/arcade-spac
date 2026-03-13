# Project Instructions

## Mandatory Skill Order

- For this repository, always consult `spec-driven-workflow` first before starting any non-trivial product, UI, route, API, workflow, or behavior change.
- Treat direct implementation requests as subject to the same rule. Review the skill before substantial work even when the user does not explicitly mention spec or plan artifacts.
- After `spec-driven-workflow`, add the implementation skill that matches the change:
  - `enforce-react-spa-architecture` for app-code and UI work
  - `azure-spa-clean-architecture-bootstrap` for Azure platform and deployment work

## Spec Workflow

- Keep durable user-facing requirements under `/docs/spec/`.
- Use `/docs/plan.md` as a temporary execution tracker while work is active.
- Delete `/docs/plan.md` after all tracked work is complete.

## Documentation Consistency

- Follow `/docs/` paths, not legacy `/doc/` paths, when applying `spec-driven-workflow` in this repository.
