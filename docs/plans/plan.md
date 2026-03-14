# Game Catalog 50 Expansion Plan

## Links
- Program spec: /docs/spec/game-catalog-50-expansion-program.md
- Current game spec: /docs/spec/games/spot-change.md

## Section 1 - Catalog Recovery Audit
- [x] Confirm the durable game-spec inventory covers 50 game specs plus 2 meta specs (`two-minute-expansion-wave`, expansion program support docs).
- [x] Confirm the current app implementation exposes 21 playable games in `supportedGames` and `game-workspace-registry`.
- [x] Choose the next reviewable slice as one low-risk unimplemented game that fits the current shared result and UI architecture.

## Section 2 - Current Slice: Spot Change
### Subsection 2.1 - Spec and planning alignment
- [x] Rewrite `/docs/spec/games/spot-change.md` so the user-visible behavior, result metrics, and touch-safe UI are explicit.
- [x] Keep this active plan focused on the current slice and append new implementation tasks only when they become concrete.

### Subsection 2.2 - App integration
- [x] Add `Spot Change` to the game catalog metadata and Home preview mapping.
- [x] Add the game registry entry, help content, and preview asset.
- [x] Implement the `Spot Change` session and workspace Hook under `app/lib/client/usecase/game-workspace/`.
- [x] Implement the `Spot Change` workspace Component and CSS under `app/components/games/spot-change/`.
- [x] Update the touched catalog and Home selector tests for the new game metadata.

### Subsection 2.3 - Verification and slice closeout
- [x] Run targeted automated verification for the touched catalog and gameplay modules.
- [x] Run Playwright UI verification for `/games/spot-change` and the Home card.
- [ ] Commit the `Spot Change` slice in one reviewable unit.

## Section 3 - Named Backlog
- [ ] `Spot Change` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Beat Match` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Block Tessellate` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Bounce Angle` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Box Fill` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Bubble Spawn` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Cascade Clear` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Cascade Flip` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Chain Trigger` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Color Census` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Flip Match` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Gap Rush` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Glow Cycle` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Hue Drift` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Icon Chain` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Intercept Ball` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Line Connect` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Merge Climb` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Obstacle Stream` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Phase Lock` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Position Lock` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Rotate Align` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Sequence Point` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Spinner Aim` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Sync Pulse` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Tap Safe` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Tempo Hold` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Tempo Weave` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Tile Instant` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
- [ ] `Zone Lock` - keep the game unchecked until implementation, automated verification, and Playwright UI verification are complete.
