# J5 Public Harness Implementation Roadmap

**Status:** Initial delivery sequence
**Date:** 2026-09-30

## Goal

Build J5 as a portable, multi-workspace AI agent harness that can be self-hosted or hosted,
with an API and control plane for configuring agents, approving actions, and observing runs.
The public repository owns the host-independent contracts and runtime. Product-specific data
and integrations remain in consumer adapters.

## Stage 0 — Public workspace foundation

- [x] Create a standalone pnpm workspace in `j5-PA-Public-App`.
- [x] Move the initial J5 harness contracts and core packages into the public workspace.
- [x] Record the product boundary and architecture decisions here.
- [ ] Define repository license and contribution policy.
- [ ] Add conformance fixtures using synthetic identities and data.

## Stage 1 — Contract hardening

- [x] Add runtime-validated schemas for manifests and current contract envelopes. Core
  validates actor context, manifest registration, capability input/output, policy decisions,
  workflow commands, and workflow start results. Adapter outputs use the exported schemas.
- [x] Define stable core error codes and receipt/start-result schemas.
- [x] Define schema/version compatibility and package release rules in
  [Contract Versioning](CONTRACT_VERSIONING.md).
- [ ] Add conformance coverage for missing actors, workspace isolation, policy denial,
  approval-required behavior, missing handlers, idempotency, cancellation, and tracing.
- [x] Document threat boundaries for adapters and agent-provided input in
  [Threat Boundaries](THREAT_BOUNDARIES.md).

**Exit:** independent adapters can implement the ports and pass the same conformance suite.

## Stage 2 — Minimal harness turn lifecycle

- Compose explicit request context, policy, provider, memory, and capability ports.
- Establish a bounded turn lifecycle: validate, authorize, retrieve context, invoke model,
  validate requested capability, execute, verify, record receipt, return result.
- Keep model-selected actions behind registered capabilities and policy.
- Return exact provider and adapter errors with request and trace IDs.

**Exit:** a host can run one real configured model request and a policy-approved capability
with attributable inputs and an observable result.

## Stage 3 — Memory router and evidence

- Add scoped retrieval across operational records and source evidence.
- Return authority, freshness, source revision, and citations with context.
- Record retrieval receipts and conflicts.
- Add a portable Markdown-plus-metadata source export contract.
- Add deletion and revocation propagation across derived indexes.

**Exit:** retrieval is workspace-filtered, citeable, and correctable.

## Stage 4 — Durable workflow runtime and approvals

- Add workflow run state, idempotency keys, checkpoints, retries, cancellation, and recovery.
- Add human approval persistence and resume semantics.
- Emit lifecycle events and action receipts with trace correlation.
- Enforce manifest limits for duration, attempts, steps, and cost.

**Exit:** long-running work survives restarts and cannot resume a gated action without approval.

## Stage 5 — API and SDK

- Expose workspace-scoped APIs for agents, capabilities, workflows, runs, approvals, and
  receipts.
- Add generated or schema-derived SDK clients.
- Enforce authentication, authorization, rate limits, and audit at the API boundary.
- Publish API compatibility and versioning rules.

**Exit:** external clients can configure and operate a harness without importing internals.

## Stage 6 — Control plane

- Build workspace setup, provider configuration, agent/workflow registries, approval inbox,
  run inspection, trace detail, and health views.
- Keep secrets write-only and redact credentials from logs and traces.
- Show exact adapter connection status and failure endpoint.

**Exit:** an operator can configure a real workspace and follow an action from request to
verified result.

## Stage 7 — Deployment and extension ecosystem

- Document self-hosted deployment, backups, upgrades, and secret rotation.
- Add supported provider, memory, queue, and observability adapters.
- Define extension packaging, permissions, compatibility, and review.
- Add measured evaluations for quality, cost, latency, access isolation, and failure behavior.

**Exit:** a new host can deploy J5 and add a reviewed adapter without forking the core.

## Delivery rules

- Keep the public workspace free of personal data, credentials, and private implementation
  history.
- Prefer explicit configuration and deterministic integrations; surface failures instead of
  simulating success or silently switching routes.
- Add adapters behind the contracts and prove their scope before exposing them to agents.
- Keep authorization before retrieval and tool calls.
- Make derived memory rebuildable and preserve source provenance.
- Do not select infrastructure from fashion; measure latency, reliability, scale, and cost.
