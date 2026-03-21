# Execution Plan

## Links
- Spec: /docs/spec/specification.md
- Operations: /docs/production-operations.md

## Section 1 - Next Delivery Unit
- [x] Replace the single-profile favorite field with a dedicated per-user favorites relation and migrate existing favorite selections into it
- [x] Thread favorite state through Home, Game, Result, Profile, and local sign-in fixtures so the same persisted favorites render consistently across the app
- [x] Add route actions and shared UI for favorite toggles on Home cards, Game controls, and Result actions without leaving the current screen context
- [x] Add a Home favorites-only filter with preserved search/sort state and a filter-specific empty state reset path
- [x] Add a shared Restart control for live game workspaces that discards the current run and starts a fresh run in the same game and difficulty
- [x] Simplify Result primary actions to Replay, Share, and favorite; replace the Teams redirect with a share popup that previews game URL, title, and short description and supports clipboard copy
- [x] Replace the lower Result detail block with 3 recommendation-driven next-game cards using the existing recommendation ranking with deterministic fallback ordering
- [x] Update unit tests, type checks, and release-readiness validation after the feature work lands

## Section 2 - Captured Change Requests

### Home card status bubbles to favorites toggle

- [x] Remove `NEW` and `NO RECORD` bubbles from Home game cards
- [x] Remove the Home summary badges for `VISIBLE UNPLAYED` and `VISIBLE RANKED`
- [x] Add a per-user favorite toggle to Home, Game, and Result without displacing the primary task on each screen
- [x] Persist favorite state per signed-in user with a dedicated relation such as `UserFavorite`
- [x] Reflect persisted favorites in Profile so favorite games remain understandable across sessions
- [x] Keep favorite toggle placement compatible with existing Game and Result action clusters
- [x] Add a Home favorites-only filter so signed-in users can narrow the catalog to favorited games
- [x] Define the empty-state and reset behavior when the Home favorites-only filter returns no games

### In-game restart control

- [x] Add a shared `Restart` action to the in-game control area across playable game screens
- [x] Define restart semantics so the current run is discarded and a fresh run starts in the same game and selected difficulty
- [x] Reset per-run state such as board, timer, score, mistakes, or round progress without affecting saved historical results
- [x] Keep the restart control touch-safe and compatible with the existing `How to play` and status layout

### Result action simplification and share popup

- [x] Remove the Result-local Home and Rankings actions next to Replay so Replay and Share remain the primary actions
- [x] Rename the Result share action from `Share to Teams` to `Share`
- [x] Open a share popup that previews the target game URL, game title, and short description
- [x] Add a clipboard copy button inside the share popup to copy the prepared share text
- [x] Keep the simplified Result action row readable on narrow screens and compatible with the favorite toggle

### Result next-game recommendations

- [x] Remove the persistent run-detail block from the lower portion of the Result screen
- [x] Show 3 next-game recommendations in the Result lower area based on the existing recommendation policy
- [x] Define fallback behavior so the Result recommendation area still shows 3 games when personalized learning is shallow
- [x] Keep each recommended game directly actionable from the Result screen without displacing Replay, Share, or favorite controls