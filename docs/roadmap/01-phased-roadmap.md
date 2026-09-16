# Phased Roadmap

## Phase 0 — Product and safety baseline

Deliverables:

- approved product definition;
- approved domains and compartments model;
- source-component inventory template;
- threat model and data-classification policy;
- third-party and license inventory;
- architecture decision records for hosted versus self-hosted deployment.

Exit criteria: no application code extraction begins until the ownership model and isolation contracts are approved.

## Phase 1 — Account and workspace foundation

Deliverables:

- monorepo scaffold and CI;
- account, session, MFA, recovery, and device management;
- tenant, workspace, membership, and role models;
- audit, consent, export, and deletion primitives;
- synthetic test fixtures;
- isolation test harness.

## Phase 2 — J5 core and Command Center

Deliverables:

- canonical request contract;
- J5 deterministic router;
- provider gateway;
- conversation sessions and streaming;
- Command Center shell;
- tasks, plans, calendar, notes, and approvals;
- action receipts and diagnostics.

## Phase 3 — Compartments and memory

Deliverables:

- Soul, Purpose, Workflow, Knowledge, Collaboration, and Reflect compartments;
- memory policy controls;
- hot, warm, and cold memory lifecycle;
- cited retrieval with permission filtering;
- memory correction, export, and deletion;
- Self-Reflecting proposals that require user acceptance.

IoT Matrix can be modeled in this phase but activated later.

## Phase 4 — Configurable domains and workflows

Deliverables:

- domain-pack schema and SDK;
- J1-J4 slot assignment and renaming;
- starter domain packs;
- capability registry and workflow engine;
- scheduler, retries, cancellation, idempotency, and approvals;
- domain-specific Command Center projections.

## Phase 5 — Connectors, entitlements, and release controls

Deliverables:

- connector installation, scopes, revocation, and health;
- encrypted provider credentials;
- subscription, sponsored access, trials, quotas, and metering;
- plan-aware model and tool budgets;
- support console with audited access;
- public onboarding and user documentation.

## Phase 6 — Mobile, voice, and devices

Deliverables:

- mobile client;
- voice session adapter;
- Apple Watch and smart-display surfaces;
- IoT Matrix activation;
- device capability and safety policies;
- offline and degraded-mode decisions documented per capability.

## Release gates

A sellable release requires:

- no known cross-tenant access path;
- verified export and deletion;
- verified connector revocation;
- tested approval and audit behavior for every write capability;
- accurate feature-status reporting;
- usage limits and provider-cost controls;
- incident response, backups, and recovery tests;
- privacy policy, terms, data processing documentation, and support process;
- accessibility and mobile-responsive verification;
- security review of the repository and Git history.
