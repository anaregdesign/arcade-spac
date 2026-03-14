# Execution Plan

## Links
- Spec: `/docs/spec/operations-specs.md#azure-private-sql-and-entra-hardening`

## Section 1 - Capture the hardened Azure contract
- [x] Add the hardening spec for Azure private SQL connectivity and Entra runtime expectations.
- [x] Keep this execution plan updated while implementation proceeds.

## Section 2 - Replace the infrastructure contract
### Subsection 2.1 - Private networking and identity in IaC
- [x] Update `infra/main.bicep` to add the VNet, delegated Container Apps subnet, and private-endpoint subnet.
- [x] Replace Azure SQL public connectivity with `Private Endpoint`, private DNS, and disabled public access.
- [x] Update hosted App Configuration and Key Vault to use the private endpoint contract and explicit Container App HTTP probes.

### Subsection 2.2 - Runtime verification contract
- [x] Update the Azure verification scripts to validate the private-network contract instead of public firewall rules.

## Section 3 - Align repository guidance
### Subsection 3.1 - Docs and runbooks
- [x] Update README, Azure prerequisite guidance, and production data-path documentation for the new private networking and Entra contract.
- [x] Update production operations guidance so recovery and smoke procedures no longer instruct operators to restore SQL public access.

## Section 4 - Validate and close
### Subsection 4.1 - Local validation
- [x] Validate the Bicep file and run the relevant local checks for touched code and scripts.

### Subsection 4.2 - Plan cleanup
- [x] Archive `/docs/plans/plan.md` after all tracked work is complete.
