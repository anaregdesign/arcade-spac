# Execution Plan

## Links

- Spec: [../spec/home-thumbnail-framing-tuning.md](../spec/home-thumbnail-framing-tuning.md)

## Section 1 - Tighten thumbnail framing
### Subsection 1.1 - Capture the framing adjustment
- [x] Rewrite the spec so it covers denser thumbnail framing with less whitespace
- [x] Create the active execution tracker for this adjustment slice

## Section 2 - Reframe the generated assets
### Subsection 2.1 - Adjust the generator
- [x] Reduce the global scene whitespace in the generator instead of adding per-game CSS exceptions
- [x] Tighten framing inside the square without cropping or cutting off important content

### Subsection 2.2 - Rebuild and check the assets
- [x] Regenerate all 50 square preview assets with the tighter framing
- [x] Verify the denser framing still keeps each game readable and distinct

## Section 3 - Verify and close
### Subsection 3.1 - Automated and visual checks
- [x] Run the targeted checks for preview assets and metadata
- [x] Verify the Home grid visually at desktop and narrow mobile sizes after the framing change
- [x] Mark the plan complete and archive it with a timestamped filename
