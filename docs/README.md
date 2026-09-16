# J5 PA Public Documentation

**Planning baseline:** 2026-09-15  
**Private source reviewed:** `GiovaniOliver/J5-Personal-Assistant` at `7345ff4b142fbbd9cf8511c3ea8c3c08bec53e60`  
**Public-product repository:** `GiovaniOliver/j5-PA-Public-App`

## Start here

1. [Source-system audit](foundation/01-source-system-audit.md)
2. [Public product definition](foundation/02-public-product-definition.md)
3. [Target architecture](architecture/01-target-architecture.md)
4. [Domains and compartments](architecture/02-domains-and-compartments.md)
5. [Privacy and tenant isolation](security/01-privacy-and-tenant-isolation.md)
6. [Clean-room extraction plan](migration/01-clean-room-extraction-plan.md)
7. [Migration classification matrix](migration/02-migration-classification.md)
8. [Phased roadmap](roadmap/01-phased-roadmap.md)

## Decision status

### Accepted for planning

- Build from a clean repository; do not clone the private repository wholesale.
- Keep J5 as the main orchestrator and J0 as the platform control plane.
- Treat J1-J4 as configurable domain containers rather than permanent personal meanings.
- Make compartments first-class and user-owned.
- Use one canonical runtime path for chat, voice, automations, and device commands.
- Scope all durable records by tenant/workspace and user.
- Separate product entitlements from provider usage and model costs.

### Still to decide

- Initial hosted product versus self-hosted-first release.
- Final starter domain packs included in the first release.
- Supported model providers and bring-your-own-key policy.
- Whether family/shared workspaces ship in the MVP.
- Final pricing and sponsored-access rules.
- Which device surfaces ship after web and mobile.

## Documentation rule

These documents describe the public product, not the private owner's live environment. Examples must use synthetic users, generic organizations, generic device names, and placeholder endpoints.
