import test from "node:test";
import assert from "node:assert/strict";
import {
  AgentRegistry, CapabilityRegistry, WorkflowRegistry, HarnessCore,
  RequestContextValidationError, CapabilityDeniedError, ApprovalRequiredError,
  CapabilityOutputValidationError, WorkflowCommandValidationError,
} from "../packages/j5-harness-core/dist/index.js";

const context = {
  actor: { actorId: "test-human", actorType: "human", tenantId: "tenant-a", workspaceId: "workspace-a", roles: ["editor"] },
  requestId: "req-1", traceId: "trace-1", startedAt: "2026-10-28T12:00:00.000Z",
};
const capability = {
  id: "test.echo", version: "1.0.0", description: "Synthetic echo",
  inputSchema: "echo-input:v1", outputSchema: "echo-output:v1",
  requiredPermissions: [], risk: "low", executionModes: ["direct"],
};
const identityValidator = schemaId => ({ schemaId, parse: value => value });
function makeHarness(decision = { allowed: true, approvalRequired: false, policyVersion: "test-1", reasonCode: "allowed" }, executor = { execute: async (_, __, input) => input }) {
  let calls = 0;
  const wrappedExecutor = { execute: async (...args) => { calls++; return executor.execute(...args); } };
  const agents = new AgentRegistry([{ id: "agent-a", version: "1.0.0", displayName: "Test agent", description: "", domains: ["test"], capabilityIds: ["test.echo"] }]);
  const capabilities = new CapabilityRegistry([{ manifest: capability, inputValidator: identityValidator(capability.inputSchema), outputValidator: identityValidator(capability.outputSchema), executor: wrappedExecutor }]);
  const workflows = new WorkflowRegistry([], agents, capabilities);
  const core = new HarnessCore({
    agents, capabilities, workflows,
    policy: { authorizeCapability: async () => decision },
    workflowRuntime: { start: async () => ({ runId: "run-1", traceId: "trace-1" }), cancel: async () => {} },
  });
  return { core, getCalls: () => calls };
}

test("valid authorized capability invokes registered implementation", async () => {
  const { core, getCalls } = makeHarness();
  assert.deepEqual(await core.invokeCapability(context, "test.echo", { text: "hello" }), { text: "hello" });
  assert.equal(getCalls(), 1);
});
test("missing authenticated actor context fails closed", async () => {
  const { core, getCalls } = makeHarness();
  await assert.rejects(core.invokeCapability({ ...context, actor: { ...context.actor, workspaceId: "" } }, "test.echo", {}), RequestContextValidationError);
  assert.equal(getCalls(), 0);
});
test("policy deny never runs handler", async () => {
  const { core, getCalls } = makeHarness({ allowed: false, approvalRequired: false, policyVersion: "test-1", reasonCode: "forbidden" });
  await assert.rejects(core.invokeCapability(context, "test.echo", {}), CapabilityDeniedError);
  assert.equal(getCalls(), 0);
});
test("approval-required action does not execute", async () => {
  const { core, getCalls } = makeHarness({ allowed: false, approvalRequired: true, policyVersion: "test-1", reasonCode: "operator_approval" });
  await assert.rejects(core.invokeCapability(context, "test.echo", {}), ApprovalRequiredError);
  assert.equal(getCalls(), 0);
});
test("invalid policy response cannot authorize an action", async () => {
  const { core, getCalls } = makeHarness({ allowed: true });
  await assert.rejects(core.invokeCapability(context, "test.echo", {}), error => error.code === "POLICY_DECISION_INVALID");
  assert.equal(getCalls(), 0);
});
test("registered output validation failure surfaces as error", async () => {
  const { core, getCalls } = makeHarness(undefined, { execute: async () => { throw Error("synthetic unexpected execution failure"); } });
  await assert.rejects(core.invokeCapability(context, "test.echo", {}), /synthetic unexpected execution failure/);
  assert.equal(getCalls(), 1);
});
test("unknown workflow cannot be started", () => {
  const { core } = makeHarness();
  assert.throws(() => core.startWorkflow(context, "unknown-workflow", {}), /not registered/);
});
test("cancel command rejects blank run id", () => {
  const { core } = makeHarness();
  assert.throws(() => core.cancelWorkflow(context, ""), WorkflowCommandValidationError);
});
