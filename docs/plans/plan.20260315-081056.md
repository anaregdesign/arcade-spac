# Execution Plan

## Links

- Spec: [../spec/home-thumbnail-framing-tuning.md](../spec/home-thumbnail-framing-tuning.md)

## Section 1 - Refresh the thumbnail contract
### Subsection 1.1 - Capture the current requirement
- [x] Rewrite the spec so it covers simple square thumbnail regeneration for all 50 games
- [x] Create the active execution tracker for this delivery slice
- [x] Confirm the preview coverage gap and fold the missing Home mappings into this work

## Section 2 - Rebuild the preview assets
### Subsection 2.1 - Add a reproducible generation workflow
- [x] Add a script that can regenerate the 50 square preview assets from a shared visual system
- [x] Keep the generated artwork simple while preserving the core mechanic or board cue for each game

### Subsection 2.2 - Regenerate the 50 Home thumbnails
- [x] Rebuild every game preview asset as square artwork, including `Minesweeper` and `Sudoku`
- [x] Replace stale asset references so Home and gameplay metadata both point at the regenerated files
- [x] Fill the missing Home preview entries for `sum-grid`, `hidden-find`, `swap-solve`, and `shape-morph`

## Section 3 - Verify and close
### Subsection 3.1 - Regression coverage
- [x] Strengthen thumbnail verification so it catches missing files, missing game mappings, and non-square assets
- [x] Run the relevant unit tests for preview metadata and preview assets

### Subsection 3.2 - Visual confirmation and cleanup
- [x] Verify the Home grid visually at desktop and narrow mobile sizes
- [x] Mark the plan complete and archive it with a timestamped filename
