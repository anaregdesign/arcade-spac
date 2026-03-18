# Execution Plan

## Links
- Spec: /docs/spec/front-door-edge-delivery.md

## Section 1 - Front Door edge cutover
### Subsection 1.1 - Spec and delivery contract
- [x] Write the Front Door edge delivery spec and start the active execution plan
- [x] Review the current Azure IaC, workflow, and verification scripts for the Container App public-host assumptions that must change

### Subsection 1.2 - Azure infrastructure updates
- [x] Add Azure Front Door Premium resources and outputs to `infra/main.bicep`
- [x] Update the Container Apps managed environment network contract for Front Door private connectivity
- [x] Keep the infrastructure deployment path compatible with the existing GitHub release workflow

### Subsection 1.3 - Release and verification updates
- [x] Switch workflow discovery and smoke testing to the Front Door endpoint host
- [x] Extend runtime verification to assert Front Door connectivity and managed environment exposure
- [x] Validate any helper scripts that still assume direct Container App public access

### Subsection 1.4 - Operational documentation
- [x] Update Azure prerequisites for Front Door resources, `PUBLIC_APP_URL`, and auth follow-up
- [x] Update production operations for Front Door-based smoke checks, rollback context, and one-time approval notes

### Subsection 1.5 - Validation and closeout
- [x] Run repository validation for the changed IaC, workflow, and scripts
- [x] Mark the plan complete and archive it when no tracked work remains
