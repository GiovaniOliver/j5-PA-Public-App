import { randomUUID } from "node:crypto";
import {
  AgentRegistry, CapabilityRegistry, WorkflowRegistry,
  HarnessCore, HarnessTurnService, OpenAIChatCompletionsProvider,
} from "../packages/j5-harness-core/dist/index.js";

if (!process.env.OPENAI_API_KEY) {
  console.error("Set OPENAI_API_KEY in your shell before running the real provider example.");
  process.exitCode = 2;
} else {
  const cap = {
    id: "demo.echo", version: "1.0.0", description: "Safe demo-only in-memory echo",
    inputSchema: "demo-input:v1", outputSchema: "demo-output:v1",
    requiredPermissions: ["demo.read"], risk: "low", executionModes: ["direct"],
  };
  const validate = schemaId => ({
    schemaId,
    parse(value) {
      if (!value || typeof value !== "object" || typeof value.message !== "string") throw new Error("DEMO_SCHEMA_INVALID");
      return { message: value.message.slice(0, 250) };
    },
  });
  const agents = new AgentRegistry([{
    id: "demo-agent", version: "1.0.0", displayName: "Demo agent",
    description: "Example using explicit caller identity", domains: ["demo"], capabilityIds: [cap.id],
  }]);
  const capabilities = new CapabilityRegistry([{
    manifest: cap, inputValidator: validate(cap.inputSchema), outputValidator: validate(cap.outputSchema),
    executor: { execute: async (_context, _manifest, data) => ({ message: data.message }) },
  }]);
  const policy = {
    authorizeCapability: async (ctx, manifest) => ({
      allowed: ctx.actor.workspaceId === "demo-workspace" && manifest.id === "demo.echo" && ctx.actor.roles.includes("demo.read"),
      approvalRequired: false, reasonCode: "demo_policy", policyVersion: "demo-policy-1",
    }),
  };
  const core = new HarnessCore({
    agents, capabilities, workflows: new WorkflowRegistry([], agents, capabilities),
    policy,
    workflowRuntime: {
      start: async () => { throw new Error("WORKFLOW_RUNTIME_NOT_CONFIGURED"); },
      cancel: async () => { throw new Error("WORKFLOW_RUNTIME_NOT_CONFIGURED"); },
    },
  });
  const provider = new OpenAIChatCompletionsProvider({ apiKey: process.env.OPENAI_API_KEY });
  const service = new HarnessTurnService(provider, core);
  const result = await service.run({
    context: {
      actor: { actorId: "demo-operator", actorType: "human", tenantId: "demo-tenant", workspaceId: "demo-workspace", roles: ["demo.read"] },
      requestId: randomUUID(), traceId: randomUUID(), startedAt: new Date().toISOString(),
    },
    prompt: "Give one short practical tip for testing an AI agent harness.",
    model: { providerId: "openai", modelId: process.env.J5_DEMO_MODEL || "gpt-4.1-mini", maxOutputTokens: 120 },
    capability: { id: "demo.echo", input: { message: "The demo tool ran through policy validation." } },
  });
  console.log(JSON.stringify(result, null, 2));
}
