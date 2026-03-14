# Agent Skill Bootstrap Execution Plan

## Section 1 Restore Local Skills

- [x] Verify canonical source mappings and any required sibling-link adjustments for the vendored skill names.
- [x] Restore `.github/skills/enforce-react-spa-architecture/` from the canonical React SPA architecture source.
- [x] Restore `.github/skills/azure-spa-clean-architecture-bootstrap/` from the canonical Azure SPA extension source.
- [x] Restore `.github/skills/spec-driven-workflow/` from the canonical planning source.

## Section 2 Restore Repository Instructions

- [x] Recreate `.github/copilot-instructions.md` with the required skill roles, invocation order, and spec workflow expectations.
- [x] Validate the final `.github/skills/` inventory against the canonical source directories.

## Section 3 Close Out

- [x] Archive this completed plan as `docs/plans/plan.20260314-111803.md`.

## Outcome

- Restored the three vendored local skill trees under `.github/skills/` from the canonical `anaregdesign/hiroki` source directories, in the requested install order.
- Rebound the vendored skill metadata and local relative links to the repository-local skill names so the two SPA skills and the planning skill resolve correctly from `.github/skills/`.
- Recreated `.github/copilot-instructions.md` with the required skill roles, invocation order, and spec-first workflow guidance.