# Game Catalog 50 Expansion Plan

## Links
- Program spec: /docs/spec/game-catalog-50-expansion-program.md
- Current game spec: /docs/spec/games/tempo-hold.md

## Section 1 - Catalog Recovery Audit
- [x] Confirm the durable game-spec inventory covers 50 game specs plus 2 meta specs (`two-minute-expansion-wave`, expansion program support docs).
- [x] Confirm the current app implementation exposes 32 playable games in `supportedGames` and `game-workspace-registry`.
- [x] Choose the next reviewable slice as one low-risk unimplemented game that fits the current shared result and UI architecture.

## Section 2 - Current Slice: Tempo Hold
### Subsection 2.1 - Spec and planning alignment
- [ ] Rewrite `/docs/spec/games/tempo-hold.md` so the user-visible behavior, result metrics, and touch-safe hold readability are explicit.
- [x] Keep this active plan focused on the current slice and append new implementation tasks only when they become concrete.

### Subsection 2.2 - App integration
- [ ] Add `Tempo Hold` to the game catalog metadata and Home preview mapping.
- [ ] Add the game registry entry, help content, and preview asset.
- [ ] Implement the `Tempo Hold` session and workspace Hook under `app/lib/client/usecase/game-workspace/`.
- [ ] Implement the `Tempo Hold` workspace Component and CSS under `app/components/games/tempo-hold/`.
- [ ] Add deterministic Playwright hooks for current hold window and release state without changing the visible UI.
- [ ] Keep hold meter readability and primary release target stable on narrow viewports.
- [ ] Update the touched catalog and Home selector tests for the new game metadata.

### Subsection 2.3 - Verification and slice closeout
- [ ] Run targeted automated verification for the touched catalog and gameplay modules.
- [ ] Run Playwright UI verification for `/games/tempo-hold` and the Home card.
- [ ] Commit the `Tempo Hold` slice in one reviewable unit.

## Section 3 - Named Backlog
- [x] `Spot Change` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [ ] `Beat Match` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Block Tessellate` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Bounce Angle` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Box Fill` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Bubble Spawn` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Cascade Clear` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Cascade Flip` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Chain Trigger` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [x] `Color Census` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Flip Match` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [ ] `Gap Rush` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Glow Cycle` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [x] `Hue Drift` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [ ] `Icon Chain` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Intercept Ball` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Line Connect` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Merge Climb` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Obstacle Stream` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [x] `Phase Lock` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Position Lock` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Rotate Align` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Sequence Point` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Spinner Aim` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Sync Pulse` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [x] `Tap Safe` - implementation, automated verification, Playwright UI verification, and commit are complete.
- [ ] `Tempo Hold` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Tempo Weave` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Tile Instant` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Zone Lock` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
