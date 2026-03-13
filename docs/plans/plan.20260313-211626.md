# Execution Plan

## Links

- Spec: /docs/spec/repository-rename-and-integration-retargeting.md

## Section 1 - Confirm the canonical repository name

### Subsection 1.1 - Resolve the naming mismatch

- [x] Confirm the intended canonical repository name with the user
- [x] Record the confirmed target name in the spec and plan

## Section 2 - Audit repository-bound integrations

### Subsection 2.1 - Inventory affected references

- [x] Audit Git remote, docs, workflows, Azure deployment config, and package naming assumptions tied to the current repository slug
- [x] Separate workspace-editable changes from GitHub or Azure control-plane follow-up work

## Section 3 - Apply the rename-related fixes in order

### Subsection 3.1 - Update repository-local references

- [x] Update repository documentation and workflow references to the confirmed target name
- [x] Update any local git remote configuration that should track the renamed repository

### Subsection 3.2 - Document external follow-up

- [x] Record GitHub-side follow-up steps for repository rename, package continuity, and environment wiring
- [x] Record Azure-side follow-up steps for OIDC or deploy integration if the repository slug is part of external configuration

## Section 4 - Verify and close

### Subsection 4.1 - Finish cleanly

- [x] Verify the final repository-bound references in the workspace
- [x] Archive the completed plan under `/docs/plans/plan.YYYYMMDD-HHMMSS.md`