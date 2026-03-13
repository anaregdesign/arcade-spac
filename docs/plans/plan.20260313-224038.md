# Execution Plan

## Links
- Spec: /docs/spec/production-game-catalog-synchronization.md

## Section 1 - Restore the full production game lineup
- [x] Capture the production catalog drift issue in a dedicated spec and replace the broken active plan with a current tracker
- [x] Move persisted game metadata to a single canonical source that seed and runtime code can share
- [x] Add repository-level catalog reconciliation so missing production game rows are created automatically before reads
- [x] Wire Home, Profile, Rankings, and gameplay data paths through the reconciled catalog access path
- [x] Verify the change with typecheck and targeted build-time validation