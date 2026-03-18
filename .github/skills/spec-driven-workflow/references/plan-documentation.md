# Plan Documentation

Use this reference when creating or updating `/docs/plans/plan.md` for a development request.

## Goal

Turn the request into a temporary execution tracker that can be executed from top to bottom, keeps related work grouped, links back to the small canonical document set, and can be archived cleanly once the work is done.
Use the plan as the only home for transient working notes.

## Hierarchical Model

- `Section`: the top-level execution block or phase
- `Subsection`: a grouped reviewable slice inside a section
- `Sub-subsection`: an optional deeper ordered breakdown when a subsection still spans several concrete steps

Use only the levels the work actually needs.

- Simple work may use a single `Section` only.
- Medium-complexity work may use `Section` and `Subsection`.
- Add `Sub-subsection` only when another ordered layer makes execution clearer.

## Recommended Structure

```md
# Execution Plan

## Links
- Spec: /docs/spec/specification.md
- Operations: /docs/operations.md
- Design: /docs/design.md

## Section 1 - <phase or workstream>
### Subsection 1.1 - <reviewable slice>
- [ ] <next actionable step>
- [ ] <next actionable step>

#### Sub-subsection 1.1.1 - <optional deeper breakdown>
- [ ] <concrete step>
- [ ] <concrete step>
```

## Good Plan Characteristics

- The top-down order makes the next execution slice obvious.
- Each heading has a descriptive title, not just a number.
- Each checkbox represents one meaningful delivery step.
- Temporary notes stay near the active work instead of leaking into durable docs.
- The plan stays small enough to review and rewrite.
- The hierarchy reflects actual work shape, not ceremony.
- The lowest active heading contains the items that can be executed now.

## Good Examples

- `## Section 1 - Bootstrap`
  - `[ ] Write or update /docs/spec/specification.md`
- `### Subsection 1.1 - First reviewed slice`
  - `[ ] Add or update the route or API surface for the new behavior`
  - `[ ] Implement the UI or server slice`
- `### Subsection 1.2 - Supporting docs`
  - `[ ] Update /docs/operations.md or /docs/design.md only if the request changes those contracts`
- `### Subsection 1.3 - Active notes`
  - `Notes: keep investigation findings, open questions, and verification snippets here while they are still live`
- `#### Sub-subsection 1.1.1 - Verification`
  - `[ ] Run verification and update the plan`

## Bad Examples

- A large top-level section with no actionable lowest-level checklist when the next steps are already known
- Generic headings such as `## Section 1` with no descriptive title
- Checkboxes such as `[ ] Implement feature` or `[ ] Finalize everything`
- Leaving completed work unchecked
- Keeping obsolete sections or tasks after the work changes

## Practical Guidance

- Start with one `Section` unless the work clearly needs more structure.
- Link only the canonical docs that are actually active for the current delivery unit.
- Add `Subsection` only when it helps group several reviewable slices.
- Add `Sub-subsection` only when another level materially improves clarity.
- If the incoming request is over-specified, propose the farthest stable goal you think captures it and ask the instruction giver to review that framing before shaping the plan tree.
- Order `Section`, `Subsection`, and `Sub-subsection` blocks in the sequence they should be executed.
- Keep the next executable lowest-level block near the top of the remaining plan.
- Preserve true constraints and required sequencing, but do not turn every repeated instruction into its own checkbox.
- Add new tasks to the active plan when execution uncovers required work that was not known during the initial draft.
- Keep transient work notes in the active plan instead of in `/docs/spec/specification.md`, `/docs/operations.md`, or `/docs/design.md`.
- Add short note bullets when you need to capture an investigation result, unresolved question, temporary decision, or verification memo during execution.
- Delete or rewrite stale notes as the work becomes clearer.
- Replace a coarse checkbox with smaller tasks when more detail becomes available and the finer breakdown improves execution clarity.
- Rewrite the plan when the execution path changes instead of appending stale history.
- If technical investigation reveals a better execution path, revise the plan to match the current best approach instead of preserving the original guess.
- If the request or accepted durable docs expose technical infeasibility, unresolved high-risk technical assumptions, contradiction, ambiguity, or redundancy, propose a corrected version to the instruction giver before locking in the affected plan slice.
- Update the canonical docs only when accepted requirements change; technical replanning by itself belongs in `/docs/plans/plan.md`.

## Completion Rule

- Check a box only when the corresponding step is actually done.
- Remove or rewrite obsolete checkboxes instead of leaving misleading stale tasks behind.
- When all remaining checkboxes are complete and no tracked execution work remains, archive `/docs/plans/plan.md` as `/docs/plans/plan.YYYYMMDD-HHMMSS.md`.
