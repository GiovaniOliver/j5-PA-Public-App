# J5 Contract and Schema Versioning

**Status:** Initial compatibility policy
**Date:** 2026-09-30

## Version fields

J5 uses separate version identifiers for a package, a registered agent/capability/workflow,
and each input/output/state schema. These versions answer different compatibility questions
and must not be substituted for one another.

- **Package version:** follows semantic versioning. A major release may break exported types
  or runtime behavior; a minor release adds backward-compatible behavior; a patch release
  fixes behavior without changing the public contract.
- **Manifest version:** semantic version for one registered agent, capability, or workflow.
  A change that alters its declared permissions, execution modes, input/output, or state
  compatibility requires a new manifest version.
- **Schema ID:** immutable identifier referenced by a manifest. Use a stable namespace and a
  version suffix, for example `urn:j5:schema:capability.search.input:v1`. Never change the
  meaning of an existing schema ID.

## Compatibility rules

1. A schema ID is immutable after release. A breaking shape or semantic change gets a new
   schema ID and a new manifest version.
2. A backward-compatible optional field may be added under a new package minor version. The
   old schema remains available for consumers pinned to its reference.
3. Removing, renaming, or changing the meaning of a field is breaking and requires a major
   package version and new schema ID.
4. Runtime validators register their exact `schemaId`; the core checks that it matches the
   input/output schema references in the manifest before accepting a capability or workflow.
5. Unknown keys are rejected at the public contract boundary. Versioned schemas must be
   extended deliberately; adapters must not silently strip unexpected request fields.
6. Persisted workflow state records the workflow manifest version and state schema ID used
   to create it. A runtime may resume only state for which it has a declared compatible
   reader or an explicit migration.
7. Deprecation names a removal release and migration path. A schema remains readable for the
   announced compatibility window; silently reinterpreting stored data is forbidden.

## Validation

The contracts package exports Zod schemas for request contexts, manifests, memory records,
model messages, receipts, and command/result envelopes. The core parses actor context and
commands at execution boundaries and validates policy decisions, capability input/output,
and workflow start results. Provider, memory, queue, and observability adapters must parse
external values with the matching exported schema before returning them to the core.

The core returns stable error codes and generic validation messages. It does not attach
untrusted payloads or credential values to validation errors. Adapter diagnostics should
include request/trace IDs and safe issue paths, with sensitive values removed.
