# J5 PA Public Documentation

**Planning baseline:** 2026-09-15  
**Private source reviewed:** `GiovaniOliver/J5-Personal-Assistant` at `7345ff4b142fbbd9cf8511c3ea8c3c08bec53e60`  
**Public-product repository:** `GiovaniOliver/j5-PA-Public-App`

## Start here

1. [Source-system audit](foundation/01-source-system-audit.md)
2. [Public product definition](foundation/02-public-product-definition.md)
3. [Target architecture](architecture/01-target-architecture.md)
4. [Domains and compartments](architecture/02-domains-and-compartments.md)
5. [Second-brain wiki and agentic knowledge graph](architecture/03-brain-wiki-and-agentic-knowledge-graph.md)
6. [Adaptive domains and generative dashboards](architecture/04-adaptive-domains-and-generative-dashboards.md)
7. [J5 harness memory and workflow architecture](architecture/05-j5-harness-memory-and-workflow-architecture.md)
8. [Privacy and tenant isolation](security/01-privacy-and-tenant-isolation.md)
9. [Clean-room extraction plan](migration/01-clean-room-extraction-plan.md)
10. [Migration classification matrix](migration/02-migration-classification.md)
11. [Phased roadmap](roadmap/01-phased-roadmap.md)

## Decision status

### Accepted for planning

- Build from a clean repository; do not clone the private repository wholesale.
- Keep J5 as the main orchestrator and J0 as the platform control plane.
- Keep J1-J4 as stable universal life-domain shells.
- Personalize the product through user-owned life modules, workspaces, workflows, and dashboards inside and across those domains.
- Generate interfaces as validated, versioned specifications constrained to approved components, data bindings, actions, and design recipes.
- Make compartments first-class and user-owned.
- Use one canonical runtime path for chat, voice, automations, and device commands.
- Implement the second-brain wiki as the human-readable surface over the governed Knowledge Matrix.
- Use provenance-aware knowledge claims and hybrid text, vector, and graph retrieval.
- Scope all durable records by tenant/workspace and user.
- Separate product entitlements from provider usage and model costs.

### Still to decide

- Initial hosted product versus self-hosted-first release.
- Final life modules and design recipes included in the first release.
- Supported model providers and bring-your-own-key policy.
- Whether family/shared workspaces ship in the MVP.
- Final pricing and sponsored-access rules.
- Which device surfaces ship after web and mobile.
- Whether and when measured graph traversal needs justify a native graph-database projection.
- When A2UI or AG-UI interoperability becomes a release requirement.

## Documentation rule

These documents describe the public product, not the private owner's live environment. Examples must use synthetic users, generic organizations, generic device names, and placeholder endpoints.
