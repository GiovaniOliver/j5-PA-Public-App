# J5 Public Harness — private-to-public parity backlog

Updated: 2026-10-28
Source of truth for public readiness: this repository. Reference implementation: private `GiovaniOliver/J5-Personal-Assistant` (do not copy its data, secrets, configuration or proprietary adapters).

## Release target

A new developer can clone J5, configure their *own* provider and workspace, execute one authorized capability, pause a gated workflow for approval, resume after process restart, and inspect a truthful result and trace. Public J5 is currently a contracts-and-core preview, **not** yet an installable production harness.

## Critical distinction

The private monorepo has a Fastify/Prisma/PostgreSQL backend, Memory Router, MCP server, Agent Command Center, isolated agent workforce, BullMQ, Opik, chat/voice and Smart Dashboard integrations. Many are real but some have known incomplete functions and live verification gaps. The public repo contains only two initial portable packages and a local demo shell. **Port interfaces and reviewed generic implementations**, not the personal application, database, identities, company systems or raw filesystem state.

## P0 — required before a developer preview

- [x] Provider-neutral runtime contracts and Zod validation exist.
- [x] Agent/capability/workflow registries and policy-gated capability call exist.
- [x] Add first synthetic contract tests for missing context, policy denial/approval and output validation (initial coverage in this branch).
- [ ] Add complete synthetic conformance suite: tenant/workspace isolation, omitted handler, duplicate registration, workflow idempotency, cancellation, invalid adapter replies, and receipt trace binding.
- [ ] Introduce `HarnessTurnService` with authenticated actor context, scoped retrieval, provider invocation, capability execution, output verification and typed receipts. **Partial:** bounded provider call, explicit gated capability and response receipt implemented; scoped retrieval and durable receipt storage not yet implemented.
- [ ] Add provider gateway interface implementation with a **real** opt-in API adapter, timeout, typed errors, cost metering and test fixture. **Partial:** opt-in OpenAI adapter and timeout/error tests added; metered pricing/cost cap, provider fallback and live credential-based test still pending.
- [ ] Add a runnable API/CLI quickstart: explicit tenant/workspace, model provider, one read tool and one approval-required write example. **Partial:** real-provider CLI example + safe echo tool added; no server or persisted approval flow.
- [ ] Add persisted approval requests and a durable job/checkpoint adapter; test restart, duplicate requests, timeout, cancel and recovery.
- [ ] Adopt repo-wide license/contribution/security policies; review dependencies and transitive license provenance.
- [ ] Set up CI for install, typecheck, build, synthetic test suite, secret detection and dependency review. **Partial:** install, typecheck and tests added in public-harness workflow; security scanners and dependency review still pending.
- [ ] Run release security review: no personal paths/accounts, default-user fallbacks, copied secrets, token files, credentials, live business data or private history.
- [ ] Publish versioned package/release documentation and a documented compatibility table.

## P1 — competitive core

- [ ] Introduce `MemoryRouter` port with scoped relational/evidence/wiki/vector reads, authority, freshness, source revisions and retrieval receipts. Port generic algorithms, not personal memory contents.
- [ ] Make typed capability manifests describe availability/executable readiness (unimplemented placeholders cannot advertise as runnable).
- [ ] Add resource budgets, risk levels and per-tool approval enforcement with concrete tests.
- [ ] Add MCP server adapter with per-client scoped tools, modern transport/auth testing, bounded inputs and audit receipts.
- [ ] Add OpenTelemetry-style trace adapter; retain the existing private Opik integration behind a port.
- [ ] Add reusable worker/sandbox adapter using private workforce **design patterns**, not its keys, jobs, marketplace accounts or network settings.
- [ ] Build minimal control plane for workspace/provider setup, run inspection, approvals and adapter health.
- [ ] Produce benchmarks covering completion, tool-call correctness, latency, spend, denial, restart recovery and malicious tool output.

## P2 — differentiators after stable core

- [ ] Optional A2A external-agent gateway and interoperability tests.
- [ ] Skill packaging/permissions registry with version and provenance.
- [ ] Long-running graph workflows only for real branching and cross-agent handoffs.
- [ ] Supervised self-improvement: trace diagnosis → proposal → regression tests → human-reviewed PR; no unattended production code modification.
- [ ] Edge/device/Garage adapters as isolated opt-in packages; never publish household location, device keys or personal notes.
- [ ] Template workflow connecting generic research, design artifacts, issue tracking and sandboxed build validation.

## Proposed dependency order

`core contracts → conformance tests → turn lifecycle → model/provider adapter → runnable quickstart → durable workflow+approval → memory router → MCP/API → observability/control plane → public release`.

## Reference-to-target map

| Private source | Public destination | Transfer rule |
| --- | --- | --- |
| `backend/src/services/j5-canonical-runtime.service.ts` | `@j5/harness-core` turn orchestration | Refactor into ports; do not copy the 4k+ line personal runtime |
| `backend/src/services/memory/` | separate `@j5/memory-*` packages | Policies, algorithms, synthetic fixtures only |
| `backend/src/services/mcp/` | `@j5/mcp-server` | Port tool scoping/validation; omit authenticated personal data |
| `backend/src/services/queue.service.ts`, workforce | `@j5/workflow-runtime-*` | Durable patterns and isolation; no job/account import |
| `backend/src/services/opik.service.ts` | `@j5/observability` adapter | Trace contracts and redaction only |
| Agent Command Center | `@j5/control-plane` | Rewrite against public APIs and synthetic workspace entities |
| Private Paperclip vendor | **Optional** independent integration | Honor upstream license and provenance; do not copy entire vendor |

## Acceptance criteria for first public preview

1. Fresh clone installs, builds and passes conformance checks.
2. User supplies credentials by env/config without exposing them to the agent.
3. One real model completion calls a registered permitted tool and returns validated output and attributable run receipt.
4. Denied/approval-required tools cannot execute before policy authorization.
5. One durable job resumes after a forced restart without duplicate side effects.
6. A test with two tenants proves retrieval and execution cannot cross workspace boundaries.
7. A release reviewer signs off on the public artifact's source, secrets, licenses and documentation.

## Known private gaps not to transplant

- In-memory Automator state; incomplete native long-idle voice checks; only partial live job marketplace verification; private operator defaults and local wiki CLI assumptions; UI stubs and mock fallbacks; historical secret-rotation and CI debt. Investigate and fix them independently before using those paths in a public release.

## Phase 1 implementation increment (2026-10-28)

- Draft PR #6 includes `HarnessTurnService`, `OpenAIChatCompletionsProvider`, a real-model CLI example, and policy/turn conformance tests.
- GitHub Actions typecheck and test steps passed after a strict-optional-property fix on the pull request branch. This does **not** verify production credentials, actual provider responses, or deployment.
- The Phase 1 example uses caller-selected permitted capabilities. It does not yet support model-directed tool selection, persisted approval requests or full autonomous agent loops; do not advertise those capabilities for the public package yet.
