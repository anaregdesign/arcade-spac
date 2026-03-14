# Game Catalog 50 Expansion Plan

## Links
- Program spec: /docs/spec/game-catalog-50-expansion-program.md
- Current game spec: /docs/spec/games/merge-climb.md

## Section 1 - Catalog Recovery Audit
- [x] Confirm the durable game-spec inventory covers 50 game specs plus 2 meta specs (`two-minute-expansion-wave`, expansion program support docs).
- [x] Confirm the current app implementation exposes 40 playable games in `supportedGames` and `game-workspace-registry`.
- [x] Choose the next reviewable slice as one low-risk unimplemented game that fits the current shared result and UI architecture.

### Subsection 1.1 - Remaining backlog risk buckets
- [x] `Low risk` bucket: `Chain Trigger`, `Icon Chain`, `Merge Climb` because they fit deterministic tap-first planning flows without physics or drag-heavy editing.
- [x] `Medium risk` bucket: `Block Tessellate`, `Box Fill`, `Bubble Spawn`, `Cascade Clear`, `Line Connect`, `Relative Pitch` because they need either placement UX, chain-resolution tuning, board-edit interactions, or browser-audio coordination beyond the current simplest patterns.
- [x] `High risk` bucket: `Bounce Angle`, `Cascade Flip`, `Gap Rush`, `Intercept Ball` because they depend on reflection, continuous movement, moving-board memory pressure, or collision-heavy survival loops that are harder to verify and keep touch-safe.
- [x] Normalized spec inventory currently leaves 11 unimplemented slugs, which is still 1 above the 50-game target; `Relative Pitch` was added as a swap for `Obstacle Stream`, not as net-new scope.

### Subsection 1.2 - Backlog spec redesign
- [x] Rewrite the 12 unimplemented game specs so the backlog covers the currently missing mechanic families without collapsing into same-input variants.
- [x] Replace one lower-yield reflex-survival backlog slot with `Relative Pitch` so audio discrimination enters the catalog without expanding the 50-game target.
- [x] Keep the redesign bounded by implementation reality: preserve touch-safe interaction, deterministic verification hooks, and 2-minute run limits even when adding physics, drag, survival pressure, or audio playback.
- [x] Re-check the rewritten backlog for balanced coverage across continuous action, physics, drag/editing, growth strategy, cascade systems, moving-board memory, survival-first scoring, and audio discrimination.

## Section 2 - Current Slice: Merge Climb
### Subsection 2.1 - Spec and planning alignment
- [x] Rewrite `/docs/spec/games/merge-climb.md` so the merge growth, result metrics, and touch-safe move controls are explicit.
- [ ] Keep this active plan focused on the current slice and append new implementation tasks only when they become concrete.

### Subsection 2.2 - App integration
- [ ] Add `Merge Climb` to the game catalog metadata and Home preview mapping.
- [ ] Add the game registry entry, help content, and preview asset.
- [ ] Implement the `Merge Climb` session and workspace Hook under `app/lib/client/usecase/game-workspace/`.
- [ ] Implement the `Merge Climb` workspace Component and CSS under `app/components/games/merge-climb/`.
- [ ] Add deterministic Playwright hooks for board state, direction input, max value, and run completion without changing the visible UI.
- [ ] Keep the merge board and move controls readable and touch-safe on narrow viewports.
- [ ] Update the touched catalog and Home selector tests for the new game metadata.

### Subsection 2.3 - Verification and slice closeout
- [ ] Run targeted automated verification for the touched catalog and gameplay modules.
- [ ] Run Playwright UI verification for `/games/merge-climb` and the Home card.
- [ ] Commit the `Merge Climb` slice in one reviewable unit.

## Section 3 - Named Backlog
- [x] `Spot Change` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Beat Match` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [ ] `Block Tessellate` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Bounce Angle` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Box Fill` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Bubble Spawn` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Cascade Clear` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Cascade Flip` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [x] `Chain Trigger` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Color Census` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Flip Match` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [ ] `Gap Rush` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [x] `Glow Cycle` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Hue Drift` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Icon Chain` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [ ] `Intercept Ball` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Line Connect` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Merge Climb` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [x] `Phase Lock` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Position Lock` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [ ] `Relative Pitch` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [x] `Rotate Align` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Sequence Point` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Spinner Aim` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Sync Pulse` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Tap Safe` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Tempo Hold` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Tempo Weave` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Tile Instant` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Zone Lock` - implementation, automated verification, Playwright UI verification, and commit are complete.
