# Plan Execution Workflow

Use this reference when executing the active plan for a development request.

## 1. Create or Update `/docs/plans/plan.md`

- Create `/docs/plans/plan.md` after the spec is clear enough to guide implementation.
- Keep links near the top of the plan to the canonical docs that govern the work.
- Use only the hierarchy levels the work actually needs.
- Treat the plan as the only home for transient work notes.
- If the request was overly detailed, propose the higher-level goal you intend to use and get review on that reframing before filling in the plan tree.
- If the request or accepted durable docs contain technical infeasibility, unresolved high-risk technical assumptions, contradiction, ambiguity, or redundancy, show the issue and proposed correction to the instruction giver before filling in the affected plan slice.
- Treat `/docs/plans/plan.md` as temporary execution state, not as durable documentation.

Example shape:

```md
# Execution Plan

## Links
- Spec: /docs/spec/specification.md
- Operations: /docs/operations.md
- Design: /docs/design.md

## Section 1 - First delivery slice
### Subsection 1.1 - Implementation
- [ ] Implement the first reviewed slice
#### Sub-subsection 1.1.1 - Verification
- [ ] Run verification
```

## 2. Keep the Plan Current During Execution

- Check off plan tasks as they finish.
- Add new tasks to `/docs/plans/plan.md` when newly discovered required work appears during execution.
- Add note bullets to the active plan when you need to capture investigation findings, open questions, temporary decisions, or verification snippets.
- Split broad tasks into smaller checkboxes when implementation reveals a clearer execution breakdown.
- Update `/docs/plans/plan.md` when work is reordered, split, or moved between `Section`, `Subsection`, and `Sub-subsection` blocks.
- Revise `/docs/plans/plan.md` when technical findings change dependencies, sequencing, or slice boundaries.
- Record progress in coherent commit units that match the current execution slice.
- Update the canonical docs when accepted requirements change.
- Keep transient notes out of `/docs/spec/specification.md`, `/docs/operations.md`, and `/docs/design.md`.
- If implementation exposes technical infeasibility, unresolved high-risk technical assumptions, contradiction, ambiguity, or redundancy in the accepted request or durable docs, pause the affected slice long enough to propose a correction before continuing.
- Keep the plan small enough to stay legible.

## 3. Finish and Clean Up

- Confirm all meaningful plan checkboxes are complete.
- Archive `/docs/plans/plan.md` as `/docs/plans/plan.YYYYMMDD-HHMMSS.md` once there is no remaining tracked work.
- Keep the durable behavior description in the canonical docs limited to the latest ideal requirement, and keep completed execution history in archived plan files and git rather than in those durable docs or the active `/docs/plans/plan.md`.
- If additional follow-up work remains after the current execution slice finishes, archive the completed plan first and then replace it with a new current `/docs/plans/plan.md` instead of keeping stale completed history in the active file.
