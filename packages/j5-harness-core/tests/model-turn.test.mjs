import assert from "node:assert/strict";
import test from "node:test";
import { ModelTurnRunner, ModelTurnError } from "../dist/index.js";

const context = {
  actor: { actorId: "test-actor", actorType: "human", tenantId: "test-tenant", workspaceId: "test-workspace", roles: ["operator"] },
  requestId: "test-request", traceId: "test-trace", startedAt: "2026-10-21T00:00:00.000Z",
};
const request = { providerId: "test-provider", modelId: "test-model", messages: [{ role: "user", content: "hello" }], maxOutputTokens: 128 };
const response = { providerId: "test-provider", modelId: "test-model", content: "hello back", usage: { inputTokens: 2, outputTokens: 2 }, completedAt: "2026-10-21T00:00:00.000Z" };
const provider = { complete: async () => response };
const hasCode = (code) => (error) => error instanceof ModelTurnError && error.code === code;

test("returns matching validated provider result", async () => {
  assert.deepEqual(await new ModelTurnRunner(new Map([["test-provider", provider]])).complete(context, request), response);
});
test("missing provider fails without fallback", async () => {
  await assert.rejects(new ModelTurnRunner(new Map()).complete(context, request), hasCode("MODEL_PROVIDER_MISSING"));
});
test("invalid actor workspace fails", async () => {
  const bad = { ...context, actor: { ...context.actor, workspaceId: "" } };
  await assert.rejects(new ModelTurnRunner(new Map([["test-provider", provider]])).complete(bad, request), hasCode("REQUEST_CONTEXT_INVALID"));
});
test("invalid model request fails", async () => {
  await assert.rejects(new ModelTurnRunner(new Map([["test-provider", provider]])).complete(context, { ...request, maxOutputTokens: 0 }), hasCode("MODEL_REQUEST_INVALID"));
});
test("mismatched provider response fails", async () => {
  const mismatch = { complete: async () => ({ ...response, providerId: "other" }) };
  await assert.rejects(new ModelTurnRunner(new Map([["test-provider", mismatch]])).complete(context, request), hasCode("MODEL_RESPONSE_INVALID"));
});
test("underlying provider failures propagate", async () => {
  const fail = { complete: async () => { throw new Error("provider unavailable"); } };
  await assert.rejects(new ModelTurnRunner(new Map([["test-provider", fail]])).complete(context, request), /provider unavailable/);
});
