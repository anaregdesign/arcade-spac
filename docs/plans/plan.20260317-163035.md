# Execution Plan

## Links

- Spec: [../spec/home-recommendation-ucb-ranking.md](../spec/home-recommendation-ucb-ranking.md)

## Section 1 - Add Thompson Sampling recommendation inference
### Subsection 1.1 - Domain service expansion
- [x] Add contextual Thompson Sampling inference to recommendation domain service
- [x] Keep existing contextual UCB inference available for comparison compatibility
- [x] Define deterministic testable random sampling hook for Thompson inference

### Subsection 1.2 - Home recommendation default switch
- [x] Switch home recommendation ranking to Thompson inference as default
- [x] Keep recommendation score mapping contract unchanged for UI sorting

## Section 2 - Verification and closure
### Subsection 2.1 - Test and archive
- [x] Add and update unit tests for Thompson ranking behavior and reward/context mappings
- [x] Run typecheck and unit tests
- [x] Mark plan complete and archive `/docs/plans/plan.md`
