import assert from "node:assert/strict";
import test from "node:test";
import { GovernedTurnRunner, ModelTurnRunner } from "../dist/index.js";

const context = {
  actor: { actorId: "actor", actorType: "human", tenantId: "tenant", workspaceId: "workspace", roles: ["operator"] },
  requestId: "request-1", traceId: "trace-1", startedAt: "2026-10-21T00:00:00.000Z",
};
const model = { providerId: "provider", modelId: "model", messages: [{ role: "user", content: "hi" }], maxOutputTokens: 50 };
const response = { providerId: "provider", modelId: "model", content: "ok", usage: { inputTokens: 1, outputTokens: 1 }, completedAt: "2026-10-21T00:00:00.000Z" };
function models() { return new ModelTurnRunner(new Map([["provider", { complete: async () => response }]])); }

test("model-only governed turn does not invoke capabilities", async () => {
  const runner = new GovernedTurnRunner(models(), { invokeCapability: () => { throw Error("Unexpected action"); } });
  const result = await runner.run(context, { model });
  assert.equal(result.traceId, "trace-1");
  assert.equal(result.action, undefined);
});
test("explicit governed action returns validated execution result", async () => {
  const runner = new GovernedTurnRunner(models(), { invokeCapability: async (_, id, value) => {
    assert.equal(id, "read-report");
    return { received: value.query };
  } });
  const result = await runner.run(context, { model, action: { capabilityId: "read-report", input: { query: "status" } } });
  assert.deepEqual(result.action, { capabilityId: "read-report", output: { received: "status" }, verifiedBy: "output-schema" });
});
test("denied capability propagates and does not return a completed action", async () => {
  const runner = new GovernedTurnRunner(models(), { invokeCapability: async () => { throw Error("CAPABILITY_DENIED"); } });
  await assert.rejects(runner.run(context, { model, action: { capabilityId: "restricted", input: {} } }), /CAPABILITY_DENIED/);
});
test("model failure prevents capability execution", async () => {
  let actionCount = 0;
  const badModels = new ModelTurnRunner(new Map());
  const runner = new GovernedTurnRunner(badModels, { invokeCapability: async () => { actionCount++; } });
  await assert.rejects(runner.run(context, { model, action: { capabilityId: "action", input: {} } }), /not registered/);
  assert.equal(actionCount, 0);
});
