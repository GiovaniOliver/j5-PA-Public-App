# Migration Classification Matrix

## Port after review

| Capability | Conditions |
|---|---|
| Canonical chat routing concepts | Remove user fallback; add workspace boundary; verify end to end |
| Domain semantics and registry pattern | Replace fixed meanings with versioned domain packs |
| Workflow and capability registry concepts | Add schemas, versions, permissions, readiness, and entitlements |
| Conversation continuity concepts | Tenant-scope sessions and devices; add retention controls |
| Memory retrieval concepts | Permission filter before retrieval; citations; user correction and deletion |
| Web shell and Command Center patterns | Remove private modules; simplify navigation; make domain cards configurable |
| Notification and audit concepts | Separate content from telemetry; tenant-scope every event |
| Provider adapter patterns | Consolidate interfaces; move secrets to managed storage |

## Refactor before use

| Area | Required change |
|---|---|
| Prisma data model | Introduce tenant/workspace ownership and shared-resource policies |
| Authentication | Remove local and shared-key assumptions; add production session and recovery flows |
| Agent hierarchy | Choose one canonical runtime and make delegation sparse |
| Domain navigation | Convert J1-J4 into configurable slots and pack metadata |
| Tool execution | Replace placeholder handlers with typed, verified adapters |
| Background jobs | Tenant-aware queue keys, idempotency, quotas, cancellation, audit |
| Configuration | Schema-driven settings; no host paths or personal environment defaults |
| Seeds and examples | Fully synthetic fixtures generated for tests |
| Observability | Redaction, tenant-safe correlation, no prompt or secret leakage by default |

## Replace

- owner-specific navigation trees and venture catalogs;
- public access through a workspace PIN;
- any fallback that assigns an unauthenticated request to a local user;
- direct provider calls that bypass the policy and audit gateway;
- generic environment files that mix product configuration and secrets;
- private-device orchestration assumptions embedded in general product code.

## Exclude permanently

- personal records and databases;
- session transcripts and assistant-history exports;
- credentials, tokens, private keys, and credential-location files;
- local paths, machine names, private endpoints, and infrastructure identifiers;
- private business ventures, personas, brand assets, campaigns, and unpublished plans;
- temporary screenshots, audio, videos, API payloads, and test responses;
- generated clients, caches, build outputs, uploads, logs, and backups.

## Defer

- autonomous trading or financial execution;
- legal submission workflows;
- health recommendations beyond low-risk organization and reminders;
- home-security and physical-device control;
- robotics and fabrication control;
- complex social publishing and automated outbound messaging;
- vendored applications until license, update, and isolation strategies are approved.
