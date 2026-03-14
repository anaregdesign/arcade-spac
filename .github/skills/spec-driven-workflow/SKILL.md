---
name: spec-driven-workflow
description: "Own the spec-first planning workflow for application and feature development. Use this skill by default for non-trivial application-development requests, even when `/docs/spec` or `/docs/plans/plan.md` has not been mentioned yet, including building, changing, refactoring, or extending an app, feature, route, UI, API, workflow, or service. Capture user-visible requirements under `/docs/spec`, track execution in a temporary `/docs/plans/plan.md` with ordered `Section`, `Subsection`, and optional `Sub-subsection` headings, keep checkboxes current during implementation, and archive the completed plan as `/docs/plans/plan.YYYYMMDD-HHMMSS.md` once tracked work is done. Do not use this skill to decide app-code architecture or cloud platform topology."
---

# Spec Driven Workflow

## Overview

Use this skill to turn a development request into a spec-first, plan-driven workflow. For nearly any non-trivial application-development request, use this skill first by default, even when the user asks directly for implementation and does not mention `/docs/spec` or `/docs/plans/plan.md`.
Capture the user-visible requirement in `/docs/spec/` first, then create a temporary execution tracker in `/docs/plans/plan.md` and keep the spec and plan synchronized until implementation is complete.
Keep the requirements document focused on what the user sees, needs, and accepts. Keep `/docs/plans/plan.md` focused on execution state, sequencing, and checkbox progress. Archive `/docs/plans/plan.md` as `/docs/plans/plan.YYYYMMDD-HHMMSS.md` once every tracked checkbox is complete so the active execution tracker is cleared without losing the execution record.
If the incoming request is overly detailed or repetitive, propose a higher-level goal framing, show the preserved constraints, and ask the instruction giver to review that reframing before you drive the spec and plan from it.
This skill owns planning artifacts and shared commit-log workflow, not app architecture or cloud platform rules. Pair it with the relevant coding or hosting skill after the spec and execution path are clear.

## Quick Start

1. Read [`references/spec-documentation.md`](references/spec-documentation.md) before writing or updating `/docs/spec/`.
2. Read [`references/plan-documentation.md`](references/plan-documentation.md) before creating or rewriting `/docs/plans/plan.md`.
3. Read [`references/commit-history-guidance.md`](references/commit-history-guidance.md) before recording shared commit history.
4. Read [`references/plan-execution-workflow.md`](references/plan-execution-workflow.md) before executing the plan.
5. For a new development request:
   - if the request is to build, bootstrap, change, refactor, or extend a non-trivial application, feature, route, UI, API, workflow, or service, start with this skill even if the user asked directly for code and did not mention spec or plan files
   - if `/docs/spec/` is empty or the relevant spec does not exist yet, start by creating the initial user-facing spec under `/docs/spec/`
   - if the incoming instruction is overly fine-grained, propose a higher-level goal framing and ask the instruction giver to review it before drafting the spec and plan
   - create or update the temporary execution tracker in `/docs/plans/plan.md`
   - choose only the hierarchy levels the work needs: a single `Section` for simple work, add `Subsection` for grouped reviewable slices, and add `Sub-subsection` only when a subsection still needs a deeper ordered breakdown
6. During implementation:
   - keep `/docs/plans/plan.md` checkboxes current
   - record changes in deliberate, reviewable commit units
   - add new plan items when newly discovered required tasks appear during execution
   - split existing plan items into smaller reviewable tasks when the work becomes clearer
   - revise the plan when technical findings change the execution path, sequencing, or slice boundaries
   - update the spec and plan if accepted behavior or execution sequence changes
7. At completion:
   - confirm all plan checkboxes are done or intentionally removed
   - archive `/docs/plans/plan.md` as `/docs/plans/plan.YYYYMMDD-HHMMSS.md`

## Non-Negotiable Rules

- Document the user-visible requirement under `/docs/spec/` before substantial implementation begins.
- Default to this skill for non-trivial application-development requests, even when the user asks directly for implementation without mentioning spec or plan files.
- Treat requests to build, bootstrap, implement, extend, or refactor an application, feature, route, UI, API, workflow, or service as triggers for this skill unless the task is clearly trivial or purely non-behavioral maintenance.
- If `/docs/spec/` has no relevant document for the request yet, create the initial spec before creating the main implementation.
- Create or update `/docs/plans/plan.md` before substantial implementation so execution is tracked in one place.
- Keep `/docs/plans/plan.md` temporary. Archive it as `/docs/plans/plan.YYYYMMDD-HHMMSS.md` when all tracked checkboxes are complete and no current execution tracking is still needed.
- When incoming instructions are overly fine-grained or repetitive, propose a higher-level goal that preserves the user's intent and ask the instruction giver to review it before adopting it.
- Preserve hard constraints, acceptance criteria, and externally required sequencing, but do not mirror incidental micromanagement step by step.
- Structure `/docs/plans/plan.md` as an ordered hierarchy only to the extent the work needs it:
  - use a single `Section` for simple, directly executable work
  - add `Subsection` when a section spans several reviewable slices
  - add `Sub-subsection` only when a subsection still needs a deeper ordered breakdown
- Break work into the smallest meaningful reviewable steps and record them as checkboxes under the lowest useful heading.
- Add newly discovered required tasks to `/docs/plans/plan.md` as soon as they are known instead of keeping them only in working memory.
- Split or replace an existing checkbox with smaller reviewable tasks when implementation reveals a clearer breakdown.
- Update checkboxes as work completes. Do not leave finished steps unchecked.
- Remove or rewrite stale plan items when the work changes. Do not preserve obsolete steps just for history.
- Revise `/docs/plans/plan.md` when implementation reveals a better technical path. Do not force execution to follow an outdated plan.
- Keep shared commit history in Conventional Commits format when the repository uses it.
- Prefer one logical, reviewable work unit per commit when practical.
- Split behavior changes, refactors, docs, tests, and dependency updates into separate commits when they represent different reasons to change, but do not force tiny broken commits.
- Keep the spec and plan aligned. Do not let one artifact tell a different story from the other.
- Use a filesystem-safe sortable timestamp such as `YYYYMMDD-HHMMSS` when archiving a completed plan.
- Do not turn the active `/docs/plans/plan.md` into a permanent history log. When the work is done, archive it to `/docs/plans/plan.YYYYMMDD-HHMMSS.md` and start a fresh `/docs/plans/plan.md` for the next delivery unit.
- Do not skip this workflow just because a coding or hosting companion skill also applies. Use this skill first for the spec and plan, then pair the companion skill for implementation decisions.

## Workflow

### 1. Capture the request in `/docs/spec`

- For non-trivial application-development work, assume this step is required by default unless the task is clearly a trivial patch or non-behavioral maintenance.
- Create `/docs/spec/` if it does not exist.
- If `/docs/spec/` exists but does not yet contain a relevant document for the request, start by creating the initial spec file.
- Use a clear filename that ties back to the work item, typically with a stable slug.
- Capture the request as a user-facing requirement document before writing the main implementation.
- If the request arrives as repeated micro-instructions, show a higher-level goal framing around the user goal, visible outcome, and real constraints, then ask the instruction giver to confirm it before you rely on it.
- Link the spec to `/docs/plans/plan.md` while the temporary plan exists.

### 2. Create or update `/docs/plans/plan.md`

- Create `/docs/plans/` if it does not exist.
- Use `/docs/plans/plan.md` as the temporary execution tracker for the current delivery unit.
- Start with only the hierarchy levels that the work actually needs.
- Keep the lowest active heading immediately executable.
- Add `Subsection` only when several reviewable slices need grouping.
- Add `Sub-subsection` only when a subsection still needs another ordered layer.
- Once the reframed goal is reviewed, plan against that higher-level goal rather than every repeated instruction line.
- Keep plan items about delivery steps, not vague aspirations.
- When execution reveals new required work for the current delivery unit, add it to the active plan under the right heading before or as you execute it.
- When a coarse task becomes clearer during execution, replace it with smaller checkboxes under the lowest useful heading instead of leaving it vague.

### 3. Implement and keep the workflow current

- Complete work one meaningful slice at a time.
- Check off the matching plan checkbox as each slice is finished.
- Add plan items for newly discovered required tasks as soon as they are identified.
- Split broad tasks into smaller checkboxes when implementation reveals a better execution breakdown.
- Update `/docs/plans/plan.md` if work is reordered, split, or moved between `Section`, `Subsection`, and `Sub-subsection` blocks.
- Revise `/docs/plans/plan.md` when technical review or implementation findings change dependencies, sequencing, or slice boundaries.
- Record progress in coherent commits that match the current execution slice.
- Update the spec when accepted behavior changes.
- Keep the active plan small enough to stay useful.

### 4. Finish cleanly

- Confirm every plan checkbox is complete or intentionally removed.
- Archive `/docs/plans/plan.md` as `/docs/plans/plan.YYYYMMDD-HHMMSS.md` once there is no remaining tracked work.
- Keep the durable behavior description in `/docs/spec/`, and keep completed execution history in the archived plan file rather than in the active `/docs/plans/plan.md`.

## References

- spec-writing guidance: [`references/spec-documentation.md`](references/spec-documentation.md)
- `/docs/plans/plan.md` hierarchical structure and checkbox guidance: [`references/plan-documentation.md`](references/plan-documentation.md)
- commit history and Conventional Commits guidance: [`references/commit-history-guidance.md`](references/commit-history-guidance.md)
- plan execution and cleanup workflow: [`references/plan-execution-workflow.md`](references/plan-execution-workflow.md)
