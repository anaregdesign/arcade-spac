# Execution Plan

## References

- [docs/spec/feature-specs.md](/Users/hiroki/arcade-spec/docs/spec/feature-specs.md)
- [docs/spec/ui-specs.md](/Users/hiroki/arcade-spec/docs/spec/ui-specs.md)

## Section 1: Shared study layout

- [x] Extract source attribution into a shared gameplay component that both study and quiz layouts can use.
- [x] Add a shared study gameplay layout with Markdown body, page progress, navigation actions, and source attribution.

## Section 2: MCP primer game

- [x] Create static MCP study pages and about 20 quiz questions based on the public MCP docs.
- [x] Implement the client workspace flow for study pages, quiz pages, scoring, timer failure, and result submission.
- [x] Add the MCP game workspace UI and register it in the game catalog, registry, and preview metadata.

## Section 3: Verification and polish

- [x] Add targeted tests for shared layouts and MCP game content/runtime wiring.
- [x] Play the MCP game in the browser and correct any unnatural layout, spacing, or action placement issues found during the run.
- [x] Run targeted tests and typecheck, then archive the completed plan.

## Notes

- Browser verification covered the lesson preview, study-page navigation, quiz answer review states, and a full 20-question clear into the result screen.
- The main layout polish changes were removing the duplicate idle overlay, making the preview state explicit in the controls card, and hiding the finish card until the run actually ends.