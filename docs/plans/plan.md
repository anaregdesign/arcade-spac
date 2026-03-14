# Execution Plan

## Links
- Spec: `/docs/spec/mobile-gameplay-ui-consistency-audit.md`

## Section 1 - Universal GameplayLayoutVariants adoption
- [x] Re-open the gameplay audit spec and classify every remaining workspace by top-level archetype, including `GameplayChoiceGrid`-only stage games that still lack a top-level layout variant.
- [x] Split `GameplayLayoutVariants` into one-Component-per-file modules under `app/components/gameplay/layouts/`.
- [x] Move `layout-shared.ts` out of `app/components/gameplay/layouts/` into a non-Component UI helper module.
- [x] Remove the `app/components/gameplay/GameplayLayoutVariants.ts` barrel re-export and move every consumer to direct layout module imports.
- [x] Extend the gameplay layout modules with archetype-specific wrappers for the missing top-level workspace patterns.
- [x] Reclassify the shared layouts around fixed `cue strip`, `board`, and `action dock` positions instead of only interaction family names.
- [x] Standardize shared button size and explanation placement so details move to `HowToPlay`.
- [x] Migrate the remaining `direct-board` workspaces onto the shared layout variants.
- [x] Migrate the remaining `tap-control` workspaces onto the shared layout variants.
- [x] Migrate the remaining `sequence-stage` workspaces, including the `GameplayChoiceGrid`-only stage games, onto top-level shared layout variants.
- [x] Verify that zero game workspaces remain outside top-level gameplay layout variants, then run typecheck and responsive Playwright checks.
- [x] Review desktop tall-board false positives with Playwright snapshots and confirm whether they are real layout regressions or metric noise.
- [x] Detect text overflow / obvious layout break outliers across the catalog and fix them in shared or game-specific CSS.
- [x] Audit `GameplayContextCue` presence, height, and empty-space consistency across all 50 games, then normalize missing or malformed cue strips.
- [x] Create reviewable commits for the shared variant expansion, barrel removal, workspace migrations, and plan archive.

### Subsection 1.1 - `board-core` adoption
- [x] Migrate `Bubble Spawn`
- [x] Migrate `Cascade Clear`
- [x] Migrate `Color Sweep`
- [x] Migrate `Hidden Find`
- [x] Migrate `Minesweeper`
- [x] Migrate `Number Chain`
- [x] Migrate `Orbit Tap`
- [x] Migrate `Pair Flip`
- [x] Migrate `Path Recall`
- [x] Migrate `Position Lock`
- [x] Migrate `Precision Drop`
- [x] Migrate `Rotate Align`
- [x] Migrate `Spinner Aim`
- [x] Migrate `Stack Sort`
- [x] Migrate `Sudoku`
- [x] Migrate `Symbol Hunt`
- [x] Migrate `Sync Pulse`
- [x] Migrate `Target Trail`
- [x] Migrate `Tap Safe`
- [x] Migrate `Tempo Hold`

### Subsection 1.2 - `board-dock` adoption
- [x] Migrate `Beat Match`
- [x] Migrate `Glow Cycle`
- [x] Migrate `Line Connect`
- [x] Migrate `Merge Climb`
- [x] Migrate `Phase Lock`
- [x] Migrate `Tempo Weave`

### Subsection 1.3 - `stage-choice` adoption
- [x] Migrate `Cascade Flip`
- [x] Migrate `Color Census`
- [x] Migrate `Hue Drift`
- [x] Migrate `Pattern Echo`
- [x] Migrate `Pulse Count`
- [x] Migrate `Quick Sum`
- [x] Migrate `Relative Pitch`
- [x] Migrate `Sequence Point`
- [x] Migrate `Shape Morph`
- [x] Migrate `Sum Grid`

### Subsection 1.4 - Cue strip normalization
- [x] Add shared `GameplayContextCue` audit hooks and compact baseline styling for catalog-wide Playwright checks.
- [x] Migrate the remaining cue-less workspaces: `Gap Rush`, `Light Grid`, `Mirror Match`, `Swap Solve`, and `Tile Shift`.
- [x] Run a full mobile and desktop Playwright pass for missing cue strips, oversized cue strips, and cue-to-board empty-space outliers, then fix the remaining regressions.

## Section 2 - Controls card density
- [x] Replace the shared controls chip row with a compact structured status summary that wastes less space on mobile.
- [x] Keep the controls card API backward-compatible for existing game workspaces while normalizing common status label/value parsing in shared code.
- [x] Verify the shared controls summary across representative games in mobile and desktop Playwright, then record the result in a reviewable commit.
- [x] Omit redundant idle state and placeholder status values from the shared controls summary so the card only shows play-relevant metadata.
- [x] Collapse the visible `Difficulty` label into a compact accessible field treatment and hide the summary row entirely when no status remains.
- [x] Re-run representative mobile and desktop Playwright checks after the extra controls-card compaction.
