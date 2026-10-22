import assert from "node:assert/strict";
import test from "node:test";
import { ModelTurnRunner, ModelTurnError } from "./model-turn.js";
import type { RequestContext, ModelProvider, ModelRequest } from "@j5/harness-contracts";

const context: RequestContext = {
  actor: { actorId: "test-actor", actorType: "human", tenantId: "test-tenant", workspaceId: "test-workspace", roles: ["operator"] },
  requestId: "test-request", traceId: "test-trace", startedAt: "2026-10-21T00:00:00.000Z",
};
const request: ModelRequest = {
  providerId: "test-provider", modelId: "test-model",
  messages: [{ role: "user", content: "hello" }], maxOutputTokens: 128,
};
const response = {
  providerId: "test-provider", modelId: "test-model", content: "hello back",
  usage: { inputTokens: 2, outputTokens: 2 }, completedAt: "2026-10-21T00:00:00.000Z",
};
const provider: ModelProvider = { complete: async () => response };
function hasCode(code: string) {
  return (error: unknown) => error instanceof ModelTurnError && error.code === code;
}

test("validates and returns a matching provider result", async () => {
  const runner = new ModelTurnRunner(new Map([["test-provider", provider]]));
  assert.deepEqual(await runner.complete(context, request), response);
});

test("missing provider fails explicitly without fallback", async () => {
  const runner = new ModelTurnRunner(new Map());
  await assert.rejects(runner.complete(context, request), hasCode("MODEL_PROVIDER_MISSING"));
});

test("rejects unknown actor workspace", async () => {
  const runner = new ModelTurnRunner(new Map([["test-provider", provider]]));
  const invalid = { ...context, actor: { ...context.actor, workspaceId: "" } };
  await assert.rejects(runner.complete(invalid, request), hasCode("REQUEST_CONTEXT_INVALID"));
});

test("rejects malformed model request", async () => {
  const runner = new ModelTurnRunner(new Map([["test-provider", provider]]));
  await assert.rejects(runner.complete(context, { ...request, maxOutputTokens: 0 }), hasCode("MODEL_REQUEST_INVALID"));
});

test("rejects response for another provider or model", async () => {
  const runner = new ModelTurnRunner(new Map([["test-provider", {
    complete: async () => ({ ...response, providerId: "other-provider" }),
  }]]));
  await assert.rejects(runner.complete(context, request), hasCode("MODEL_RESPONSE_INVALID"));
});

test("surfaces actual provider failure", async () => {
  const runner = new ModelTurnRunner(new Map([["test-provider", {
    complete: async () => { throw new Error("provider unavailable"); },
  }]]));
  await assert.rejects(runner.complete(context, request), /provider unavailable/);
});
