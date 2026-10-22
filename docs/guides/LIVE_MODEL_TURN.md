# Run the provider-neutral model-turn example

This is a **developer example**, not a production J5 server, managed cloud service, or a demonstration of completed agent capability execution. It exercises the validated model request/response boundary with a real OpenAI API request.

Requirements: Node.js 22+, pnpm 10.30.3, and your own OpenAI API key.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm --filter @j5/harness-core test
OPENAI_API_KEY=your-key pnpm exec node examples/openai-model-turn.mjs
```

Optional: set `J5_MODEL_ID` to a supported chat-completions model available to your account.

The example uses a synthetic tenant, actor, and workspace, and prints only assistant output and request metadata. It reads credentials from the environment and never commits them. The host remains responsible for authenticating identities, workspace isolation, quota controls, logging, and permissions. The adapter intentionally does not retry, infer missing credentials, or select an alternative model.

Next milestone: add a policy-controlled capability into the turn lifecycle, evidence and action receipts, and end-to-end approval/denial tests.
