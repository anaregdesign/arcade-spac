# Plan Execution Workflow

Use this reference when executing the active plan for a development request.

## 1. Create or Update `/docs/plans/plan.md`

- Create `/docs/plans/plan.md` after the spec is clear enough to guide implementation.
- Keep the spec link near the top of the plan.
- Use only the hierarchy levels the work actually needs.
- If the request was overly detailed, propose the higher-level goal you intend to use and get review on that reframing before filling in the plan tree.
- Treat `/docs/plans/plan.md` as temporary execution state, not as durable documentation.

Example shape:

```md
# Execution Plan

## Links
- Spec: /docs/spec/feature-name.md

## Section 1 - First delivery slice
### Subsection 1.1 - Implementation
- [ ] Implement the first reviewed slice
#### Sub-subsection 1.1.1 - Verification
- [ ] Run verification
```

## 2. Keep the Plan Current During Execution

- Check off plan tasks as they finish.
- Update `/docs/plans/plan.md` when work is reordered, split, or moved between `Section`, `Subsection`, and `Sub-subsection` blocks.
- Revise `/docs/plans/plan.md` when technical findings change dependencies, sequencing, or slice boundaries.
- Record progress in coherent commit units that match the current execution slice.
- Update the spec when accepted user-visible behavior changes.
- Keep the plan small enough to stay legible.

## 3. Finish and Clean Up

- Confirm all meaningful plan checkboxes are complete.
- Archive `/docs/plans/plan.md` as `/docs/plans/plan.YYYYMMDD-HHMMSS.md` once there is no remaining tracked work.
- Keep the durable behavior description in `/docs/spec/`, and keep completed execution history in the archived plan file rather than in the active `/docs/plans/plan.md`.
- If additional follow-up work remains after the current execution slice finishes, archive the completed plan first and then replace it with a new current `/docs/plans/plan.md` instead of keeping stale completed history in the active file.
