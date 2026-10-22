# J5 internal-to-public transfer checklist
Updated: 2026-10-21

| Source area in private J5 | Public destination | Action | Risk / condition |
|---|---|---|---|
| Model gateway and router | provider adapter package | Extract interfaces and a configurable adapter | Remove private provider keys, priorities and internal budget defaults |
| Agent and MCP tool execution | harness-core and capabilities | Port generic invocation / schema logic | No venture, mail, finance, device or internal tools |
| Approval and agent jobs | workflow runtime | Adapt state transitions and receipts | Synthetic IDs; approvals cannot be bypassed |
| LLM usage ledger and budgets | metering adapter | Port calculations / envelopes | No personal spend events or tenant IDs |
| J5 web command center | new public control-plane app | Reimplement against public API | No internal account or brand lookup |
| Wiki / memory retrieval | evidence and memory adapters | Port interface and scope rules | No actual memory data, embeddings or history |
| Private infrastructure, env and Docker stacks | none | Do not copy | Secrets, account details, personal endpoints |

## Code port acceptance
1. Trace each imported symbol and dependency to an allowed license and generic use case.
2. Strip absolute paths, private hostnames, telemetry endpoints, customer IDs, keys and sample production data.
3. Add deterministic tests for positive case, policy denial, approval-required, missing provider, tenant isolation, timeout and idempotency.
4. Confirm no automatic provider fallbacks or fabricated completed actions.
5. Review in isolated pull requests; do not overwrite the private system.
