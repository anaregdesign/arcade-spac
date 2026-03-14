# Agent Skill Bootstrap

## Summary

Repository-scoped Copilot agent skills are vendored under `.github/skills/` so the workspace carries its own planning, application architecture, Azure delivery, auth, and Copilot cloud-access guidance without depending on an external checkout. The repository inventory and instructions describe only the currently supported local skills.

## User Problem

- The repository needs local copies of the current Copilot skill set so instructions resolve inside the workspace.
- The skill directories must stay in a specific layout because sibling skills may use relative links to shared references.
- The repository-level Copilot instructions and specs need to describe only the supported local skill inventory.
- Contributors need one current description of which skills are available and how they are combined by concern.

## Users and Scenarios

- A maintainer wants this repository to vendor the current five local skills directly under `.github/skills/` so future Copilot sessions can use them locally.
- A contributor wants `.github/copilot-instructions.md` and `AGENTS.md` to clearly route non-trivial work through the spec-first workflow before architecture, Azure delivery, auth, or Copilot cloud-access guidance are added.
- A contributor working on Azure delivery wants to know that `azure-app-platform-delivery` is the repository's default Azure extension for this repository.

## Scope

- Keep the current local skill inventory synchronized under `.github/skills/`: `react-router-prisma-app-architecture`, `azure-app-platform-delivery`, `entra-user-auth-registration`, `copilot-azure-cloud-access`, and `spec-driven-workflow`.
- Preserve sibling relative references between skill directories after generation or synchronization.
- Keep `.github/copilot-instructions.md`, `AGENTS.md`, and this spec aligned on skill roles, preferred invocation order, and spec workflow expectations for this repository.
- Remove stale references to retired local skills from repository docs.

## Non-Goals

- Changing application runtime behavior.
- Choosing between overlapping Azure skills dynamically beyond documenting the repository default.
- Introducing new repository workflows outside the supported skill inventory and instruction alignment updates.

## User-Visible Behavior

- The repository contains `.github/skills/react-router-prisma-app-architecture/`, `.github/skills/azure-app-platform-delivery/`, `.github/skills/entra-user-auth-registration/`, `.github/skills/copilot-azure-cloud-access/`, and `.github/skills/spec-driven-workflow/` with the expected local contents available in-workspace.
- Relative references between sibling skills continue to resolve after the sync.
- `.github/copilot-instructions.md` and `AGENTS.md` tell Copilot to start non-trivial application-development work with `spec-driven-workflow`, then add `react-router-prisma-app-architecture` for app-code architecture guidance, and then add the Azure, Entra, and Copilot cloud-access skills only for the task categories that require them.
- The repository instructions treat `azure-app-platform-delivery` as the Azure extension for default task routing in this repository.
- Repository docs describe only the supported local skill inventory.

## Acceptance Criteria

- The five current skill directories exist under `.github/skills/`.
- The vendored skill directories preserve any required sibling-relative references.
- `.github/copilot-instructions.md`, `AGENTS.md`, and this spec agree on `spec-driven-workflow` first for non-trivial work and on the default companion-skill order that follows it.
- Repository docs and specs do not describe or list retired local skills.
- Repository instructions and specs consistently describe the default routing expectations captured in this document.

## Edge Cases

- If destination skill directories already exist, they are replaced or synchronized to the upstream repository version instead of merged manually.
- If one source skill contains directories not present in another, the sync preserves only what exists in the corresponding upstream source directory.
- If any repository doc still reflects an older inventory, it is rewritten to the currently supported set.

## Constraints and Dependencies

- The default invocation order for non-trivial repository work starts with `spec-driven-workflow`, then adds `react-router-prisma-app-architecture`, then `azure-app-platform-delivery` when Azure delivery work applies, then `entra-user-auth-registration`, then `copilot-azure-cloud-access` for the matching deltas.
- Repository instructions and specs must stay aligned on supported skill inventory and invocation order.
- The vendored skill directories under `.github/skills/` must remain stable enough that sibling relative links continue to resolve.

## Links

- Related: [../../.github/copilot-instructions.md](../../.github/copilot-instructions.md)
- Related: [../../AGENTS.md](../../AGENTS.md)
