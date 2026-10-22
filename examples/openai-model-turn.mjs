import { ModelTurnRunner } from "../packages/j5-harness-core/dist/index.js";

const key = process.env.OPENAI_API_KEY;
const modelId = process.env.J5_MODEL_ID || "gpt-4.1-mini";
if (!key) {
  console.error("OPENAI_API_KEY is required for this live example.");
  process.exitCode = 1;
} else {
  const runner = new ModelTurnRunner(new Map([["openai", {
    async complete(_context, request) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: request.modelId,
          messages: request.messages,
          max_completion_tokens: request.maxOutputTokens,
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) throw new Error(`OpenAI provider HTTP ${response.status}`);
      const result = await response.json();
      if (typeof result.choices?.[0]?.message?.content !== "string") {
        throw new Error("OpenAI response omitted assistant text");
      }
      return {
        providerId: "openai", modelId: request.modelId,
        content: result.choices[0].message.content,
        usage: {
          inputTokens: result.usage?.prompt_tokens ?? 0,
          outputTokens: result.usage?.completion_tokens ?? 0,
        },
        completedAt: new Date().toISOString(),
      };
    },
  }]]));
  const context = {
    actor: { actorId: "example-operator", actorType: "human", tenantId: "example-tenant", workspaceId: "example-workspace", roles: ["operator"] },
    requestId: crypto.randomUUID(), traceId: crypto.randomUUID(), startedAt: new Date().toISOString(),
  };
  const output = await runner.complete(context, {
    providerId: "openai", modelId,
    messages: [{ role: "user", content: "Say hello from J5 in one sentence." }],
    maxOutputTokens: 128,
  });
  console.log(output.content);
  console.log(JSON.stringify({ traceId: context.traceId, provider: output.providerId, model: output.modelId, usage: output.usage }));
}
