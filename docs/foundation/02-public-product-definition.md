# Public Product Definition

## Product statement

J5 PA Public is a personal AI operating system that helps a person organize goals, knowledge, recurring work, digital services, and connected devices through one governed assistant.

It is not a preloaded copy of the founder's personal assistant. Each installation begins empty, learns only through explicit onboarding and authorized connections, and gives the user control over what J5 remembers and what it may do.

## Target users

The platform should work for a general user first, with optional depth for:

- individuals managing daily life and goals;
- founders, freelancers, and small-business operators;
- households or caregivers using shared workflows;
- creators and project builders;
- sponsored users receiving access through a school, nonprofit, employer, or community program.

## Core value

J5 connects four things that are usually separated:

1. what the user values and is trying to accomplish;
2. what the user knows and wants remembered;
3. what tools, services, and devices the user authorizes;
4. what actions J5 may plan, recommend, or execute.

## Primary user experience

The Command Center is the public product's home. It should show:

- a conversation entry point;
- today's priorities and schedule;
- active plans and workflows;
- short project activity summaries;
- approvals waiting for the user;
- useful alerts from connected services or devices;
- recent memory or knowledge changes that the user can inspect;
- universal domain shortcuts and the user's installed life modules;
- dashboards created or revised by J5 from approved product components.

Internal agent chains, provider logs, raw commits, and infrastructure detail belong in expandable diagnostics, not the default experience.

## Adaptive personal structure

Every user receives the same stable J0-J5 system vocabulary, but not the same application menu.

J1-J4 are broad universal life domains. During onboarding and later use, J5 helps the user install specific life modules such as a business, job search, family-care space, garden, workshop, vehicle-management area, rental portfolio, classroom, or creative studio.

J5 may propose and preview dashboards for these modules. Published dashboards are declarative, versioned, reversible, and limited to registered components, data bindings, and capability-backed actions. J5 cannot silently deploy arbitrary interface code.

## Product principles

- **User-owned context:** identity, memory, knowledge, life modules, and dashboards belong to the user.
- **Consent before connection:** integrations are opt-in and narrowly scoped.
- **Approval before consequence:** external writes, purchases, messages, account changes, and high-risk actions require policy checks and, by default, confirmation.
- **Progressive complexity:** basic users see one assistant; advanced users can inspect domains, workers, workflows, tools, and interface specifications.
- **Stable structure, personal expression:** universal domains remain predictable while life modules and dashboards reflect the individual.
- **Generated from a design system:** J5 composes high-quality interfaces from approved components and recipes rather than producing uncontrolled code.
- **Portable configuration:** modules, dashboards, and workflows are configuration, not forks of the application.
- **Provider independence:** model, voice, search, and automation providers sit behind governed interfaces.
- **Honest capability status:** unavailable or simulated features cannot appear as live.
- **Sparse delegation:** activate only the agents needed for the task.

## Public access models

The entitlement system should support multiple access sources without creating separate codebases:

- paid personal subscription;
- paid professional subscription;
- household or team workspace;
- sponsored or granted access;
- trial access;
- internal administration and support access with audited impersonation controls.

Pricing is intentionally not fixed in this document. Entitlements, quotas, metered provider usage, and sponsorship should be modeled independently so pricing can change without rewriting product logic.

## MVP boundary

The first sellable release should include:

- account, workspace, onboarding, and data controls;
- Command Center;
- chat with canonical routing;
- tasks, plans, calendar, notes, and knowledge;
- stable universal domains and installable life modules;
- governed dashboard composition with preview, publish, revision, rollback, and archive;
- compartment-backed profile, purpose, knowledge, and workflow context;
- connector authorization and revocation;
- approval queue and audit log;
- usage and entitlement enforcement;
- export and deletion flows.

Voice, Apple Watch, smart displays, robotics, advanced finance execution, deep IoT control, third-party UI catalogs, and autonomous interface reorganization should follow after the privacy and execution foundations are proven.
