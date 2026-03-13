# Execution Plan

## Links
- Spec: /docs/spec/product-requirements.md
- Flow: /docs/spec/screen-flow.md

## Section 1 - Re-check the current local UI against the spec
### Subsection 1.1 - Capture the current gap set
- [x] Re-read the requirements and screen-flow documents after the latest local UI changes
- [x] Review the local `/home`, `/games/:gameKey`, `/results/:resultId`, `/rankings`, and `/profile` screens in the browser
- [x] Convert the remaining spec mismatches into implementation tasks grouped by screen and user flow

## Section 2 - Close the remaining spec gaps in the local UI
### Subsection 2.1 - Home onboarding and reusable help
- [x] Replace the current inline quick-start card with a true first-use help surface on home, using an overlay, drawer, or modal that can be dismissed and reopened later
- [x] Expand the onboarding/help content so it explicitly explains game selection, total points, ranking interpretation, and the cross-game scoring model in short user-facing language
- [x] Add a persistent home-level help entry point so the first-use guidance and scoring explanation remain reachable after dismissal

### Subsection 2.2 - Result screen impact summary and sharing
- [x] Add self-best state to the result summary, including a personal-best badge and the difference from the previous best when applicable
- [x] Rework the result KPI area to match the spec's common layout: current result metrics, game rank movement or ranking exclusion reason, total points delta, and overall rank delta
- [x] Update the result action ordering and Teams share payload so sharing includes the required result context without exposing raw internal identifiers
- [x] Make pending-save and ranking-excluded states explicitly describe what is provisional, what is excluded, and what the user should do next

### Subsection 2.3 - Rankings clarity and rivalry context
- [ ] Show leader-gap and nearest-rival deltas inside the ranking list or adjacent row detail so users can compare themselves with nearby positions without relying only on the top summary cards
- [ ] Keep the current user context visible when switching overall versus game boards and season versus lifetime, including a clearer focus treatment for the user's row and nearby rivals
- [ ] Add a concise explanation of displayed names and visibility behavior so the ranking surface communicates the current public-name rules

### Subsection 2.4 - Profile score breakdown and visibility understanding
- [ ] Add a total-points breakdown view on profile so the user can see how each game's best contributes to the overall score
- [ ] Clarify the public display-name and visibility rules on profile, including what appears in rankings and Teams shares
- [ ] Strengthen the growth section so recent trend data is paired with a plain-language explanation of what to improve next

## Section 3 - Verify the revised local UI
### Subsection 3.1 - Browser and quality checks
- [ ] Re-run local browser verification for `/home`, `/games/:gameKey`, `/results/:resultId`, `/rankings`, and `/profile` after the new UI tasks are implemented
- [ ] Re-run the project quality gate after the follow-up implementation is complete

## Section 4 - Cleanup
### Subsection 4.1 - Remove the temporary execution tracker
- [ ] Delete this plan again after all follow-up UI tasks are complete