# J5 Public Parity and Migration Tracker
Updated: 2026-10-30. Status: planning, not parity verified.

Source: GiovaniOliver/J5-Personal-Assistant (private/master).
Destination: GiovaniOliver/j5-PA-Public-App (public/main).

## Existing public development branches (reconcile before merging)
- codex/public-harness-continuation
- feat/harness-core-turn-pipeline
- feat/public-harness-foundation
- feat/public-harness-parity-foundation-20261028
- feat/public-launch-open-core-20261021
- docs/public-product-foundation-2026-09-15

Do not overwrite active agent work. Inspect branches, changed files, PRs, CI and owners, and coordinate changes.

## Public baseline
README and architecture document provider-neutral contracts/core, but report no production UI/server and host-supplied runtime adapters. Roadmap has outstanding conformance tests, memory router, durable workflow, API/SDK, control-plane UI and deployment adapters.

## Safe transfer rules
1. Inventory source modules, package licenses and test coverage.
2. Classify each as portable, requires abstraction, or private-only.
3. Never copy personal data, customer datasets, API keys, tokens, secrets, private machine paths, private service URLs or private commit history.
4. Replace private dependencies with explicit host adapters and synthetic fixtures.
5. Port bounded units in reviewed PRs, with compatibility, actor/workspace isolation and negative tests.
6. Scan all changes and history before public release; no direct private-history cherry-pick without security review.
7. Preserve existing J5 authorization-before-execution, trace and idempotency contracts.

## Workstreams
- [ ] Reconcile existing public parity and turn pipeline branches and PRs.
- [ ] Review existing portable contracts/core against private implementation.
- [ ] Complete actor/workspace isolation, policy-denial, approval, cancellation, idempotency and tracing conformance.
- [ ] Wire minimal model-turn lifecycle through explicit provider/policy/capability ports.
- [ ] Design and implement scoped memory provenance and revocation support.
- [ ] Implement durable workflows and human approval persistence.
- [ ] Build workspace-scoped API/SDK.
- [ ] Build public agent registry and command-center UI on the public API.
- [ ] Add public deployment/provider examples with inert credentials.
- [ ] Create optional Concordium/Solana trust adapters per ../integrations/CONCORDIUM_SOLANA_TRUSTED_AGENTS.md.
- [ ] Validate reproducible public build and integration tests.

## First implementation slice
Review work in progress; add isolated trust contract schemas and test fixtures, verify minimal turn pipeline and authorization tests, then prototype Concordium testnet and x402 behind opt-in feature configuration.

No claims of complete parity, deployed trust, successful settlement or production readiness without independently verified execution evidence.
