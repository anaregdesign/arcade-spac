# Agent Skill Bootstrap

## Summary

Repository-scoped Copilot agent skills are bootstrapped under `.github/skills/` so the workspace carries its own application architecture guidance, Azure delivery guidance, auth guidance, Copilot cloud-access guidance, and spec-first planning guidance without depending on an external checkout.

## User Problem

- The repository needs local copies of the required Copilot skills so instructions resolve inside the workspace.
- The skill directories must stay in a specific layout because sibling skills may use relative links to shared references.
- The repository-level Copilot instructions need to describe when each skill is used and in what order.
- The repository wants the skills created through GitHub Copilot's official `/create-skill` workflow instead of hand-authored local recreations.

## Users and Scenarios

- A maintainer wants this repository to vendor five required skills directly under `.github/skills/` so future Copilot sessions can use them locally.
- A contributor wants `.github/copilot-instructions.md` to clearly route non-trivial work through the spec-first workflow before architecture, Azure delivery, auth, or Copilot cloud-access guidance are added.

## Scope

- Create or synchronize the complete upstream contents of `react-router-prisma-app-architecture`, `azure-app-platform-delivery`, `entra-user-auth-registration`, `copilot-azure-cloud-access`, and `spec-driven-workflow` into `.github/skills/`.
- Use GitHub Copilot's official `/create-skill` command for each generated skill rather than manually recreating the skill files from scratch.
- Preserve sibling relative references between skill directories after generation or synchronization.
- Create or update `.github/copilot-instructions.md` to describe skill roles, invocation order, and spec workflow expectations for this repository.

## Non-Goals

- Changing application runtime behavior.
- Editing the skill contents beyond what is required to mirror the upstream source directories.
- Introducing new repository workflows outside the requested skill bootstrap and Copilot instruction updates.

## User-Visible Behavior

- The repository contains `.github/skills/react-router-prisma-app-architecture/`, `.github/skills/azure-app-platform-delivery/`, `.github/skills/entra-user-auth-registration/`, `.github/skills/copilot-azure-cloud-access/`, and `.github/skills/spec-driven-workflow/` with the complete upstream contents copied locally.
- Relative references between sibling skills continue to resolve after the sync.
- `.github/copilot-instructions.md` tells Copilot to start non-trivial application-development work with `spec-driven-workflow`, then add `react-router-prisma-app-architecture` for app-code architecture guidance, and add the Azure, Entra, and Copilot cloud-access skills only for the task categories that require them.

## Acceptance Criteria

- The five requested skill directories exist under `.github/skills/` after the sync.
- Each skill directory matches the complete contents of the requested upstream source directory, including optional `agents/`, `references/`, `assets/`, and `scripts/` content when present.
- Each skill is produced through the official `/create-skill` workflow, using the upstream repository directories as the canonical source material for the generated result.
- `.github/copilot-instructions.md` reflects the required role descriptions and default invocation order.
- The final work summary can list the installed files under `.github/skills/` and provide the final `.github/copilot-instructions.md` content.

## Edge Cases

- If destination skill directories already exist, they are replaced or synchronized to the upstream repository version instead of merged manually.
- If one source skill contains directories not present in another, the sync preserves only what exists in the corresponding upstream source directory.

## Constraints and Dependencies

- Install order must be `react-router-prisma-app-architecture`, then `azure-app-platform-delivery`, then `entra-user-auth-registration`, then `copilot-azure-cloud-access`, then `spec-driven-workflow`.
- The work is tracked in `/docs/plans/plan.md` during implementation and archived when complete.
- The source of truth for the vendored skills is the requested `anaregdesign/hiroki` repository paths.

## Links

- Plan Archive: [plan.20260313-220356.md](../plans/plan.20260313-220356.md)
