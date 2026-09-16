# Source-System Audit

## Executive finding

The private J5 repository is a valuable reference implementation, but it is not a safe public-product starting tree. The reviewed default branch contains 4,329 tracked entries, including 3,675 files across frontend, backend, documentation, embedded applications, temporary outputs, device integrations, and private operating context.

The correct strategy is selective extraction into a new architecture, not repository duplication.

## What exists today

The source system is a pnpm monorepo with these major surfaces:

- React 19 and Vite web application under `apps/j5-web`;
- Fastify and TypeScript backend under `backend`;
- PostgreSQL through Prisma;
- Redis and BullMQ for cache, queues, and background work;
- canonical chat runtime, conversation continuity, memory retrieval, workflow registry, and skill execution;
- J5 Matrix agent hierarchy and a second department-oriented agent architecture;
- domain workspaces, device surfaces, voice, notifications, monitoring, and integrations;
- embedded or vendored applications such as Paperclip and Blueprint Studio;
- infrastructure for Docker, reverse proxying, CI, tests, metrics, and VPS deployment.

## Strong reusable concepts

| Concept | Assessment | Public-product treatment |
|---|---|---|
| J5 central orchestrator | Strong product metaphor | Keep as the canonical router and coordinator |
| Domain-agent containers | Strong, but currently hard-coded | Convert to configurable domain packs and user-selected slots |
| Five-tier hierarchy | Useful for complex work | Keep as a capability model; avoid running all five tiers for every request |
| Deterministic skill fast path | Strong cost and reliability pattern | Make this the first routing stage |
| Canonical conversation runtime | Strong foundation | Use one runtime across chat, voice, mobile, and devices |
| Workflow and capability registries | Strong governance pattern | Rebuild with schemas, permissions, versioning, and entitlements |
| Hot/warm/cold memory | Strong conceptual model | Rebuild with explicit data classes, retention, and user controls |
| Command Center and workspace shell | Strong interface pattern | Simplify for outcomes and configurable domains |
| Provider abstraction | Useful but fragmented | Consolidate behind one model and tool gateway |
| Device and IoT surfaces | Differentiating extension | Ship after the core account, memory, and workflow system |

## Important architecture gaps found

1. The repository contains overlapping agent architectures. The public product needs one canonical runtime and one set of contracts.
2. Historical documentation reports that the main chat path once bypassed the planned hierarchy. A later progress note says canonical routing was added, but public implementation still needs fresh end-to-end verification.
3. J0-J4 meanings are not fully consistent across old documents, matrix configuration, frontend labels, and product discussions.
4. The five-tier structure is more complete as a design than as an end-to-end execution chain. Some lower-level tool handlers and route groups have been reported as partial or placeholder implementations.
5. The data schema is primarily `userId` scoped and has no consistent tenant/workspace ownership key across all records.
6. The current chat controller contains a `local-user` fallback. That pattern is not acceptable in a hosted multi-user product.
7. Navigation and source code include owner-specific ventures, finance tooling, hardware, paths, devices, and experiments that should become optional packages or remain private.
8. Some third-party or vendored applications have their own product and licensing boundaries. They require a dependency and license review before reuse.

## Privacy and repository hygiene risks

The source tree includes categories that must never be copied into this repository:

- session exports and assistant transcripts;
- temporary API responses, screenshots, audio, and verification artifacts;
- development or staging environment files;
- device credentials or credential-location documentation;
- absolute local filesystem paths and personal folder names;
- private VPS endpoints, host-specific deployment configuration, and machine inventories;
- personal contacts, health, financial, trading, legal, business, or lifestyle data;
- private venture definitions, brands, personas, campaigns, and content;
- provider tokens, OAuth records, webhook payloads, or test customer information;
- generated database contents and seed data based on real operations.

## Conclusion

J5 PA Public should inherit the private system's architectural lessons, not its state. Every extracted component must be reviewed as if it were entering a new product with unknown users, hostile tenancy boundaries, regulated personal data, metered providers, and account deletion requirements.
