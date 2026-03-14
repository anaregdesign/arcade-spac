# Execution Plan

## Links

- Spec: [../spec/home-thumbnail-framing-tuning.md](../spec/home-thumbnail-framing-tuning.md)

## Section 1 - Square home thumbnails for all 50 games
### Subsection 1.1 - Update the thumbnail contract
- [x] Rewrite the spec so the requirement covers square thumbnails across all 50 games
- [x] Track the implementation and verification steps in this active plan

### Subsection 1.2 - Normalize preview assets
- [x] Convert every non-square Home preview asset to a square thumbnail source
- [x] Keep existing square assets intact unless a minimal adjustment is required for the shared contract
- [x] Add regression coverage so non-square preview assets are caught automatically

### Subsection 1.3 - Verify and close
- [x] Run the relevant automated checks for thumbnail asset coverage
- [x] Verify the Home grid visually at desktop and narrow mobile sizes
- [x] Mark the plan complete and archive it with a timestamped filename
