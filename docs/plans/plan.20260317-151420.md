# Execution Plan

## Links

- Spec: [../spec/home-recommendation-ucb-ranking.md](../spec/home-recommendation-ucb-ranking.md)

## Section 1 - Clarify effective feedback signals
### Subsection 1.1 - Document behavior-level additions
- [x] Update the recommendation spec with share-click, shared-result-view, and replay-intent signals

## Section 2 - Implement new feedback capture points
### Subsection 2.1 - Domain event and reward updates
- [x] Extend recommendation feedback event definitions and reward mapping
- [x] Update contextual UCB unit tests for added events and contexts

### Subsection 2.2 - Route action integration
- [x] Record replay-intent feedback when replay is launched from the result screen
- [x] Record share-click feedback when Teams share is explicitly triggered from the result screen
- [x] Record shared-result-view feedback when a user opens a shared result link

## Section 3 - Verify and close
### Subsection 3.1 - Validation and archival
- [x] Run targeted unit tests and type checks
- [x] Mark plan complete and archive `/docs/plans/plan.md`
