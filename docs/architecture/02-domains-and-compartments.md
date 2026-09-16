# Domains and Compartments

## Why they are separate

A domain organizes work. A compartment organizes context and governance.

For example, a travel request may run in a Lifestyle domain while reading purpose constraints, calendar knowledge, collaboration contacts, and an approved travel connector. The user should not have to duplicate those facts inside every domain.

## Stable system agents

| Identifier | Responsibility | User visibility |
|---|---|---|
| J0 | Platform administration, permissions, health, integrations, audit, support | Mostly hidden; surfaced in Settings and diagnostics |
| J5 | Main assistant, router, cross-domain coordinator, synthesis layer | Primary assistant identity |

## Configurable J-domain containers

J1-J4 should be runtime slots, not permanently hard-coded meanings. During onboarding, a user selects domain packs. The system assigns stable slot IDs while retaining the pack identity and version.

Initial pack catalog:

- Personal Admin & Productivity;
- Health & Wellness;
- Work & Business;
- Finance;
- Security & Privacy;
- Home & Lifestyle;
- Learning & Growth;
- Creator & Projects;
- Devices & IoT;
- Maker & Garage.

A user may rename a domain without changing its internal ID. Packs define capabilities, UI modules, starter workflows, policy rules, and onboarding questions. They must not contain founder-specific content.

## Compartment model

| Compartment | Purpose | Example contents |
|---|---|---|
| Soul Matrix | User identity and interaction preferences | name, pronouns, communication style, boundaries, accessibility preferences |
| Purpose Matrix | Roles, goals, commitments, and priorities | life roles, goals, time horizons, success criteria, non-negotiables |
| Workflow Matrix | Skills, automations, plugins, and execution preferences | enabled capabilities, defaults, approvals, reusable routines |
| IoT Matrix | Authorized interfaces and devices | phones, watches, displays, sensors, rooms, device permissions |
| Self-Reflecting Matrix | System learning and improvement proposals | observed friction, proposed preference changes, performance reviews |
| Collaboration Matrix | People, groups, and external systems involved in work | household members, coworkers, service providers, shared spaces |
| Knowledge Matrix | User-owned facts, sources, notes, and artifacts | documents, notes, citations, entities, project knowledge |
| Reflect Compartment | Explicit alignment and review checkpoints | weekly review, goal alignment, memory corrections, policy review |

## Reflection distinction

The Self-Reflecting Matrix is continuous and proposal-oriented. It may notice patterns but cannot silently rewrite identity, purpose, or policy.

The Reflect Compartment is user-visible and checkpoint-oriented. It is where the user accepts, rejects, or edits proposed changes and conducts periodic reviews.

## Vector Trigger Layer

The Vector Trigger Layer is not another compartment. It is a retrieval and event-matching layer across compartment records.

It may:

- find context relevant to the current request;
- match events to workflows;
- identify a possible cross-domain dependency;
- suggest a reminder or review;
- route a memory proposal to the correct compartment.

It must apply access control before retrieval, return source citations, respect retention and sensitivity classes, and never treat embedding similarity as authorization.

## Memory temperatures

| Layer | Lifetime | Typical contents |
|---|---|---|
| Hot | current turn or active task | recent messages, current tool results, temporary plan state |
| Warm | project, workflow, or recent period | active project summaries, working preferences, unresolved decisions |
| Cold | durable and user-approved | identity, goals, stable facts, long-term knowledge, audited history |

Movement from hot to warm or cold must be controlled by compartment rules and user memory settings.

## Command Center relationship

The Command Center is a projection over domains and compartments. It is not a separate data silo. Cards and summaries should be generated from authoritative records and link back to their source.
