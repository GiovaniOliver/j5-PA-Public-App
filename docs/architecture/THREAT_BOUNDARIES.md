# J5 Harness Threat Boundaries

**Status:** Initial security boundary
**Date:** 2026-09-30

## Trust zones

- **Client input:** untrusted until validated and associated with an authenticated actor by a
  host application.
- **Model output:** untrusted suggestions. It cannot call an arbitrary URL, shell, database,
  or host function. Actions must resolve to registered capabilities.
- **Memory content:** untrusted evidence, even when retrieved from a trusted store. Retrieved
  instructions never change policy or grant capability permission.
- **Capability adapters:** privileged components. Each receives only its registered input,
  explicit request context, and the credentials scoped to its function.
- **Provider and storage adapters:** trusted to access configured services, but their request
  and response payloads still require schema validation and trace correlation.
- **Policy and identity adapters:** security-critical. A missing, malformed, or failed policy
  decision must stop execution. A missing actor or workspace must be rejected at ingress.

## Required controls

1. The host authenticates first and creates actor/tenant/workspace context. Clients cannot
   choose or override those identity fields.
2. Strict schemas reject unknown fields. Identifiers, list lengths, text sizes, and numeric
   bounds are checked at public input boundaries.
3. Authorization runs before memory retrieval and before every capability call. Capabilities
   are allowlisted in manifests and registered with concrete validators and handlers.
4. The model sees only the context assembled for the authorized workspace and declared memory
   scopes. Prompt instructions from sources are treated as source content, not policy.
5. Secrets stay in adapters. They are never included in manifests, model context, receipts,
   user-facing validation errors, or routine traces.
6. Adapter failures remain visible as failures with request/trace IDs. The harness does not
   synthesize success, run a different capability, or switch data sources silently.
7. Workflow retries are idempotent where required, bounded by the manifest, and recorded.
   Approval-gated actions stay paused until an authenticated approver resolves them.
8. Output is validated and, for consequential actions, verified against the target system
   before the harness reports completion.

## Residual responsibilities

These rules define the shared runtime boundary; they do not replace host security work. Each
host must implement authentication, tenant isolation in its database and queues, credential
storage/rotation, network egress policy, operator auditing, retention, and incident response.
Each adapter must document the data it can read/write and the scopes required for it to run.
