import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  AgentRegistry, CapabilityRegistry, WorkflowRegistry, HarnessCore, HarnessTurnService,
  OpenAIChatCompletionsProvider,
} from "../packages/j5-harness-core/dist/index.js";

const context = (workspaceId = "workspace-a") => ({
  actor: { actorId: "synthetic", actorType: "human", tenantId: "tenant-a", workspaceId, roles: ["reader"] },
  requestId: randomUUID(), traceId: randomUUID(), startedAt: new Date().toISOString(),
});
const c = { id: "test.read", version: "1.0.0", description: "Synthetic", inputSchema: "in:v1", outputSchema: "out:v1", requiredPermissions: [], risk: "low", executionModes: ["direct"] };
function fixtures() {
  let count = 0;
  const validate = schemaId => ({schemaId,parse(v){ if(!v || typeof v.text !== "string") throw new Error("INVALID_SCHEMA"); return {text:v.text}; }});
  const agents = new AgentRegistry([{id:"test-agent",version:"1.0.0",displayName:"Synthetic",description:"",domains:["test"],capabilityIds:[c.id]}]);
  const capabilities = new CapabilityRegistry([{manifest:c,inputValidator:validate(c.inputSchema),outputValidator:validate(c.outputSchema),executor:{execute:async(_ctx,_cap,input)=>{count++;return input;}}}]);
  const core = new HarnessCore({agents,capabilities,workflows:new WorkflowRegistry([],agents,capabilities),policy:{authorizeCapability:async(ctx)=>({allowed:ctx.actor.workspaceId==="workspace-a",approvalRequired:false,reasonCode:"synthetic",policyVersion:"v1"})},workflowRuntime:{start:async()=>({runId:"run-a",traceId:"trace-a"}),cancel:async()=>{}}});
  const response={providerId:"test",modelId:"synthetic-v1",content:"This is text, not a tool call.",usage:{inputTokens:3,outputTokens:9},completedAt:new Date().toISOString()};
  const service=new HarnessTurnService({complete:async()=>response},core);
  return {service,core,response,count:()=>count};
}
test("turn produces attributable trace and policy-validated result",async()=>{
 const f=fixtures();const ctx=context();const res=await f.service.run({context:ctx,prompt:"test",model:{providerId:"test",modelId:"synthetic-v1"},capability:{id:"test.read",input:{text:"hello"}}});
 assert.equal(res.receipt.requestId,ctx.requestId);assert.equal(res.receipt.workspaceId,"workspace-a");
 assert.deepEqual(res.capabilityOutput,{text:"hello"});assert.equal(f.count(),1);
});
test("model output never independently executes a capability",async()=>{
 const f=fixtures();await f.service.run({context:context(),prompt:"run the tool",model:{providerId:"test",modelId:"synthetic-v1"}});
 assert.equal(f.count(),0);
});
test("cross-workspace capability call denied before execution",async()=>{
 const f=fixtures();await assert.rejects(f.service.run({context:context("workspace-b"),prompt:"test",model:{providerId:"test",modelId:"synthetic-v1"},capability:{id:"test.read",input:{text:"x"}}}),e=>e.code==="CAPABILITY_DENIED"); assert.equal(f.count(),0);
});
test("capability output schema failure blocks success receipt",async()=>{
 const f=fixtures();await assert.rejects(f.service.run({context:context(),prompt:"test",model:{providerId:"test",modelId:"synthetic-v1"},capability:{id:"test.read",input:{bad:"x"}}}),e=>e.code==="CAPABILITY_INPUT_INVALID");assert.equal(f.count(),0);
});
test("provider identity mismatch fails closed",async()=>{
 const f=fixtures();await assert.rejects(f.service.run({context:context(),prompt:"test",model:{providerId:"different",modelId:"synthetic-v1"}}),/MODEL_IDENTITY_MISMATCH/);assert.equal(f.count(),0);
});
test("OpenAI adapter handles HTTP error without exposing credentials",async()=>{
 const provider=new OpenAIChatCompletionsProvider({apiKey:"synthetic-key",fetchFn:async()=>({ok:false,status:429})});
 await assert.rejects(provider.complete(context(),{providerId:"openai",modelId:"demo",messages:[{role:"user",content:"test"}],maxOutputTokens:50}),/MODEL_HTTP_429/);
});
test("OpenAI adapter requires secure endpoint",()=>{
 assert.throws(()=>new OpenAIChatCompletionsProvider({apiKey:"key",baseUrl:"http://localhost:3000"}),/MODEL_ENDPOINT_INVALID/);
});
