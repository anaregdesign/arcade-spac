# Execution Plan

## Goal

Stabilize failing GitHub Actions by fixing locally reproducible quality-gate failures first, then inspecting workflow-specific failures that still remain.

## Work Items

1. Fix locally reproducible CI failures in the same order as `quality-gates.yml`.
2. Re-run build, tests, and any relevant validation to confirm the repo is green locally.
3. Inspect recent failing GitHub Actions runs and patch workflow logic only where failures remain after local checks are green.
4. Archive this plan once the investigation and fixes are complete.