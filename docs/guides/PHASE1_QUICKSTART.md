# Run J5 Phase 1 locally

Node.js 22+ and pnpm 10.30.3 are required.

```bash
git clone https://github.com/GiovaniOliver/j5-PA-Public-App.git
cd j5-PA-Public-App
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
```

Run the model-backed example after building:

```bash
pnpm build
export OPENAI_API_KEY="YOUR_OWN_API_KEY"
# Optional: export J5_DEMO_MODEL="a chat-completions-compatible model available to you"
node examples/real-provider.mjs
```

This example invokes a **read-only synthetic in-memory echo** with explicit workspace identity and a policy decision. It makes an actual provider call if credentials are present. It does not expose an HTTP server, persist workflow state, use model-generated tool calls, request approvals, or grant filesystem/network access to an agent.

The API key must come from the operator's environment, never from git or a UI prompt saved to the repository. Avoid sharing terminal output containing sensitive prompts. For the first release, a host adapter will eventually own authenticated actors, a secrets provider, request tracing and spending limits.

## Phase 1 verification gates

- `pnpm typecheck` and `pnpm test` pass on clean Node 22.
- No secrets or private documents in the public source tree.
- A real provider-backed demo completes with a configured API key.
- Denied tool access and invalid context fail closed in synthetic tests.
- Workflow persistence, asynchronous approvals and full provider-directed tool calling are **not** claims of this phase.

See [the parity backlog](../docs/architecture/PUBLIC_PARITY_BACKLOG_2026-10-28.md).
