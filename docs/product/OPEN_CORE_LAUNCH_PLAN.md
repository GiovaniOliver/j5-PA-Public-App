# J5 public launch and open-core commercialization plan
Updated: 2026-10-21
Status: Working plan, not a release or partner approval

## Product boundary
- **J5 Community**: self-hosted, portable agent harness with explicit workspace identity, provider interfaces, capability policy, approval gates, receipts and trace IDs. Code availability and license remain **undecided**. Do not imply an approved OSI license.
- **J5 Cloud**: proposed SMG-managed infrastructure, backups, upgrades and billing; not currently available.
- **J5 Business**: proposed multi-user controls, budgets, audit exports, managed connectors and support; not currently available.
- **J5 Enterprise**: proposed private deployment, SSO, governance, support SLAs and contractual controls; not currently available.
Do not publish price, signup, availability, SLA or security-compliance promises before validation.

## Safe reuse from internal J5 (GiovaniOliver/J5-Personal-Assistant)
Source project has operational features, including Fastify/Prisma backend, web UI, agent workflows and LLM gateway. **No blind directory copy**. Port abstractions with fresh fixtures:
1. Model router/provider adapter: identify minimal host-independent interfaces, remove private model credentials and personal fallback settings; test explicit errors.
2. Capability/MCP execution: port generic command registry and schemas after separating private tools for mail, finance, ventures, devices and accounts.
3. Agent/workflow lifecycle: extract run IDs, limits, cancellation, idempotency, approvals and receipts without private event records.
4. Cost budgets: port algorithms using synthetic cost data only, enforce workspace scope.
5. Web control plane: implement new public views against public API; **do not** transplant private dashboards or their data bindings.
6. Memory: use scoped evidence adapters and synthetic fixtures; never copy personal memories or history.

Every candidate port requires provenance, source license/dependency check, secret scan, tests for tenant isolation, denial and approval, and explicit maintainer review. The public harness is not presently a deployable production server.

## Concurrent work tracks
**Track A — Runtime (Stage 2):** one real configurable model turn, policy-gated capability, validation, verification and trace. Exit: real end-to-end test with negative controls.
**Track B — Durable workflows (Stages 3–4):** scoped evidence, persistent runs, checkpoint/retry/cancellation/approval. Exit: restarted workflow respects pending approval.
**Track C — API and UI (Stages 5–6):** authenticated workspace endpoints, setup view, runs and approvals. Exit: operator follows a request to receipt.
**Track D — Distribution (Stage 7):** audited container builds, env template, Docker Compose, health, persistent storage, secret rotation and upgrades. Exit: clean-host reproducible deployment.
**Track E — Business / Website:** release transparency, open-core editions, early-access interest, disclosure of unreleased tiers, docs and support contacts. Exit: truthful public site with no fake checkout.
**Track F — Self-improvement research:** sandboxed patch proposals, regression evaluations and required human approvals. Not a prerequisite for developer preview.

## Hosting marketplace candidates (verify eligibility before submission)
- Railway templates: public template + potential Open Source Partner Program (15% base usage commission + 10% support bonus when qualified). https://docs.railway.com/templates/partners
- DigitalOcean Marketplace: apply for 1-Click Application; separately SaaS Add-On vendor program reports roughly 75% vendor revenue share (not a J5 revenue forecast). https://marketplace.digitalocean.com/vendors
- Coolify services: Docker Compose service PR; docs currently require at least 1,000 GitHub stars before service template inclusion. https://coolify.io/docs/contribute/service
- Self-hosted Docker Compose: direct download/install channel; no marketplace gate. Publish only after security and installer tests.
- Other channels for investigation: Dokploy, Easypanel, Elestio, Cloudron, CapRover, PikaPods, and AWS Marketplace; requirements, commissions and fit not yet confirmed.

## Launch gates
- License + trademark + contributor policy decided; confirm third-party redistribution rights.
- Reproducible clean install, tests, tagged container image, SBOM and dependency security scan.
- All operations scoped to workspaces; deny-by-default; secrets encrypted or externalized; no private J5 data.
- Operational health checks and verified backup/restore and upgrade paths.
- Pricing, billing, privacy policy, terms, acceptable-use and support promises reviewed.
- Publish 'developer preview' only after end-to-end execution is real; enterprise claims only after enterprise controls work.
