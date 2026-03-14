# Execution Plan

## Links
- Spec: `/docs/spec/mobile-gameplay-ui-consistency-audit.md`

## Section 1 - Audit setup and catalog instrumentation
- [x] Confirm the 50-game route list, local sign-in path, and reusable Playwright audit flow for `start`, `major input`, and `live reaction`.
- [x] Define the actual-play finding schema for `operability`, `layout waste`, `overflow`, `oversize`, `rule cue mismatch`, and `desktop balance`.
- [x] Add newly discovered audit helper tasks here as they emerge instead of keeping them in working memory.

### Subsection 1.1 - Newly discovered execution tasks
- [x] Harden the Playwright audit script so `live reaction` uses DOM signature changes instead of visible text only.
- [x] Manually re-check script outliers with screenshots before treating them as real findings.
- [x] Replace archetype-level fixed widths with `clamp()`-based shared size tokens instead of raw `vw` or repeated `32rem` caps.
- [x] Shorten or skip long watch/reveal phases in memory-style games when they delay first input too much.
- [x] Remove dead-space-heavy idle sizing in stage-choice boards such as `Quick Sum`.
- [x] Fix the final post-sweep mobile outlier in `Zone Lock` without regressing the sidecar pattern.

## Section 2 - Actual play audit findings
- [x] Audit batch 1 (`Color Sweep` ... `Icon Chain`) on mobile and desktop, play each game, and record per-game findings.
- [x] Audit batch 2 (`Line Connect` ... `Spinner Aim`) on mobile and desktop, play each game, and record per-game findings.
- [x] Audit batch 3 (`Spot Change` ... `Shape Morph`) on mobile and desktop, play each game, and record per-game findings.
- [x] Consolidate the full 50-game finding list and split it into shared clusters vs game-specific outliers.

### Subsection 2.1 - Batch 1 findings
- [x] `Color Sweep`
  Finding: desktop board is too narrow for the available viewport and leaves excessive horizontal whitespace.
- [x] `Color Census`
  Finding: actual play succeeded; watch phase is slightly long but still within acceptable range.
- [x] `Beat Match`
  Finding: no actionable issue in actual play.
- [x] `Block Tessellate`
  Finding: no actionable issue in actual play.
- [x] `Bounce Angle`
  Finding: no actionable issue in actual play.
- [x] `Cascade Flip`
  Finding: no actionable issue in actual play.
- [x] `Gap Rush`
  Finding: actual play succeeded; no actionable layout issue after manual re-check.
- [x] `Bubble Spawn`
  Finding: desktop board becomes taller than necessary because the field stays narrower than the viewport allows.
- [x] `Box Fill`
  Finding: no actionable issue in actual play.
- [x] `Line Connect`
  Finding: desktop board becomes too tall and extends below the viewport because the board grid is width-capped too aggressively.
- [x] `Chain Trigger`
  Finding: no actionable issue in actual play.
- [x] `Icon Chain`
  Finding: clue/read phase delays first input unlock longer than desired on mobile.

### Subsection 2.2 - Batch 2 findings
- [x] `Merge Climb`
  Finding: desktop board/action area is taller than needed because the playable column remains too narrow.
- [x] `Relative Pitch`
  Finding: no actionable issue in actual play.
- [x] `Cascade Clear`
  Finding: manual re-check cleared the earlier script noise; no actionable issue.
- [x] `Minesweeper`
  Finding: desktop board looks undersized relative to viewport balance.
- [x] `Number Chain`
  Finding: desktop board looks undersized relative to viewport balance.
- [x] `Pair Flip`
  Finding: no actionable issue in actual play.
- [x] `Sudoku`
  Finding: desktop board looks undersized relative to viewport balance.
- [x] `Pattern Echo`
  Finding: watch phase keeps input locked too long and creates noticeable start friction on mobile.
- [x] `Sequence Point`
  Finding: desktop board stays narrower than needed; watch phase is also slower than ideal.
- [x] `Precision Drop`
  Finding: manual play reached results successfully; earlier reaction miss was a script false positive.
- [x] `Spinner Aim`
  Finding: no actionable issue in actual play.
- [x] `Phase Lock`
  Finding: no actionable issue in actual play.
- [x] `Sync Pulse`
  Finding: no actionable issue in actual play.
- [x] `Glow Cycle`
  Finding: no actionable issue in actual play after prior density work.
- [x] `Tempo Hold`
  Finding: no actionable issue in actual play.
- [x] `Tempo Weave`
  Finding: no actionable issue in actual play.

### Subsection 2.3 - Batch 3 findings
- [x] `Orbit Tap`
  Finding: overflow flag was a visual-glow false positive; no actionable issue after manual re-check.
- [x] `Target Trail`
  Finding: no actionable issue in actual play.
- [x] `Path Recall`
  Finding: no actionable issue in actual play.
- [x] `Position Lock`
  Finding: watch phase delays first placement unlock too long on mobile.
- [x] `Pulse Count`
  Finding: manual re-check cleared the earlier false negative; no actionable issue.
- [x] `Quick Sum`
  Finding: idle board leaves obvious dead space on mobile before start.
- [x] `Sum Grid`
  Finding: no actionable issue in actual play.
- [x] `Symbol Hunt`
  Finding: desktop board becomes taller than needed because the play area stays too narrow.
- [x] `Hidden Find`
  Finding: no actionable issue in actual play.
- [x] `Hue Drift`
  Finding: no actionable issue in actual play.
- [x] `Spot Change`
  Finding: no actionable issue in actual play.
- [x] `Tap Safe`
  Finding: desktop board becomes taller than needed because the play area stays too narrow.
- [x] `Light Grid`
  Finding: no actionable issue in actual play.
- [x] `Flip Match`
  Finding: no actionable issue in actual play.
- [x] `Rotate Align`
  Finding: no actionable issue in actual play.
- [x] `Tile Shift`
  Finding: manual re-check cleared the earlier false negative; no actionable issue.
- [x] `Swap Solve`
  Finding: no actionable issue in actual play.
- [x] `Tile Instant`
  Finding: no actionable issue in actual play.
- [x] `Zone Lock`
  Finding: no actionable issue in actual play.
- [x] `Stack Sort`
  Finding: no actionable issue in actual play.
- [x] `Mirror Match`
  Finding: no actionable issue in actual play.
- [x] `Shape Morph`
  Finding: no actionable issue in actual play.

### Subsection 2.4 - Consolidated findings
- [x] Shared cluster `desktop narrow/tall board`
  Games: `Color Sweep`, `Bubble Spawn`, `Line Connect`, `Merge Climb`, `Minesweeper`, `Number Chain`, `Sudoku`, `Sequence Point`, `Symbol Hunt`, `Tap Safe`.
- [x] Shared cluster `slow reveal/input unlock`
  Games: `Icon Chain`, `Pattern Echo`, `Position Lock`, `Sequence Point`, `Color Census`.
- [x] Game-specific outlier `dead space before start`
  Games: `Quick Sum`.
- [x] False-positive bucket verified manually
  Games: `Cascade Clear`, `Orbit Tap`, `Pulse Count`, `Precision Drop`, `Tile Shift`.

## Section 3 - Shared classification and sizing strategy
- [x] Classify the findings by interaction structure: `board-only`, `board-dock`, `choice-dock`, `twin-panel`, and `sidecar`.
- [x] Define shared size tokens for board width, dock size, sidecar width, and choice density using `clamp()` + custom properties instead of raw viewport-width scaling.
- [x] Decide whether any new dependency adds real leverage; if not, keep the solution in existing CSS/layout primitives.

### Subsection 3.1 - Shared fix targets
- [x] `board-only` width caps: remove repeated `560px` / `540px` / `32rem` desktop bottlenecks and replace them with shared `clamp()` tokens.
- [x] `board-dock` width caps: widen the playable column enough to keep desktop height under control without breaking mobile dock placement.
- [x] `choice-dock` density: reduce idle min-height and keep prompt/answers vertically compact.
- [x] `memory/reveal` operability: shorten watch timing or add consistent skip behavior where first input waits too long.

## Section 4 - Fix implementation
- [x] Apply the shared layout/sizing fixes for the finding clusters that can be solved in `app/components/gameplay/layouts/` or shared workspace primitives.
- [x] Apply targeted game-specific fixes for the remaining outliers and keep newly discovered tasks listed here.
- [x] Create reviewable commits for shared fixes and game-specific fix batches.

## Section 5 - Re-audit and closeout
- [x] Re-run actual-play verification for every touched game on mobile and desktop after the fixes.
- [x] Re-run a full 50-game mobile and desktop Playwright sweep for overflow, whitespace, and control placement regressions.
- [x] Run `npm run typecheck`.
- [x] Archive this plan once all findings are resolved and verified.

### Subsection 5.1 - Verification notes
- [x] Touched mobile actual-play rerun
  Result: `Pattern Echo 2103ms`, `Sequence Point 1245ms`, `Icon Chain 1249ms`, `Position Lock 1609ms`, `Color Census 1120ms` unlock timings after tuning; `Quick Sum` board bottom `438`, `Color Sweep` board width `336`, `Number Chain` board width `336`.
- [x] Touched desktop balance rerun
  Result: `Color Sweep 640px`, `Number Chain 624px`, `Pattern Echo 592px`, `Sequence Point 560px`, `Minesweeper 564px`, `Bubble Spawn / Line Connect / Merge Climb / Symbol Hunt / Tap Safe` all remained within `1100px` viewport height.
- [x] Full catalog live-state sweep
  Result: `390x844` and `1440x1100` both ended with `0` overflow / board-bottom / controls-height outliers after the final `Zone Lock` mobile density pass.
