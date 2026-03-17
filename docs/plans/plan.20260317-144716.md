# Execution Plan

## Links

- Spec: [../spec/home-recommendation-ucb-ranking.md](../spec/home-recommendation-ucb-ranking.md)

## Section 1 - Align specification and migration strategy
### Subsection 1.1 - Capture the ID strategy update
- [x] Update the recommendation spec to require integer `Game.id` and UCB index usage
- [x] Define migration-safe schema updates for converting game foreign keys from string to int

## Section 2 - Convert schema and data boundaries to int game IDs
### Subsection 2.1 - Prisma schema and migration
- [x] Change `Game.id` and related foreign keys to `Int` in Prisma schema
- [x] Add a migration that preserves relational integrity while converting existing data
- [x] Regenerate Prisma client after schema changes

### Subsection 2.2 - Repository and fixture contracts
- [x] Update server repository contracts to use `number` game IDs
- [x] Update development fixtures and seed data to remove string-based game IDs
- [x] Verify gameplay, profile, ranking, and recommendation repository paths compile with new ID type

## Section 3 - Apply int IDs to UCB indexing
### Subsection 3.1 - Recommendation helper integration
- [x] Update UCB ranking helper usage so internal vectors/matrices index by integer game IDs
- [x] Keep home recommendation ordering behavior intact with numeric-indexed scoring
- [x] Ensure feedback logging and score reconstruction use int IDs end-to-end

## Section 4 - Validate and close
### Subsection 4.1 - Verification and archival
- [x] Run targeted tests and type checks for touched flows
- [x] Mark plan complete and archive `/docs/plans/plan.md`
