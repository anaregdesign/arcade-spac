# Production Game Catalog Synchronization

## Summary

Production must always show the full phase 1 game lineup on Home, Profile, Rankings, and direct game routes even when the hosted database was created before later games were added.

## User Problem

- Production currently shows only two games when the hosted database still contains the original catalog rows.
- Users cannot discover, open, or select the newer games even though the app code and specs define a six-game phase 1 lineup.
- Operations currently depend on seed timing or manual catalog repair, which makes hosted behavior drift from the shipped product.

## Users and Scenarios

- A signed-in player opens Home in production and expects to see the full phase 1 lineup.
- A player opens Profile and expects every shipped game to appear in favorite-game selection and per-game performance sections.
- A player or shared link opens a direct game route for a shipped title and expects the route to work even if the database started from an older catalog snapshot.
- An operator deploys a newer app version and expects the hosted runtime to reconcile missing catalog rows without a separate manual seed step.

## Scope

- Ensure the canonical persisted game catalog for phase 1 is defined in one code-owned source.
- Ensure production-backed repository reads can reconcile missing game rows before they are needed by Home, Profile, Rankings, and gameplay flows.
- Keep local fixture data and seed data aligned with the same canonical game metadata.

## Non-Goals

- Reworking score aggregation or ranking formulas.
- Backfilling historical play results for games that were never played.
- Changing the visible six-game phase 1 lineup itself.

## User-Visible Behavior

- Production Home shows all six shipped phase 1 games instead of only the older two rows.
- Profile uses the full shipped lineup for favorite-game selection and per-game sections even for older tenants.
- Rankings and direct game routes resolve every shipped game from the same canonical catalog.
- A hosted deployment no longer requires a manual seed run just to make newly shipped games visible.

## Acceptance Criteria

- Production-backed Home returns the full six-game lineup when the database is missing newer catalog rows.
- Production-backed Profile and Rankings return the same full lineup without requiring fixture fallback.
- Direct route lookup for a shipped game succeeds after repository-level catalog reconciliation.
- Seed data and runtime catalog reconciliation use the same game metadata source so shipped names and descriptions do not drift.

## Edge Cases

- Existing users with no per-game summary rows for newly reconciled games still see those games with zeroed summary values instead of missing cards.
- Reconciliation is safe to run repeatedly and does not create duplicate game rows.
- Local development fixture fallback still behaves as before when the database is unavailable.

## Constraints and Dependencies

- The canonical phase 1 lineup remains `Minesweeper`, `Sudoku`, `Drop Ball`, `Color Sweep`, `Number Chain`, and `Pair Flip`.
- Prisma access stays inside server infrastructure.
- This work is tracked in `/docs/plans/plan.md` while active.

## Links

- Related: [product-requirements.md](./product-requirements.md)
- Related: [game-catalog-expansion.md](./game-catalog-expansion.md)
- Plan: [/docs/plans/plan.md](../plans/plan.md)