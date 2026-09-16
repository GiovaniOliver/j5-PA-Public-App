# Clean-Room Extraction Plan

## Goal

Transfer reusable J5 design and implementation patterns without transferring private state, personal assumptions, unsafe fallbacks, obsolete code, or undocumented third-party obligations.

## Extraction rule

Nothing is copied by directory. Every component is selected by capability, reviewed, generalized, tested, and then reimplemented or ported into a public package.

## Process

### 1. Freeze the reference point

Record the exact private source commit used for each review. The initial planning baseline is `7345ff4b142fbbd9cf8511c3ea8c3c08bec53e60`.

### 2. Define public contracts first

Create tenant-aware contracts for identity, workspaces, domains, compartments, memory, capabilities, workflows, policies, audits, providers, and entitlements.

### 3. Build synthetic fixtures

Use generated accounts, workspaces, projects, devices, contacts, and documents. Never sanitize a real private database into a seed file.

### 4. Inventory candidate components

For each candidate, record:

- source path and source commit;
- purpose and dependencies;
- personal assumptions;
- tenant and authorization assumptions;
- provider coupling;
- data classes touched;
- license or attribution requirements;
- test coverage and runtime status;
- decision: port, refactor, replace, defer, or exclude.

### 5. Extract in vertical slices

Recommended order:

1. identity and workspace boundary;
2. policy, audit, and approval primitives;
3. contracts and capability registry;
4. canonical J5 router with one safe direct skill;
5. compartment service and memory controls;
6. tasks, plans, calendar, notes, and knowledge;
7. configurable domains;
8. connectors and workflows;
9. entitlements, metering, and billing;
10. voice, mobile, and devices.

### 6. Verify each slice

A slice is not accepted until it has:

- tenant-isolation tests;
- authorization tests;
- idempotency and retry tests for writes;
- audit receipt tests;
- deletion and export behavior;
- cost and quota enforcement;
- user-facing capability status;
- no secret, PII, local path, or private endpoint findings.

## Prohibited shortcuts

- no repository fork followed by deleting obvious personal folders;
- no copying `.env` files, session folders, temporary artifacts, databases, or uploads;
- no `local-user`, default-admin, or shared API-key production fallbacks;
- no copying private seed records and renaming people;
- no hard-coded founder domain meanings in core routing;
- no enabling financial, messaging, publishing, or device writes before the approval engine exists;
- no marketing claim that a planned or simulated capability is live.

## Source repository policy

The private repository remains the owner's evolving system. Public extraction should not require freezing or redesigning it. Shared improvements should flow through deliberately maintained packages or patches, not direct repository synchronization.
