# Execution Plan

## Links
- Spec: `/docs/spec/mobile-gameplay-ui-consistency-audit.md`

## Section 1 - Remaining shared gameplay normalization
- [x] Inspect the remaining workspaces that still rely on one-off board scaffolding instead of shared cues or layout variants.
- [x] Group the remaining workspaces into reviewable normalization slices by archetype.
- [x] Normalize the `direct-board / tap-control` remainder onto `GameplayContextCue` and reduced-copy board scaffolding.
- [x] Normalize the remaining `answer-grid / sequence-stage` remainder onto shared gameplay primitives where the archetype matches.
- [x] Re-run mobile and desktop verification for every touched follow-up workspace.
- [x] Create reviewable commits for each normalization slice.

### Subsection 1.1 - First follow-up slice
- [x] Audit and normalize `Color Sweep`
- [x] Audit and normalize `Minesweeper`
- [x] Audit and normalize `Merge Climb`
- [x] Audit and normalize `Precision Drop`
- [x] Audit and normalize `Sum Grid`
- [x] Audit and normalize `Cascade Clear`

### Subsection 1.2 - Second follow-up slice
- [x] Audit and normalize `Hidden Find`
- [x] Audit and normalize `Number Chain`
- [x] Audit and normalize `Orbit Tap`
- [x] Audit and normalize `Pair Flip`
- [x] Audit and normalize `Path Recall`
- [x] Audit and normalize `Stack Sort`
- [x] Audit and normalize `Sudoku`
- [x] Audit and normalize `Symbol Hunt`
- [x] Audit and normalize `Target Trail`
- [x] Verify that all 50 gameplay workspaces now use shared cue or layout primitives.
