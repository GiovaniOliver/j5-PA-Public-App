# J5 Harness Contract Catalog

**Status:** Proposed contracts for the first implementation slices  
**Date:** 2026-09-16

## Contract principles

- J5 is the runtime boundary; domain agents and workflows never receive infrastructure implementations directly.
- Every request carries authenticated tenant/workspace scope.
- Every boundary validates runtime data and an explicit schema version.
- Identifiers are opaque; display names never serve as authorization keys.
- Read, propose, approve, execute, and verify are separate states.
- Memory retrieval and workflow execution return receipts.
- Derived projections are rebuildable from authoritative records.

## Common context

| Contract | Required fields |
|---|---|
| `ActorContextV1` | `actorId`, `userId`, `tenantId`, `workspaceId`, `membershipId`, `roles`, `sessionId`, `channel`, `authenticatedAt` |
| `DeviceContextV1` | `deviceId`, `deviceClass`, `capabilities`, `trustLevel`; optional for web sessions |
| `RequestContextV1` | actor, optional device, locale, timezone, correlation ID, trace ID, idempotency key, feature flags |

An application adapter constructs this context. Model output and client-provided JSON cannot create or modify its ownership fields.

## Harness turn

| Contract | Purpose |
|---|---|
| `HarnessTurnRequestV1` | User input, requested modality, optional requested domain/module, attachments by authorized reference, response preferences |
| `RouteDecisionV1` | Direct capability, J0-J4 domain agent, or workflow plus confidence and deterministic reason codes |
| `HarnessTurnResponseV1` | User-safe output blocks, citations, proposed actions, approval requests, capability status, receipt IDs, usage summary |
| `HarnessErrorV1` | Stable code, safe message, retryability, correlation ID, optional setup action |

The response never exposes chain-of-thought, credentials, hidden policy, internal prompts, or raw provider payloads.

## Domain agents

`DomainAgentManifestV1` fields:

- `id`: `j0`, `j1`, `j2`, `j3`, or `j4`;
- stable name, purpose, and routing description;
- supported life-module namespaces;
- permitted memory spaces and sensitivity ceiling;
- allowed capability and workflow IDs;
- default risk and budget policies;
- provider/model selection policy;
- response and verification requirements;
- manifest version and compatibility range.

J5 itself is not represented as another domain-agent manifest. J5 is the harness that loads and governs the manifests.

## Capabilities

`CapabilityManifestV1` fields:

- stable capability ID and version;
- owning package/team and maturity (`planned`, `partial`, `ready`, `disabled`);
- input and output schema references;
- read/write/external-effect classification;
- required scopes and supported domains/modules;
- risk class and approval policy;
- idempotency, timeout, retry, and cancellation behavior;
- cost model and per-run limits;
- audit and redaction rules;
- implementation adapter identifier.

An unimplemented manifest is never registered as executable. Planning metadata and runtime readiness are separate.

## Workflow manifests

`WorkflowManifestV1` fields:

- stable workflow ID and semantic version;
- owner domain agent or J5 platform service;
- `executionMode`: `direct`, `deterministic`, `queued`, or `langgraph`;
- input, output, and state-schema references;
- allowed capabilities and memory spaces;
- risk class, approval nodes, and write policy;
- timeout, maximum steps, retry, cancellation, and idempotency;
- checkpoint and retention policy;
- cost/token/tool-call budgets;
- observability and evaluation policy.

The runtime selector rejects a manifest whose requested mode is unavailable. It does not silently fall back to a different execution model.

## Policy contracts

| Contract | Purpose |
|---|---|
| `PolicyRequestV1` | Actor, action, resource, sensitivity, risk, budget, and context summary |
| `PolicyDecisionV1` | allow, deny, or require approval; scopes; limits; reason codes; expiry |
| `ApprovalRequestV1` | User-visible action summary, effects, data used, cost, expiry, and confirmation method |
| `BudgetV1` | Token, provider cost, tool-call, elapsed-time, and external-spend limits |

Policy decisions are deterministic records. An LLM may classify or summarize inputs, but it does not issue the final authorization decision.

## Memory and knowledge contracts

| Contract | Purpose |
|---|---|
| `MemoryQueryV1` | Authenticated objective, allowed spaces/types, time range, sensitivity ceiling, retrieval modes, result/token budget |
| `ContextPackageV1` | Ordered context items, citations, conflict flags, freshness, truncation, and retrieval receipt ID |
| `KnowledgeSourceV1` | Original authorized source identity, ownership, visibility, sensitivity, retention, and type |
| `SourceRevisionV1` | Version/hash, capture time, parser version, object reference, revocation state |
| `EvidenceChunkV1` | Citeable source segment, anchors, hashes, visibility, and projection versions |
| `WikiRevisionV1` | Human-readable compiled page revision with evidence citations and author type |
| `KnowledgeClaimV1` | Time-aware assertion, evidence, provenance, lifecycle state, and validation |
| `KnowledgeRelationV1` | Typed edge supported by claims/evidence and temporal validity |

`ContextItemV1` identifies its authority class:

- `transactional_record`;
- `source_evidence`;
- `wiki_synthesis`;
- `accepted_claim`;
- `graph_path`;
- `workflow_state`;
- `audit_event`.

This prevents a compiled wiki summary from being mistaken for a current transactional record.

## Receipts and usage

| Contract | Minimum contents |
|---|---|
| `RetrievalReceiptV1` | Query purpose, applied policy, selected source/evidence/wiki/graph IDs, versions, ranking metadata, omissions, timestamp |
| `ActionReceiptV1` | Actor, route, capability/workflow version, policy decision, approval, idempotency key, safe parameter summary, result, verification, timestamp |
| `UsageEventV1` | Tenant/workspace, feature, provider/model, normalized units, estimated/provider cost, budget decision, receipt references |

Receipts store safe structured summaries and references, not secrets, entire documents, hidden prompts, or unnecessary personal content.

## Lifecycle states

### Knowledge proposal

`proposed` → `accepted` | `rejected` | `disputed` → `superseded` → `deleted`

### Workflow run

`pending` → `running` → `waiting_approval` | `paused` → `succeeded` | `failed` | `cancelled`

### Capability readiness

`planned` → `partial` → `ready` → `degraded` | `disabled` | `retired`

Transitions produce auditable events and use optimistic concurrency/version checks.

## First API surface

| Endpoint | Purpose |
|---|---|
| `POST /v1/harness/turn` | Submit a user turn; returns or streams a versioned response |
| `POST /v1/knowledge/sources` | Create an authorized note/source record |
| `GET /v1/knowledge/sources/:id` | Read source metadata and permitted content |
| `DELETE /v1/knowledge/sources/:id` | Revoke/delete source and enqueue projection deletion |
| `GET /v1/receipts/retrieval/:id` | Show why evidence was used |
| `GET /v1/receipts/actions/:id` | Show the governed action lifecycle |
| `GET /v1/capabilities` | Show user-visible capability readiness and setup requirements |

The API adapter derives ownership from the authenticated context; ownership is not trusted from request-body fields.

## Conformance tests

Every storage or runtime adapter must pass shared tests for:

- tenant and workspace isolation;
- missing actor/scope rejection;
- visibility and sensitivity propagation;
- version incompatibility rejection;
- idempotency and concurrency;
- revocation/deletion propagation;
- receipt completeness and redaction;
- deterministic error codes;
- provider/tool timeout and cancellation;
- no planning-only capability execution.

