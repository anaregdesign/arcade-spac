# Execution Plan

## Links
- Spec: /docs/spec/product-requirements.md
- Flow: /docs/spec/screen-flow.md

## Section 1 - Gap assessment and release-oriented UI direction
### Subsection 1.1 - Confirm the highest-impact requirement gaps
- [x] Review the current home, game, result, rankings, and profile screens against the updated UI requirements
- [x] Update the shared UI direction so the work is sequenced toward a production-ready release candidate

## Section 2 - Build the first release candidate UI slices
### Subsection 2.1 - Shared shell and home
- [x] Refactor the shared header to add clear emoji-based categorization and reduce subtitle dependence
- [x] Compress the home dashboard so the first screen prioritizes next action, current standing, and lightweight recent context
- [x] Commit the shared shell and home slice as a coherent review unit

### Subsection 2.2 - Gameplay and result flow
- [x] Rework the game workspace so play-critical actions and state stay visible while secondary guidance collapses behind progressive disclosure
- [x] Rework the result screen so the top section surfaces the outcome, impact, and next actions without requiring extra reading
- [x] Commit the gameplay and result slice as a coherent review unit

### Subsection 2.3 - Rankings and profile
- [x] Simplify rankings filters and leaderboard presentation to foreground current position and hide less critical detail until needed
- [x] Simplify profile editing and performance review so the default view stays compact and the form or deeper detail appears only when needed
- [x] Commit the rankings and profile slice as a coherent review unit

## Section 3 - Release verification and production readiness
### Subsection 3.1 - Validate the release candidate locally
- [ ] Run targeted verification for the updated routes
- [x] Run the project quality gate needed for release confidence

### Subsection 3.2 - Validate production-facing readiness
- [x] Review the changed UI against the updated spec and confirm the first-screen, low-text, and progressive-disclosure goals are met
- [x] Simplify the unauthenticated login entry so hosted `/home` and `/profile` no longer depend on explanatory copy
- [x] Remove remaining over-explanatory subtitle and helper copy in the shared shell and home screen
- [x] Replace raw status wording and verbose guidance in gameplay and result flows with shorter, more natural UI language
- [x] Trim rankings and profile copy that still explains rather than shows, while preserving essential state cues
- [x] Prepare the remaining release actions or blockers for production rollout

#### Sub-subsection 3.2.1 - Remaining blocker
- [ ] Run authenticated rendered-browser checks for `/home`, `/games/:gameKey`, `/results/:resultId`, `/rankings`, and `/profile` once interactive browser tooling is available in chat

## Section 4 - Cleanup
### Subsection 4.1 - Close the tracked work
- [ ] Update the plan during execution and delete it once all tracked work is complete