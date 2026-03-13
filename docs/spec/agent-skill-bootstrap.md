# Agent Skill Bootstrap

## Summary

Repository-scoped Copilot agent skills are bootstrapped under `.github/skills/` so the workspace carries its own React SPA architecture guidance, Azure extension guidance, and spec-first planning guidance without depending on an external checkout.

## User Problem

- The repository needs local copies of the required Copilot skills so instructions resolve inside the workspace.
- Skill directories must stay in a specific layout because the Azure SPA skill depends on relative links into the base SPA architecture skill.
- The repository-level Copilot instructions need to describe when each skill is used and in what order.

## Users and Scenarios

- A maintainer wants this repository to vendor the three required skills directly under `.github/skills/` so future Copilot sessions can use them locally.
- A contributor wants `.github/copilot-instructions.md` to clearly route non-trivial work through the spec-first workflow before architecture and Azure-specific guidance are added.

## Scope

- Sync the complete upstream contents of `enforce-react-spa-architecture`, `azure-spa-clean-architecture-bootstrap`, and `spec-driven-workflow` into `.github/skills/`.
- Preserve the directory relationship between the two SPA skills so existing relative links remain valid.
- Create or update `.github/copilot-instructions.md` to describe skill roles, invocation order, and spec workflow expectations for this repository.

## Non-Goals

- Changing application runtime behavior.
- Editing the skill contents beyond what is required to mirror the upstream source directories.
- Introducing new repository workflows outside the requested skill bootstrap and Copilot instruction updates.

## User-Visible Behavior

- The repository contains `.github/skills/enforce-react-spa-architecture/`, `.github/skills/azure-spa-clean-architecture-bootstrap/`, and `.github/skills/spec-driven-workflow/` with the complete upstream contents copied locally.
- Relative references between the two SPA skills continue to resolve after the sync.
- `.github/copilot-instructions.md` tells Copilot to start non-trivial application-development work with `spec-driven-workflow`, then add `enforce-react-spa-architecture` for app-code architecture guidance, and only add `azure-spa-clean-architecture-bootstrap` for Azure-specific extensions.

## Acceptance Criteria

- The three requested skill directories exist under `.github/skills/` after the sync.
- Each skill directory matches the complete contents of the requested upstream source directory, including optional `agents/`, `references/`, `assets/`, and `scripts/` content when present.
- `.github/copilot-instructions.md` reflects the required role descriptions and default invocation order.
- The final work summary can list the installed files under `.github/skills/` and provide the final `.github/copilot-instructions.md` content.

## Edge Cases

- If destination skill directories already exist, they are replaced or synchronized to the upstream repository version instead of merged manually.
- If one source skill contains directories not present in another, the sync preserves only what exists in the corresponding upstream source directory.

## Constraints and Dependencies

- Install order must be `enforce-react-spa-architecture`, then `azure-spa-clean-architecture-bootstrap`, then `spec-driven-workflow`.
- The work is tracked in `/docs/plans/plan.md` during implementation and archived when complete.
- The source of truth for the vendored skills is the requested `anaregdesign/hiroki` repository paths.

## Links

- Plan Archive: [plan.20260313-220356.md](../plans/plan.20260313-220356.md)
