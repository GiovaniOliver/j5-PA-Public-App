import assert from "node:assert/strict";
import test from "node:test";
import {
 AgentRegistry, CapabilityRegistry, WorkflowRegistry, HarnessCore,
 GovernedTurnRunner, ModelTurnRunner, CapabilityDeniedError, ApprovalRequiredError,
} from "../dist/index.js";

const actor = { actorId:"operator", actorType:"human", tenantId:"tenant-A", workspaceId:"workspace-A", roles:["operator"] };
const context = { actor, requestId:"request-1", traceId:"trace-1", startedAt:"2026-10-21T00:00:00.000Z" };
const request = { providerId:"provider", modelId:"model", messages:[{role:"user",content:"Hello"}], maxOutputTokens:32 };
const modelProvider = { complete:async()=>({providerId:"provider",modelId:"model",content:"Requested status",usage:{inputTokens:1,outputTokens:2},completedAt:"2026-10-21T00:00:00.000Z"}) };
function fixture(decision) {
 let executed = 0;
 const capabilityId="read-status";
 const agents = new AgentRegistry([{id:"operator-agent",version:"1.0.0",displayName:"Operator",description:"Fixture",domains:["ops"],capabilityIds:[capabilityId]}]);
 const capabilities = new CapabilityRegistry([{
   manifest:{id:capabilityId,version:"1.0.0",description:"Read status",inputSchema:"status-input:v1",outputSchema:"status-output:v1",requiredPermissions:["status:read"],risk:"low",executionModes:["direct"]},
   inputValidator:{schemaId:"status-input:v1",parse(input){if(typeof input?.scope !== "string")throw Error("Invalid scope");return input;}},
   outputValidator:{schemaId:"status-output:v1",parse(output){if(output?.ok !== true)throw Error("Invalid output");return output;}},
   executor:{async execute(_ctx,_manifest,input){executed++;return {ok:true,scope:input.scope};}},
 }]);
 const workflows=new WorkflowRegistry([],agents,capabilities);
 const policy={authorizeCapability:async(ctx)=> {
   if(ctx.actor.workspaceId!=="workspace-A")return {allowed:false,approvalRequired:false,policyVersion:"v1",reasonCode:"SCOPE_DENIED"};
   return decision;
 }};
 const harness=new HarnessCore({agents,capabilities,workflows,policy,workflowRuntime:{start:async()=>({runId:"run",traceId:"trace"}),cancel:async()=>{}}});
 const runner=new GovernedTurnRunner(new ModelTurnRunner(new Map([["provider",modelProvider]])),harness);
 return {runner,getExecutionCount:()=>executed};
}
test("registered policy-approved capability executes exactly once",async()=>{
 const {runner,getExecutionCount}=fixture({allowed:true,approvalRequired:false,policyVersion:"v1",reasonCode:"ALLOW"});
 const result=await runner.run(context,{model:request,action:{capabilityId:"read-status",input:{scope:"status"}}});
 assert.deepEqual(result.action.output,{ok:true,scope:"status"});assert.equal(getExecutionCount(),1);
});
test("denial forbids execution",async()=>{
 const {runner,getExecutionCount}=fixture({allowed:false,approvalRequired:false,policyVersion:"v1",reasonCode:"BLOCK"});
 await assert.rejects(runner.run(context,{model:request,action:{capabilityId:"read-status",input:{scope:"status"}}}),CapabilityDeniedError);
 assert.equal(getExecutionCount(),0);
});
test("approval-required forbids execution without approval",async()=>{
 const {runner,getExecutionCount}=fixture({allowed:false,approvalRequired:true,policyVersion:"v1",reasonCode:"REVIEW"});
 await assert.rejects(runner.run(context,{model:request,action:{capabilityId:"read-status",input:{scope:"status"}}}),ApprovalRequiredError);
 assert.equal(getExecutionCount(),0);
});
test("workspace boundary refuses cross-workspace invocation",async()=>{
 const {runner,getExecutionCount}=fixture({allowed:true,approvalRequired:false,policyVersion:"v1",reasonCode:"ALLOW"});
 await assert.rejects(runner.run({...context,actor:{...actor,workspaceId:"workspace-B"}},{model:request,action:{capabilityId:"read-status",input:{scope:"status"}}}),CapabilityDeniedError);
 assert.equal(getExecutionCount(),0);
});
test("invalid capability input is rejected before execution",async()=>{
 const {runner,getExecutionCount}=fixture({allowed:true,approvalRequired:false,policyVersion:"v1",reasonCode:"ALLOW"});
 await assert.rejects(runner.run(context,{model:request,action:{capabilityId:"read-status",input:{scope:42}}}),/CAPABILITY_INPUT_INVALID|Capability input failed validation/);
 assert.equal(getExecutionCount(),0);
});
