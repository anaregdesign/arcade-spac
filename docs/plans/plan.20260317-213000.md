# Execution Plan

## Links

- Spec: [../spec/home-recommendation-ucb-ranking.md](../spec/home-recommendation-ucb-ranking.md)

## Section 1 - Introduce shared online-learning recommendation model
### Subsection 1.1 - Add bootstrap + incremental learning flow
- [x] Add a server-side shared recommendation model that bootstraps once from latest 1000 feedback logs
- [x] Add incremental learning update path that applies every newly recorded feedback event

### Subsection 1.2 - Switch home inference to learned state
- [x] Replace per-request feedback-log scan in home dashboard use case with inference from learned model state
- [x] Keep Thompson Sampling as default inference while retaining existing ranking contract

## Section 2 - Extend domain recommendation service helpers
### Subsection 2.1 - Add learning-state APIs
- [x] Add helper APIs to build/update recommendation learning state without rescanning all logs
- [x] Add unit tests for learning-state bootstrap and incremental update behavior

## Section 3 - Verify and close
### Subsection 3.1 - Validation and archive
- [x] Run typecheck and related unit tests
- [x] Mark plan complete and archive `/docs/plans/plan.md`
