# J5 Harness Core

`@j5/harness-core` is the provider-neutral application layer for a single J5 turn. J5 is the harness; J0–J4 are domain agents registered inside it.

## Canonical turn lifecycle

1. Validate the authenticated tenant/workspace request context.
2. Route from request text plus non-sensitive domain manifests.
3. Validate the route against the selected domain-agent manifest.
4. Evaluate policy for the actor, route, target, and domain.
5. Intersect policy memory access with the domain manifest.
6. Retrieve an authorized context package through the Memory Router.
7. Generate through a provider gateway under the policy budget.
8. Reject context references that are not in the authorized package.
9. Verify the generated result.
10. Persist an action receipt and return harness-owned citations.

Routing occurs before policy because policy must evaluate the selected target. Routing receives only the request and public manifest metadata; policy still runs before any personal or workspace memory is accessed.

## First executable slice

The package currently executes a direct capability turn, matching the initial vertical slice:

> authenticated project-note question → J5 → J2 → authorized evidence → verified, cited response → receipts

Workflow targets are represented in the contracts but fail closed until the workflow runtime is implemented. LangGraph is therefore not pulled into the simple read path.

## Ports

Infrastructure is injected behind ports for policy, routing, memory, model providers, verification, receipts, clocks, and identifiers. Production adapters can use Postgres, queues, provider SDKs, or LangGraph without coupling those technologies to the canonical lifecycle.

The in-memory domain-agent registry validates manifests and refuses duplicate J0–J4 identifiers. J5 cannot be registered as a domain agent because the shared contract excludes it by construction.

## Test posture

Tests use synthetic tenants, workspaces, actors, notes, and receipts. They cover policy-before-memory ordering, tenant/workspace propagation, allowlist enforcement, no-evidence failure, citation provenance, typed errors, and duplicate manifest rejection.
