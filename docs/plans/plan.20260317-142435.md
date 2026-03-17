# Execution Plan

## Links

- Spec: [../spec/home-recommendation-ucb-ranking.md](../spec/home-recommendation-ucb-ranking.md)

## Section 1 - Design shared recommendation helper
### Subsection 1.1 - Define generic domain helper contract
- [x] Add a domain service helper for contextual UCB scoring and recommendation ranking
- [x] Add domain-level helpers for mapping feedback events to reward/sentiment values
- [x] Add focused unit tests for helper behavior and edge cases

## Section 2 - Persist and ingest feedback logs
### Subsection 2.1 - Add persistence model and repository access
- [x] Extend Prisma schema and migration with `UserFeedbackLog` and `loggedAt` descending query support
- [x] Add repository helpers to append feedback logs and fetch latest 1000 logs
- [x] Keep development fixture behavior compatible with the new repository contract

### Subsection 2.2 - Emit feedback events from existing flows
- [x] Record positive feedback when completed result and share-link generation occur
- [x] Record positive feedback when the owner opens the result screen
- [x] Record negative feedback when a run is abandoned

## Section 3 - Apply recommendation helper to home ranking
### Subsection 3.1 - Replace current recommended sort logic
- [x] Build home recommendation scores from latest feedback logs via shared helper
- [x] Return recommendation score metadata with home games and use it in `recommended` sorting
- [x] Preserve existing fallback ordering for sparse-feedback scenarios

## Section 4 - Verify and close
### Subsection 4.1 - Validation and archival
- [x] Run targeted tests/type checks for touched modules
- [x] Mark plan complete and archive `/docs/plans/plan.md`
