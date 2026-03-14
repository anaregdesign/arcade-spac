# Execution Plan

## Links
- Spec: /docs/spec/games/two-minute-expansion-wave.md
- Release: https://github.com/anaregdesign/arcade-spec/releases/tag/v2026.03.14.9
- Delivery workflow: https://github.com/anaregdesign/arcade-spec/actions/runs/23081797442
- Production app: https://ca-arcade.mangomoss-700713f4.japaneast.azurecontainerapps.io

## Section 1 - Define the 10-game expansion
### Subsection 1.1 - Durable specs
- [x] Write the umbrella spec for the pure-add 10 game expansion.
- [x] Write individual specs for Orbit Tap, Target Trail, Path Recall, Pulse Count, Quick Sum, Symbol Hunt, Light Grid, Tile Shift, Stack Sort, and Mirror Match.
- [x] Update broader catalog references so the shipped lineup and links no longer contradict the new target state.

## Section 2 - Extend shared metadata and discovery
### Subsection 2.1 - Catalog and previews
- [x] Add the 10 new game definitions to the shared catalog metadata and route/result helpers.
- [x] Register workspace Components, instructions, and home preview metadata for every new game.
- [x] Add preview assets so the home hub can render all 10 new game cards without fallback placeholders.

## Section 3 - Implement wave A gameplay
### Subsection 3.1 - Timing, chase, and recall games
- [x] Implement Orbit Tap session, workspace Hook, Component, and styling.
- [x] Implement Target Trail session, workspace Hook, Component, and styling.
- [x] Implement Path Recall session, workspace Hook, Component, and styling.
- [x] Implement Pulse Count session, workspace Hook, Component, and styling.
- [x] Implement Quick Sum session, workspace Hook, Component, and styling.

## Section 4 - Implement wave B gameplay
### Subsection 4.1 - Search and puzzle games
- [x] Implement Symbol Hunt session, workspace Hook, Component, and styling.
- [x] Implement Light Grid session, workspace Hook, Component, and styling.
- [x] Implement Tile Shift session, workspace Hook, Component, and styling.
- [x] Implement Stack Sort session, workspace Hook, Component, and styling.
- [x] Implement Mirror Match session, workspace Hook, Component, and styling.

## Section 5 - Verify and deliver
### Subsection 5.1 - Quality gates and release path
- [x] Run targeted unit coverage for the expanded catalog and touched gameplay helpers.
- [x] Run `npm run typecheck`, `npm run test:unit`, and `npm run build`.
- [x] Verify the GitHub release workflow path and trigger the production delivery path if repository auth and release prerequisites are available.
- [x] Archive this completed plan as `/docs/plans/plan.YYYYMMDD-HHMMSS.md`.
