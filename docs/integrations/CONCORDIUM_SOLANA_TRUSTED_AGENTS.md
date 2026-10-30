# J5 Trusted Agents — Concordium and Solana

Status: proposed, not implemented. Updated: 2026-10-30.
Program: Encode x Concordium Trusted Agents Hackathon, November 2–December 11, 2026.
Submission: December 9, 2026 at 23:59 UTC (17:59 Central).

## Objective
Add optional, portable trust and payment adapters to the public J5 harness. Do not transfer private assistant credentials, data, infrastructure, account context or Git history.

## Architecture
1. Keep J5 internal agent, actor and workspace IDs authoritative for execution. An on-chain agent record is additional evidence, never authorization.
2. Concordium Agent Registry/CIS-8004 adapter: publish Agent Cards, check active registration and verifiable accountable-human proofs, support state changes and revoked/expired proofs.
3. CIS-8 external-key registry: verify possession of existing Solana/EVM addresses and link those to an agent without exporting secret keys.
4. x402 payment adapter: opt-in, specify chain/network, asset, amount, recipient, expiration, idempotency and real settlement receipt.
5. Policy must authorize before lookup/tool/payment. Human approval and spending ceilings are required for financial actions unless explicit bounded authorization exists. Keep signing isolated from models and browsers.
6. Emit correlated audit receipts for policy checks, approval, agent actions, proof checks and transaction confirmation. Never publish customer details, raw prompts, credentials or PII on-chain; use hashes or references only when warranted.
7. MCP and A2A adapters preserve authenticated workspace, actor and capability scopes.

## Proposed public packages
- packages/j5-trust-contracts: schemas for proof, external-key reference, trust state and payments.
- packages/j5-adapter-concordium: registry and proof adapter.
- packages/j5-adapter-x402: bounded payer/payee adapter.
- Control-plane extension after public API: Agent Registry badges, proof inspection, approvals, payments and trace details.
First inspect existing contracts/core; avoid duplicating port abstractions.

## Acceptance criteria
- Required proof missing, invalid, expired, revoked or mismatched: fail closed.
- No cross-tenant proof or spending authorization reuse.
- Linked Solana public key only after genuine ownership proof.
- Unauthorized spend, replay, nonce duplicate, exceeded budget and missing approval are rejected.
- Wallet private keys never reach an agent, client or trace.
- Failed payment cannot appear completed; real testnet transaction and registry references are verifiable.
- Synthetic conformance and negative tests run in CI; no dependence on private J5.
- Demonstrate end-to-end task execution, human approval, registry proof, capped x402 test payment and audit receipt.

## Delivery timeline
- Nov 2 launch 14:30 UTC; first workshop 15:00 UTC.
- Nov 2–18: identity, verification, pay/receive, guardrails, production integration and MCP/A2A workshops Mondays/Wednesdays.
- Nov 19: testnet build window.
- Nov 24–Dec 8: office hours Tuesday/Friday.
- Dec 9: submit by 23:59 UTC.
- Dec 10–11: judging.

Judging emphasizes depth of integration and credible path to production. Winner status only provides possible eligibility for Concordium's 75M CCD grant program; no guaranteed award, amount or terms.

## Reusable downstream scenarios
Eventra AI: authorized event-agents and settlement. Receptionist Wizard: verifiable business agents. Support Buying Black: independent business verification plus trusted actions (do not conflate business verification with human identity). SnapRegisters: authorized service agents.

## Resources
https://encodeclub.com/my-dashboard
https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/index.html
https://agent-registry.concordium.com/
https://www.concordium.com/build/developer
