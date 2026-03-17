# Execution Plan

## Links

- Spec: [../spec/home-recommendation-ucb-ranking.md](../spec/home-recommendation-ucb-ranking.md)

## Section 1 - Extend negative feedback signals
### Subsection 1.1 - Spec and event definition updates
- [x] Update spec to include failed runs and quick abandon signals as negative context
- [x] Add `RUN_FAILED` and `RUN_QUICK_ABANDONED` to recommendation feedback event definitions
- [x] Define reward/context mapping for the new negative events

## Section 2 - Capture new events in gameplay flows
### Subsection 2.1 - Failed run logging
- [x] Record recommendation feedback when gameplay result finalizes as `FAILED`

### Subsection 2.2 - Quick abandon logging
- [x] Extend abandon flow input to optionally accept elapsed seconds
- [x] Log `RUN_QUICK_ABANDONED` when abandon happens within the threshold, otherwise log `RUN_ABANDONED`

## Section 3 - Verification and closure
### Subsection 3.1 - Validation and archive
- [x] Update unit tests for reward/context behavior
- [x] Run unit tests and typecheck
- [x] Mark plan complete and archive `/docs/plans/plan.md`
