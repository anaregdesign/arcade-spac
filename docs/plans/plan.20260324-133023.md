# Execution Plan

## References

- [docs/spec/feature-specs.md](/Users/hiroki/arcade-spec/docs/spec/feature-specs.md)

## Section 1: Locale Selector Refinement

- [x] Update the shared locale selector markup and copy so it reads as a natural inline control in the shell
- [x] Verify the locale selector presentation in the browser on the touched routes

## Section 2: Release Rollout Reliability

- [x] Update the release workflow so production rollout always deploys the published non-prerelease app image while infra and database jobs remain diff-gated
- [x] Add a release-branch guard so production rollout only accepts release tags whose commit is contained in `main`
- [x] Validate the touched workflow and app changes locally, then commit, push, and publish a new release from the updated main state