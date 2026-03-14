# Execution Plan

## Links
- Spec: `/docs/spec/mobile-gameplay-ui-consistency-audit.md`

## Section 1 - Audit setup and shared criteria
- [x] Capture the durable spec for the 50-game mobile gameplay UI audit.
- [ ] Maintain this execution plan during the audit by appending newly discovered tasks and retaining completed checkboxes until archive.
- [x] Start the local app, sign in with fixture data, and prepare Playwright routes for cross-game review.
- [x] Record the shared mobile and desktop acceptance rubric for viewport fit, tap target placement, layout balance, and overall play comfort.
- [x] Run an initial cross-viewport route sweep for all 50 game routes to identify layout outliers before game-specific repair.
- [ ] Add a shared compact pattern for summary-heavy and action-heavy board cards that overrun the mobile viewport.
- [ ] Reorder or compress tray-first and side-panel-first layouts that push the primary board below the fold on mobile.
- [ ] Normalize tap-answer and tap-lane button placement patterns across games that rely on repeated primary button taps.
- [ ] Bias mobile primary button placement toward the lower part of the viewport for games that use separate tap buttons outside the board itself.
- [ ] Keep twin-board and twin-panel comparison games compact enough to stay horizontally paired on mobile when a stacked layout would push gameplay below the fold.
- [ ] Prevent answer-choice and clue-card layouts from falling back to single-column mobile stacks when two compact columns keep the game playable without shrinking touch targets too far.
- [ ] Compress side insight panels on graph, timing, and zone-planning games so auxiliary copy does not outrun the playable board on either mobile or desktop.
- [ ] Normalize game title / description blocks into one compact shared gameplay heading and drop redundant explanatory copy on mobile where the help affordance already covers it.
- [ ] Move redundant board-level rule copy into HowToPlay and keep only live gameplay cue text in the workspace itself.
- [x] Add a shared visual cue pattern that prefers stable icon / color / shape signals over prose-heavy instructions for instruction-dense games.
- [ ] Evaluate any remaining instruction-heavy outliers after copy reduction and record whether rule simplification is actually necessary.
- [ ] Classify the 50 game workspaces into shared gameplay layout archetypes and record which games map to each archetype.
- [x] Add shared gameplay layout variants under `app/components/gameplay/` so similar games can reuse the same structural mobile / desktop layout rules without being confused with game-specific Components.
- [x] Relocate legacy cross-game workspace primitives from `app/components/games/shared/` into `app/components/gameplay/workspace/` so shared scaffolding no longer reads like a game-specific feature folder.
- [ ] Migrate touched game workspaces away from one-off structural CSS and onto the new shared layout variants where the archetype matches.

### Subsection 1.1 - Shared acceptance rubric
- [x] Mobile pass: initial viewport shows the controls card plus the start of the primary board or playable area without needing an immediate scroll.
- [x] Mobile pass: once a run starts, the main tap controls stay close enough to the board that repeated play does not require constant vertical scrolling.
- [x] Desktop pass: board, status, and primary actions read as one composition without oversized dead space or detached side panels.
- [x] Desktop pass: tap-answer and lane-selection buttons stay in predictable positions relative to the board and do not feel arbitrarily relocated between games.

## Section 2 - Batch 1 mobile audit and repair
### Subsection 2.1 - Games 1-10
- [x] Audit and repair `Color Sweep` on mobile and desktop
- [x] Audit and repair `Color Census` on mobile and desktop
- [x] Audit and repair `Beat Match` on mobile and desktop
- [x] Audit and repair `Block Tessellate` on mobile and desktop
- [x] Audit and repair `Bounce Angle` on mobile and desktop
- [x] Audit and repair `Cascade Flip` on mobile and desktop
- [x] Audit and repair `Gap Rush` on mobile and desktop
- [x] Audit and repair `Bubble Spawn` on mobile and desktop
- [x] Audit and repair `Box Fill` on mobile and desktop
- [x] Audit and repair `Line Connect` on mobile and desktop
- [x] Revisit batch 1 games whose separate mobile buttons still sit too high after the new lower-button-placement requirement.
- [x] Create a reviewable commit for shared or game-specific fixes discovered in games 1-10.

## Section 3 - Batch 2 mobile audit and repair
### Subsection 3.1 - Games 11-20
- [x] Audit and repair `Chain Trigger` on mobile and desktop
- [x] Audit and repair `Icon Chain` on mobile and desktop
- [x] Audit and repair `Merge Climb` on mobile and desktop
- [x] Audit and repair `Relative Pitch` on mobile and desktop
- [x] Audit and repair `Cascade Clear` on mobile and desktop
- [x] Audit and repair `Minesweeper` on mobile and desktop
- [x] Audit and repair `Number Chain` on mobile and desktop
- [x] Audit and repair `Pair Flip` on mobile and desktop
- [x] Audit and repair `Sudoku` on mobile and desktop
- [x] Audit and repair `Pattern Echo` on mobile and desktop
- [x] Create a reviewable commit for shared or game-specific fixes discovered in games 11-20.

## Section 4 - Batch 3 mobile audit and repair
### Subsection 4.1 - Games 21-30
- [x] Audit and repair `Sequence Point` on mobile and desktop
- [x] Audit and repair `Precision Drop` on mobile and desktop
- [x] Audit and repair `Spinner Aim` on mobile and desktop
- [x] Audit and repair `Phase Lock` on mobile and desktop
- [x] Audit and repair `Sync Pulse` on mobile and desktop
- [x] Audit and repair `Glow Cycle` on mobile and desktop
- [x] Audit and repair `Tempo Hold` on mobile and desktop
- [x] Audit and repair `Tempo Weave` on mobile and desktop
- [x] Audit and repair `Orbit Tap` on mobile and desktop
- [x] Audit and repair `Target Trail` on mobile and desktop
- [x] Create a reviewable commit for shared or game-specific fixes discovered in games 21-30.

## Section 5 - Batch 4 mobile audit and repair
### Subsection 5.1 - Games 31-40
- [ ] Audit and repair `Path Recall` on mobile and desktop
- [ ] Audit and repair `Position Lock` on mobile and desktop
- [ ] Audit and repair `Pulse Count` on mobile and desktop
- [ ] Audit and repair `Quick Sum` on mobile and desktop
- [ ] Audit and repair `Sum Grid` on mobile and desktop
- [ ] Audit and repair `Symbol Hunt` on mobile and desktop
- [ ] Audit and repair `Hidden Find` on mobile and desktop
- [ ] Audit and repair `Hue Drift` on mobile and desktop
- [ ] Audit and repair `Spot Change` on mobile and desktop
- [ ] Audit and repair `Tap Safe` on mobile and desktop
- [ ] Create a reviewable commit for shared or game-specific fixes discovered in games 31-40.

## Section 6 - Batch 5 mobile audit and repair
### Subsection 6.1 - Games 41-50
- [ ] Audit and repair `Light Grid` on mobile and desktop
- [ ] Audit and repair `Flip Match` on mobile and desktop
- [ ] Audit and repair `Rotate Align` on mobile and desktop
- [ ] Audit and repair `Tile Shift` on mobile and desktop
- [ ] Audit and repair `Swap Solve` on mobile and desktop
- [ ] Audit and repair `Tile Instant` on mobile and desktop
- [ ] Audit and repair `Zone Lock` on mobile and desktop
- [ ] Audit and repair `Stack Sort` on mobile and desktop
- [ ] Audit and repair `Mirror Match` on mobile and desktop
- [ ] Audit and repair `Shape Morph` on mobile and desktop
- [ ] Create a reviewable commit for shared or game-specific fixes discovered in games 41-50.

## Section 7 - Cross-game verification and closeout
- [ ] Re-check representative desktop and mobile routes after all repairs.
- [ ] Run `npm run typecheck` and any targeted verification needed for touched game workspaces.
- [ ] Archive this completed plan as `/docs/plans/plan.YYYYMMDD-HHMMSS.md`.
