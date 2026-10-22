# J5 developer-preview receipt persistence

The core `TurnReceiptSink` is intentionally backend-neutral. The opt-in `examples/node-file-receipts.mjs` adapter writes an append-only newline-delimited JSON file on a host-controlled local filesystem.

- Pass a trusted absolute path, not a path supplied by the agent or user.
- Persist the directory on a private writable volume with strict access controls. The adapter attempts modes 0700 for new directories and 0600 for new files. Pre-existing permissions still require operator review.
- Individual records include request, trace and workspace identifiers and action outcome; do not store API credentials or full conversation payloads.
- File append and sync are for a **single-instance developer preview**, not multi-process ordering, transactional durability, authorization to read receipts, retention, backup or tamper-evident auditing.
- For hosted or business use, implement an authenticated, workspace-filtered transactional database adapter with append-only access, error handling, encryption/retention and recovery testing.

Check local tests with `node --test examples/node-file-receipts.test.mjs` after installing dependencies for the rest of the project. No network credentials are required.
