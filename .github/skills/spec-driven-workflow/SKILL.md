---
name: spec-driven-workflow
description: "Own the spec-first planning workflow for application and feature development. Use this skill by default for non-trivial application-development requests, even when `/docs/spec/specification.md`, `/docs/operations.md`, `/docs/design.md`, or `/docs/plans/plan.md` have not been mentioned yet, including building, changing, refactoring, or extending an app, feature, route, UI, API, workflow, or service. Keep `/docs/spec/specification.md` for final functional requirements and goal image only, keep transient work notes in `/docs/plans/plan.md`, prefer updating a small canonical document set instead of creating new per-request spec files, and archive the completed plan as `/docs/plans/plan.YYYYMMDD-HHMMSS.md` once tracked work is done. Do not use this skill to decide app-code architecture or cloud platform topology."
---

# Spec Driven Workflow

## Overview

Use this skill to turn a development request into a spec-first, plan-driven workflow with a small, maintained documentation set. For nearly any non-trivial application-development request, use this skill first by default, even when the user asks directly for implementation and does not mention the docs.
Prefer updating existing canonical documents over creating new request-specific files. Treat document sprawl as a quality bug because it leaves stale instructions behind and makes the real source of truth hard to find.
Keep `/docs/spec/specification.md` for final functional requirements and the accepted goal image only. Put current-step memos, investigation notes, provisional decisions, verification snippets, and execution sequencing in `/docs/plans/plan.md`.
Keep durable requirements in a few canonical docs, keep `/docs/plans/plan.md` focused on execution state plus transient working notes, and archive `/docs/plans/plan.md` as `/docs/plans/plan.YYYYMMDD-HHMMSS.md` once every tracked checkbox is complete.
If the incoming request is overly detailed or repetitive, propose a higher-level goal framing, show the preserved constraints, and ask the instruction giver to review that reframing before driving the spec and plan from it.
This skill owns planning artifacts and shared commit-log workflow, not app architecture or cloud platform rules. Pair it with the relevant coding or hosting skill after the spec and execution path are clear.

## Quick Start

1. Read [`references/spec-documentation.md`](references/spec-documentation.md) before choosing or updating durable requirement docs.
2. Read [`references/plan-documentation.md`](references/plan-documentation.md) before creating or rewriting `/docs/plans/plan.md`.
3. Read [`references/commit-history-guidance.md`](references/commit-history-guidance.md) before recording shared commit history.
4. Read [`references/plan-execution-workflow.md`](references/plan-execution-workflow.md) before executing the plan.
5. Choose the smallest canonical document set that can hold the request.
   - follow repository instructions first when they define exact doc paths or stricter rules
   - default to `/docs/spec/specification.md` for final user-visible requirements, acceptance criteria, and goal image
   - default to `/docs/operations.md` for accepted long-lived operational constraints or environment rules, not current rollout steps or temporary verification notes
   - default to `/docs/design.md` for accepted long-lived design direction and visual constraints, not current exploration notes
   - use `/docs/plans/plan.md` for the temporary execution tracker and all transient working notes for the current delivery unit
6. For a new development request:
   - if the request is to build, bootstrap, change, refactor, or extend a non-trivial application, feature, route, UI, API, workflow, or service, start with this skill even if the user asked directly for code and did not mention spec or plan files
   - start by reading and updating the existing canonical docs that match the request
   - create a missing canonical doc only when that category truly does not exist yet
   - do not create per-feature spec files or dated requirement files unless repository instructions explicitly require them
   - if the incoming instruction is overly fine-grained, propose a higher-level goal framing and ask the instruction giver to review it before drafting the docs and plan
   - if the request contains technical infeasibility, unresolved high-risk technical assumptions, contradiction, ambiguity, or redundancy, call it out explicitly and propose a corrected version to the instruction giver before relying on it
   - create or update the temporary execution tracker in `/docs/plans/plan.md`
   - choose only the hierarchy levels the work needs: a single `Section` for simple work, add `Subsection` for grouped reviewable slices, and add `Sub-subsection` only when a subsection still needs a deeper ordered breakdown
7. During implementation:
   - keep `/docs/plans/plan.md` checkboxes current
   - record changes in deliberate, reviewable commit units
   - add new plan items when newly discovered required tasks appear during execution
   - split existing plan items into smaller reviewable tasks when the work becomes clearer
   - revise the plan when technical findings change the execution path, sequencing, or slice boundaries
   - update the relevant canonical docs only when accepted end-state requirements change
   - update the plan if execution sequencing or technical approach changes
   - rewrite the durable docs to reflect the latest accepted target state instead of appending revision history
   - keep all transient work notes in `/docs/plans/plan.md`
8. At completion:
   - confirm all plan checkboxes are done or intentionally removed
   - archive `/docs/plans/plan.md` as `/docs/plans/plan.YYYYMMDD-HHMMSS.md`

## Non-Negotiable Rules

- Document the user-visible requirement before substantial implementation begins.
- Default to this skill for non-trivial application-development requests, even when the user asks directly for implementation without mentioning spec or plan files.
- Treat requests to build, bootstrap, implement, extend, or refactor an application, feature, route, UI, API, workflow, or service as triggers for this skill unless the task is clearly trivial or purely non-behavioral maintenance.
- Keep durable requirements in a small canonical document set instead of creating request-specific files.
- Prefer updating existing canonical docs before creating a new durable doc.
- Create a new durable doc only when the matching canonical file does not exist yet or repository instructions define a separate required category.
- Follow repository-specific documentation rules when they are stricter than the default guidance. In repositories like this one, `/docs/spec/specification.md` may be the only allowed file under `/docs/spec/`.
- Do not create per-feature files under `/docs/spec/` when the content belongs in `/docs/spec/specification.md`.
- Create or update `/docs/plans/plan.md` before substantial implementation so execution is tracked in one place.
- Keep `/docs/plans/plan.md` temporary. Archive it as `/docs/plans/plan.YYYYMMDD-HHMMSS.md` when all tracked checkboxes are complete and no current execution tracking is still needed.
- Keep `/docs/spec/specification.md` focused on the final functional requirement and accepted goal image only.
- Keep the canonical durable docs focused on the current ideal requirement only. Do not add dated change logs, revision history, superseded requirement snapshots, or transient work notes inside them.
- Put investigation notes, current-step memos, temporary rollout notes, verification snippets, open questions, and provisional choices in `/docs/plans/plan.md` instead of the durable docs.
- When incoming instructions are overly fine-grained or repetitive, propose a higher-level goal that preserves the user's intent and ask the instruction giver to review it before adopting it.
- When a request or draft doc contains technical infeasibility, unresolved high-risk technical assumptions, contradiction, ambiguity, or redundancy, surface the issue explicitly and propose a corrected version to the instruction giver before relying on it.
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
- Keep the canonical docs and plan aligned. Do not let one artifact tell a different story from the others.
- Use a filesystem-safe sortable timestamp such as `YYYYMMDD-HHMMSS` when archiving a completed plan.
- Do not turn the active `/docs/plans/plan.md` into a permanent history log. When the work is done, archive it to `/docs/plans/plan.YYYYMMDD-HHMMSS.md` and start a fresh `/docs/plans/plan.md` for the next delivery unit.
- Do not skip this workflow just because a coding or hosting companion skill also applies. Use this skill first for the docs and plan, then pair the companion skill for implementation decisions.

## Workflow

### 1. Choose or confirm the canonical document set

- For non-trivial application-development work, assume this step is required by default unless the task is clearly a trivial patch or non-behavioral maintenance.
- Determine which durable categories the request actually needs: user-visible requirement, development operation, and design.
- Reuse the existing canonical file for each applicable category before considering any new file.
- Use repository-specific canonical paths when they exist. Otherwise prefer:
  - `/docs/spec/specification.md`
  - `/docs/operations.md`
  - `/docs/design.md`
- Create a missing canonical file only when the category exists in the request and no durable file for that category exists yet.
- Prefer a new section inside an existing canonical file over creating another file.
- Keep one durable file per category unless repository instructions explicitly require more.
- If the request arrives as repeated micro-instructions, show a higher-level goal framing around the user goal, visible outcome, and real constraints, then ask the instruction giver to confirm it before you rely on it.
- If the request or current docs have technical infeasibility, unresolved high-risk technical assumptions, contradiction, ambiguity, or redundancy, show the issue and a proposed correction to the instruction giver before finalizing the docs or plan.

### 2. Capture or update the durable requirements

- Update `/docs/spec/specification.md` before substantial implementation so the final user-visible behavior and goal image are explicit.
- Update `/docs/operations.md` only when the request changes accepted long-lived operational constraints or environment rules.
- Update `/docs/design.md` only when the request changes accepted long-lived design direction or visual constraints.
- Rewrite the durable docs so they describe the latest accepted target state only, without preserving revision history inside those files.
- Link the durable docs to `/docs/plans/plan.md` while the temporary plan exists when that linkage helps execution.
- Do not place current-step memos, investigation trails, temporary checklists, or verification notes in the durable docs.

### 3. Create or update `/docs/plans/plan.md`

- Create `/docs/plans/` if it does not exist.
- Use `/docs/plans/plan.md` as the temporary execution tracker for the current delivery unit.
- Keep links near the top of the plan to the canonical docs that govern the work.
- Keep the plan as the only home for transient working notes.
- Start with only the hierarchy levels that the work actually needs.
- Keep the lowest active heading immediately executable.
- Add `Subsection` only when several reviewable slices need grouping.
- Add `Sub-subsection` only when a subsection still needs another ordered layer.
- Once the reframed goal is reviewed, plan against that higher-level goal rather than every repeated instruction line.
- Keep plan items about delivery steps, not vague aspirations.
- When execution reveals new required work for the current delivery unit, add it to the active plan under the right heading before or as you execute it.
- When a coarse task becomes clearer during execution, replace it with smaller checkboxes under the lowest useful heading instead of leaving it vague.
- Add concise plan notes for open questions, investigation findings, provisional implementation choices, or verification evidence when they matter during execution.
- Remove or rewrite stale plan notes as soon as they stop being useful.

### 4. Implement and keep the workflow current

- Complete work one meaningful slice at a time.
- Check off the matching plan checkbox as each slice is finished.
- Add plan items for newly discovered required tasks as soon as they are identified.
- Split broad tasks into smaller checkboxes when implementation reveals a better execution breakdown.
- Update `/docs/plans/plan.md` if work is reordered, split, or moved between `Section`, `Subsection`, and `Sub-subsection` blocks.
- Revise `/docs/plans/plan.md` when technical review or implementation findings change dependencies, sequencing, or slice boundaries.
- Record progress in coherent commits that match the current execution slice.
- Update the relevant canonical docs when accepted requirements change.
- If implementation exposes technical infeasibility, unresolved high-risk technical assumptions, contradiction, ambiguity, or redundancy in the accepted request or durable docs, pause the affected slice long enough to propose a correction to the instruction giver before continuing.
- Keep the active plan small enough to stay useful.

### 5. Finish cleanly

- Confirm every plan checkbox is complete or intentionally removed.
- Archive `/docs/plans/plan.md` as `/docs/plans/plan.YYYYMMDD-HHMMSS.md` once there is no remaining tracked work.
- Keep the durable behavior description in the canonical docs limited to the latest ideal requirement, and keep completed execution history in archived plan files and git rather than in the durable docs or the active `/docs/plans/plan.md`.

## References

- spec-writing guidance: [`references/spec-documentation.md`](references/spec-documentation.md)
- `/docs/plans/plan.md` hierarchical structure and checkbox guidance: [`references/plan-documentation.md`](references/plan-documentation.md)
- commit history and Conventional Commits guidance: [`references/commit-history-guidance.md`](references/commit-history-guidance.md)
- plan execution and cleanup workflow: [`references/plan-execution-workflow.md`](references/plan-execution-workflow.md)
