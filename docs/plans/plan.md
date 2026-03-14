# Execution Plan

## Links
- Spec: /docs/spec/games/two-minute-expansion-wave.md

## Section 1 - Define the 10-game expansion
### Subsection 1.1 - Durable specs
- [x] Write the umbrella spec for the pure-add 10 game expansion.
- [x] Write individual specs for Orbit Tap, Target Trail, Path Recall, Pulse Count, Quick Sum, Symbol Hunt, Light Grid, Tile Shift, Stack Sort, and Mirror Match.
- [x] Update broader catalog references so the shipped lineup and links no longer contradict the new target state.

## Section 2 - Extend shared metadata and discovery
### Subsection 2.1 - Catalog and previews
- [ ] Add the 10 new game definitions to the shared catalog metadata and route/result helpers.
- [ ] Register workspace Components, instructions, and home preview metadata for every new game.
- [ ] Add preview assets so the home hub can render all 10 new game cards without fallback placeholders.

## Section 3 - Implement wave A gameplay
### Subsection 3.1 - Timing, chase, and recall games
- [ ] Implement Orbit Tap session, workspace Hook, Component, and styling.
- [ ] Implement Target Trail session, workspace Hook, Component, and styling.
- [ ] Implement Path Recall session, workspace Hook, Component, and styling.
- [ ] Implement Pulse Count session, workspace Hook, Component, and styling.
- [ ] Implement Quick Sum session, workspace Hook, Component, and styling.

## Section 4 - Implement wave B gameplay
### Subsection 4.1 - Search and puzzle games
- [ ] Implement Symbol Hunt session, workspace Hook, Component, and styling.
- [ ] Implement Light Grid session, workspace Hook, Component, and styling.
- [ ] Implement Tile Shift session, workspace Hook, Component, and styling.
- [ ] Implement Stack Sort session, workspace Hook, Component, and styling.
- [ ] Implement Mirror Match session, workspace Hook, Component, and styling.

## Section 5 - Verify and deliver
### Subsection 5.1 - Quality gates and release path
- [ ] Run targeted unit coverage for the expanded catalog and touched gameplay helpers.
- [ ] Run `npm run typecheck`, `npm run test:unit`, and `npm run build`.
- [ ] Verify the GitHub release workflow path and trigger the production delivery path if repository auth and release prerequisites are available.
- [ ] Archive this completed plan as `/docs/plans/plan.YYYYMMDD-HHMMSS.md`.
