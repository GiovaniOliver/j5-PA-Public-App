# Domains and Compartments

## Why they are separate

A domain organizes work. A life module represents a specific part of one user's life. A compartment organizes context and governance.

For example, a travel request may run in J4 while reading Purpose constraints, calendar knowledge, collaboration contacts, and an approved travel connector. A Maker Garage module may live primarily in J4 while using J2 project planning, J3 safety policy, and J0 device integrations. The user should not have to duplicate those facts inside every domain.

## Stable system agents

| Identifier | Responsibility | User visibility |
|---|---|---|
| J0 | Platform administration, permissions, health, integrations, audit, support | Mostly hidden; surfaced in Settings and diagnostics |
| J5 | Main assistant, router, cross-domain coordinator, synthesis layer | Primary assistant identity |

## Universal J-domain containers

J1-J4 should have stable public meanings rather than acting as four arbitrary slots.

| Identifier | Universal domain |
|---|---|
| J1 | Health and wellbeing |
| J2 | Work, money, and projects |
| J3 | Safety, security, and resilience |
| J4 | Home, relationships, and lifestyle |

A user may choose friendly display labels, but the stable identifier and routing meaning remain intact. This makes documentation, permissions, skills, diagnostics, and cross-user support predictable.

## Personalized life modules

Personalization happens inside and across universal domains through life modules.

Initial module catalog examples:

- Personal Admin and Productivity;
- Fitness and Nutrition;
- Medical Organization;
- Employment and Job Search;
- Small Business;
- Personal Finance;
- Learning and School;
- Creator Projects;
- Family and Caregiving;
- Home and Property;
- Travel;
- Garden;
- Vehicles;
- Maker Garage;
- Devices and IoT.

A module may be renamed without changing its internal installation ID. Modules define capabilities, UI contributions, dashboard templates, design recipes, starter workflows, policy rules, ontology extensions, data bindings, and onboarding questions. They must not contain founder-specific content.

J5 may propose a new module after onboarding or later discovery, but navigation, connector scope, and dashboard publication remain user-controlled.

See [Adaptive domains and generative dashboards](04-adaptive-domains-and-generative-dashboards.md).

## Compartment model

| Compartment | Purpose | Example contents |
|---|---|---|
| Soul Matrix | User identity and interaction preferences | name, pronouns, communication style, boundaries, accessibility preferences |
| Purpose Matrix | Roles, goals, commitments, and priorities | life roles, goals, time horizons, success criteria, non-negotiables |
| Workflow Matrix | Skills, automations, plugins, and execution preferences | enabled capabilities, defaults, approvals, reusable routines |
| IoT Matrix | Authorized interfaces and devices | phones, watches, displays, sensors, rooms, device permissions |
| Self-Reflecting Matrix | System learning and improvement proposals | observed friction, proposed preference changes, performance reviews |
| Collaboration Matrix | People, groups, and external systems involved in work | household members, coworkers, service providers, shared spaces |
| Knowledge Matrix | User-owned facts, sources, notes, artifacts, entities, claims, and relationships | documents, wiki pages, citations, entities, project knowledge |
| Reflect Compartment | Explicit alignment and review checkpoints | weekly review, goal alignment, memory corrections, graph proposals, module and dashboard proposals, policy review |

## Second-Brain Wiki and Knowledge Matrix

The second-brain wiki is the human-readable interface to the Knowledge Matrix. It provides pages, links, backlinks, revisions, search, graph views, and correction tools. It is not a separate silo.

The Knowledge Matrix remains authoritative for sources, entities, claims, relationships, provenance, visibility, retention, and approval state. Life modules may add ontology extensions, templates, and views, but all underlying knowledge remains subject to workspace and compartment policy.

See [Second-brain wiki and agentic knowledge graph](03-brain-wiki-and-agentic-knowledge-graph.md).

## Reflection distinction

The Self-Reflecting Matrix is continuous and proposal-oriented. It may notice patterns but cannot silently rewrite identity, purpose, policy, accepted knowledge, installed modules, or published dashboards.

The Reflect Compartment is user-visible and checkpoint-oriented. It is where the user accepts, rejects, disputes, or edits proposed changes and conducts periodic reviews.

## Vector Trigger Layer

The Vector Trigger Layer is not another compartment. It is a retrieval and event-matching layer across compartment records.

It may:

- find context relevant to the current request;
- match events to workflows;
- identify a possible cross-domain or cross-module dependency;
- suggest a reminder, module, dashboard, or review;
- route a memory or graph proposal to the correct compartment;
- combine semantic matches with authorized knowledge-graph relationships.

It must apply access control before retrieval, return source citations, respect retention and sensitivity classes, and never treat embedding similarity or graph adjacency as authorization.

## Memory temperatures

| Layer | Lifetime | Typical contents |
|---|---|---|
| Hot | current turn or active task | recent messages, current tool results, temporary plan state |
| Warm | project, workflow, or recent period | active project summaries, working preferences, unresolved decisions |
| Cold | durable and user-approved | identity, goals, stable claims, long-term knowledge, module configuration, published dashboard revisions |

Movement from hot to warm or cold must be controlled by compartment rules and user memory settings.

## Command Center relationship

The Command Center is a projection over domains, life modules, and compartments. It is not a separate data silo. Cards and summaries should be generated from authoritative records and link back to their source.

The Wiki provides the deeper browse-and-edit experience for knowledge surfaced by Command Center cards. Personalized dashboards provide task-specific operational views without changing the underlying knowledge ownership.
