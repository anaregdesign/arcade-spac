# Execution Plan

## Links
- Spec: /docs/spec/game-catalog-expansion.md
- Spec: /docs/spec/color-sweep-game.md
- Spec: /docs/spec/number-chain-game.md
- Spec: /docs/spec/pair-flip-game.md

## Section 1 - Phase 1 catalog and docs baseline
### Subsection 1.1 - Durable backlog and shared product docs
- [x] Write durable expansion backlog and first-batch game specs
- [x] Update product requirements and screen flow for the expanded catalog and first-batch games

## Section 2 - Shared catalog metadata and result integration
### Subsection 2.1 - Remove fixed three-game assumptions
- [x] Refactor shared game catalog metadata so home tags, metric labels, and route game definitions do not hard-code the current three titles
- [x] Update result and metric formatting helpers so new time-based games can reuse the same primary/support metric flow
- [ ] Update fixture and seed data for the expanded catalog

## Section 3 - Implement Color Sweep
### Subsection 3.1 - Game workspace and session flow
- [x] Add the `Color Sweep` session Hook and workspace React Component
- [x] Register `Color Sweep` presentation, instructions, tags, and metadata in the shared catalog
- [x] Add preview artwork and responsive styling for the board

## Section 4 - Implement Number Chain
### Subsection 4.1 - Game workspace and session flow
- [x] Add the `Number Chain` session Hook and workspace React Component
- [x] Register `Number Chain` presentation, instructions, tags, and metadata in the shared catalog
- [x] Add responsive styling for the numbered grid

## Section 5 - Implement Pair Flip
### Subsection 5.1 - Game workspace and session flow
- [ ] Add the `Pair Flip` session Hook and workspace React Component
- [ ] Register `Pair Flip` presentation, instructions, tags, and metadata in the shared catalog
- [ ] Add responsive styling for the memory grid

## Section 6 - Verification and cleanup
### Subsection 6.1 - Validate the touched flows
- [ ] Run `npm run typecheck`
- [ ] Verify home and each new game on desktop and mobile with Playwright
- [ ] Delete `/docs/plan.md` after all tracked work is complete
- [ ] Create reviewable commits for docs, shared refactor, and each game slice
