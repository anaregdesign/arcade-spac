# Execution Plan

## Links
- Spec: /docs/spec/home-recommendation-ucb-ranking.md

## Section 1 - Recommendation Architecture Optimization

### Subsection 1.1 - Domain Hotspot Decomposition
- [x] Split recommendation domain logic into focused modules under `app/lib/domain/services/recommendation/`
- [x] Keep `app/lib/domain/services/contextual-recommendation.ts` as the stable public entry point with equivalent external API
- [x] Update recommendation unit tests for the extracted module boundaries

### Subsection 1.2 - Server Boundary And Lifetime Cleanup
- [x] Add a domain repository port for recommendation feedback logs and implement it in server infrastructure
- [x] Refactor shared recommendation model management into an explicit class with bootstrap and incremental-learning lifecycle
- [x] Refactor recommendation feedback recording into an injected usecase class while preserving best-effort behavior

### Subsection 1.3 - Verification
- [x] Run targeted unit tests for recommendation logic
- [x] Run typecheck
- [x] Confirm plan checkboxes and finalize summary
