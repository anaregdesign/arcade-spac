# Spec Documentation

Use this reference when choosing and updating the durable requirement docs for a development request.

## Goal

Document the request in a small canonical document set before substantial implementation starts.
Keep the durable docs as the canonical description of the accepted end state, not as a change-history log or a work notebook.
Prefer updating existing canonical docs over creating new request-specific files.

## Canonical Document Routing

Follow repository instructions first when they define exact paths or stricter rules. Otherwise prefer this routing:

- `/docs/spec/specification.md`
  - final user-visible requirements, goal image, Scope, Non-Goals, user-visible behavior, and Acceptance Criteria
- `/docs/operations.md`
  - accepted long-lived operational constraints, environment assumptions, and operational dependencies that are not part of the user-visible contract
- `/docs/design.md`
  - accepted long-lived design direction, UX rules, content guidance, layout rules, and visual constraints

Keep one durable file per category. Prefer a new section inside an existing canonical file over creating another file.
Keep transient working notes in `/docs/plans/plan.md`, not in the durable docs.

## Required Characteristics

- Write for people who care about the behavior, not the internal code structure.
- Keep the primary focus on the category-appropriate requirement, not raw implementation detail.
- Keep only the current ideal requirement in each durable doc; rewrite superseded sections instead of preserving revision history inside those files.
- Keep `/docs/spec/specification.md` limited to the final functional requirement and accepted goal image.
- Update the existing canonical file before considering any new file.
- Create a new durable doc only when the matching canonical file does not exist yet.
- Do not create per-feature spec files or dated requirement files when the content belongs in an existing canonical file.
- If the request arrives as overly detailed instructions, propose a higher-level goal framing and ask the instruction giver to review it before using it as the spec anchor.
- If the request or draft doc has technical infeasibility, unresolved high-risk technical assumptions, contradiction, ambiguity, or redundancy, surface the issue and propose a corrected version to the instruction giver before treating it as final.
- Do not use the durable docs as the home for current-step memos, investigation trails, or temporary checklists.
- Update the relevant durable doc if the accepted requirement changes during development.

## Recommended Content by File

### `/docs/spec/specification.md`

- `Summary`
- `User Problem`
- `Users and Scenarios`
- `Scope`
- `Non-Goals`
- `User-Visible Behavior`
- `Acceptance Criteria`
- `Edge Cases`
- `Constraints and Dependencies`
- `Links`

### `/docs/operations.md`

- `Summary`
- `Operational Goals`
- `Delivery Constraints`
- `Environment and Dependency Assumptions`
- `Operational Risks or Guardrails`
- `Links`

### `/docs/design.md`

- `Summary`
- `Design Goals`
- `User Experience Principles`
- `Information Hierarchy`
- `Interaction and State Guidance`
- `Content and Tone Guidance`
- `Visual Constraints`
- `Links`

## Recommended Structure for `/docs/spec/specification.md`

```md
# <Feature or Change Title>

## Summary

## User Problem

## Users and Scenarios

## Scope

## Non-Goals

## User-Visible Behavior

## Acceptance Criteria

## Edge Cases

## Constraints and Dependencies

## Links
```

## What To Capture

- Which canonical file owns each part of the request
- What final state the user is trying to reach
- What pain point or missing capability exists today
- What changes in the visible behavior after the work ships
- What is explicitly out of scope
- What counts as done from the user's perspective
- What edge cases or error paths still matter to the user
- Which constraints are truly part of the accepted end state, after removing incidental micromanagement

## File Selection Rules

- If the repository already defines canonical filenames, use those exact paths.
- If the relevant canonical file already exists, update it first.
- If the category exists in the request but its canonical file does not exist yet, create that canonical file.
- If a request adds another feature in an existing category, prefer a new section inside the canonical file instead of creating another file.
- If the original request is a long list of detailed instructions, show a condensed goal-and-constraints framing to the instruction giver and get review on that framing before you expand it into a plan.

## What To Avoid

- Do not start with folder layout, classes, Hook names, or schema details.
- Do not let implementation notes replace acceptance criteria.
- Do not let `/docs/plans/plan.md` replace the user-facing requirement document.
- Do not add changelog sections, dated revision notes, or historical deltas inside the durable docs; keep that history in git and archived plans instead.
- Do not create request-specific files under `/docs/spec/` when the content belongs in `/docs/spec/specification.md`.
- Do not create a new durable doc merely because the request is a new feature name.
- Do not store temporary execution notes, investigation logs, verification snippets, or unresolved work items in the durable docs.
- Do not silently normalize technical infeasibility, unresolved high-risk technical assumptions, contradiction, ambiguity, or redundancy away inside the docs; show the issue and proposed correction to the instruction giver.
- Do not leave the spec as a vague problem statement without concrete behavior.
- Do not silently replace long step-by-step instructions with your own abstraction; show the proposed higher-level goal and ask for review first.
- Do not keep stale behavior in the durable docs after the implementation direction changes.

## Quality Check

Before coding substantially, confirm the durable docs answer these questions:

- Which canonical file owns this requirement?
- Who is the user of this change?
- What can they do after the change that they could not do before?
- What should they see when the change succeeds?
- What should they see when common errors or edge cases happen?
- What is not being solved in this request?
- What would make a reviewer say the work is complete?
