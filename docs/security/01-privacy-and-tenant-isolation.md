# Privacy and Tenant Isolation

## Non-negotiable boundary

No request, memory retrieval, workflow, background job, connector callback, support action, or analytics event may operate without a resolved workspace boundary.

The private source system's `local-user` style fallback must not exist in the public product.

## Required ownership keys

Every user-created or user-derived record must carry the appropriate ownership chain:

- `tenantId`;
- `workspaceId`;
- `ownerUserId` or a deliberate shared ownership policy;
- `createdByActorId` for auditable changes;
- sensitivity and retention classification where relevant.

Unique indexes must include the ownership boundary when a value only needs to be unique within a workspace.

## Isolation controls

- enforce workspace scope in the service layer and database access layer;
- add database row-level security or an equivalent defense-in-depth policy where practical;
- use tenant-aware cache and queue keys;
- bind object storage paths and signed URLs to the workspace;
- verify webhook ownership before processing events;
- prevent cross-tenant vector retrieval by filtering before similarity search;
- isolate provider credentials by workspace and connector installation;
- prohibit support access unless time-bound, approved, least-privileged, and audited.

## Data classes

| Class | Examples | Default handling |
|---|---|---|
| Account | email, login identity, billing relationship | encrypted in transit and at rest; minimal access |
| Personal profile | preferences, roles, goals | private; exportable; editable; deletable |
| Sensitive personal | health, finance, precise location, legal records | disabled until explicitly enabled; stronger approval and retention controls |
| Knowledge | user documents, notes, sources | user-selected visibility; source citations retained |
| Connector secrets | OAuth refresh tokens, API keys, webhook secrets | encrypted secret store; never exposed to models or logs |
| Conversation | messages, tool results, attachments | configurable retention; redact secrets and unnecessary payloads |
| Audit | approvals, executions, permission changes | tamper-resistant; separately retained |
| Analytics | feature usage and reliability data | minimize, pseudonymize, and separate from content |

## User controls required for launch

- view and edit profile and compartment records;
- see why a memory was used;
- disable memory by category;
- revoke a connector and delete its cached data;
- export account and workspace data;
- delete the account and verify downstream deletion;
- inspect action history and approvals;
- manage devices and active sessions;
- set default autonomy and spending limits.

## Action risk levels

| Level | Examples | Default behavior |
|---|---|---|
| Read | search, summarize, inspect schedule | allowed within granted scopes |
| Draft | compose message, build plan, prepare form | allowed; no external effect |
| Reversible write | create task, add calendar event | confirm based on user policy |
| External communication | send email, message, publish content | explicit approval by default |
| Financial or legal | purchase, transfer, trade, submit legal form | explicit step-up approval and narrow limits |
| Safety critical | locks, vehicles, health actions, emergency devices | specialized policy; deny by default until configured |

## Repository controls

Before any source extraction, run secret scanning, PII scanning, license review, path scanning, generated-artifact checks, and history review. A clean current file is not sufficient if a secret or personal record remains in Git history.
