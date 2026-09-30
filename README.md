# J5 Public App

J5 is an AI agent harness for running agents and tools as controlled, observable workflows.
It provides the runtime boundary around models and agents: identity and workspace context,
policy, capability execution, durable workflow state, approvals, verification, audit, and
traceable results.

This repository is the public J5 product workspace. It starts with provider-neutral contracts
and a small orchestration core. Provider, storage, queue, and deployment adapters will be
added as separately configured packages. The system does not assume a personal account,
local-user identity, private data source, or provider credential.

## Repository structure

- `packages/j5-harness-contracts` — shared request, agent, capability, workflow, memory, and
  runtime contracts.
- `packages/j5-harness-core` — registries and policy-gated capability/workflow composition.
- `docs/architecture` — product boundary, design decisions, and implementation roadmap.

## Getting started

Requirements: Node.js 22 or later and pnpm 10.30.3.

```sh
pnpm install
pnpm build
```

The project is in early development. The current core delegates provider, policy, approval,
and workflow-runtime behavior to host-supplied adapters. It does not provide a production
server, UI, or built-in provider credentials yet.

## Architecture

Start with [the J5 harness architecture](docs/architecture/J5_HARNESS_ARCHITECTURE.md), then
see the [implementation roadmap](docs/architecture/IMPLEMENTATION_ROADMAP.md).
