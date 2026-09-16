# J5 PA Public

J5 PA Public is the productized, privacy-safe edition of the J5 Personal Assistant architecture.

This repository is intentionally starting from a clean foundation. It is not a fork or data copy of the private personal system. Reusable system patterns will be extracted only after they pass privacy, tenancy, security, licensing, and product-fit review.

## Planning status

The current phase is architecture and extraction planning. No personal data, private configuration, provider credentials, device credentials, session transcripts, local paths, or venture-specific records may be migrated.

Start with [the documentation index](docs/README.md).

## Product direction

The public product keeps the strongest J5 ideas:

- one central J5 orchestrator;
- configurable domain-agent containers;
- specialized managers and task workers activated only when needed;
- identity, purpose, knowledge, workflow, reflection, collaboration, and device compartments;
- persistent memory with explicit ownership and controls;
- skills, workflows, connectors, devices, and voice as governed capabilities;
- a Command Center that presents useful outcomes instead of internal agent mechanics.

## Repository rule

All planning and architecture documents belong under `docs/`. Application code will be added only after the extraction boundary and public data model are approved.
