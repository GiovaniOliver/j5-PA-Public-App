# Phased Roadmap

## Phase 0 — Product and safety baseline

Deliverables:

- approved product definition;
- approved universal domains, life modules, and compartments model;
- approved declarative dashboard contract, component catalog boundary, and publication policy;
- approved second-brain wiki, federated memory, knowledge graph, provenance, and retrieval model;
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

## Phase 2 — J5 core, design system, and Command Center

Deliverables:

- canonical request contract;
- J5 deterministic router;
- provider gateway;
- conversation sessions and streaming;
- product-owned design tokens and accessible component foundations;
- initial component, data-binding, action, and design-recipe registries;
- Command Center shell;
- tasks, plans, calendar, notes, and approvals;
- action receipts and diagnostics.

## Phase 3 — Compartments, second-brain wiki, and memory

Deliverables:

- Soul, Purpose, Workflow, Knowledge, Collaboration, and Reflect compartments;
- wiki spaces, pages, blocks, links, backlinks, revisions, and source citations;
- source, entity, claim, relation, provenance, ontology, and graph-proposal contracts;
- life-profile records used by onboarding and module suggestions;
- memory policy controls;
- hot, warm, and cold memory lifecycle;
- permission-filtered lexical and vector retrieval;
- bounded graph traversal and cited retrieval receipts;
- memory and knowledge correction, export, and deletion;
- Self-Reflecting and graph proposals that require user acceptance when policy demands it.

IoT Matrix can be modeled in this phase but activated later. A native graph-database projection is optional and should follow measured retrieval requirements rather than precede the core model.

## Phase 4 — Life modules, workflows, and generative dashboards

Deliverables:

- stable J1-J4 universal domain contracts;
- life-module schema, manifest, SDK, installation, renaming, and cross-domain linking;
- starter life modules;
- versioned ontology extensions, wiki templates, and knowledge views;
- dashboard planning service and versioned declarative specification;
- 4-6 curated design recipes;
- draft, preview, publish, revise, compare, rollback, archive, and navigation assignment;
- responsive web renderer with loading, empty, stale, error, and offline states;
- dashboard schema, authorization, accessibility, readiness, and visual-regression tests;
- capability registry, workflow manifests, and direct/deterministic/queued/LangGraph execution modes;
- scheduler, retries, cancellation, idempotency, and approvals;
- domain- and module-specific Command Center projections.

## Phase 5 — Connectors, entitlements, and release controls

Deliverables:

- connector installation, scopes, revocation, and health;
- selective, consent-based connector ingestion into the Knowledge Matrix;
- connector-backed view models registered through the data-binding registry;
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
- dashboard surface assignments and constrained projections;
- IoT Matrix activation;
- device capability and safety policies;
- offline and degraded-mode decisions documented per capability;
- A2UI or AG-UI interoperability decision based on actual integration requirements.

## Release gates

A sellable release requires:

- no known cross-tenant access path;
- verified export and deletion, including chunks, embeddings, graph projections, module settings, and dashboard revisions;
- verified connector revocation;
- source provenance and correction controls for accepted knowledge;
- validated dashboard specs with no arbitrary runtime code;
- tested action policies for every interactive widget;
- responsive, accessibility, and visual-regression verification for supported design recipes;
- tested approval and audit behavior for every write capability;
- accurate feature-status reporting and no fabricated dashboard metrics;
- usage limits and provider-cost controls;
- incident response, backups, and recovery tests;
- privacy policy, terms, data processing documentation, and support process;
- security review of the repository and Git history.
