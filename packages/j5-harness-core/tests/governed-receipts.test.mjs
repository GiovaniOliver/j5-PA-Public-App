import assert from "node:assert/strict";
import test from "node:test";
import { GovernedTurnRunner, ModelTurnRunner } from "../dist/index.js";

const context={actor:{actorId:"a",actorType:"human",tenantId:"t",workspaceId:"w",roles:["operator"]},requestId:"r",traceId:"trace",startedAt:"2026-10-21T00:00:00.000Z"};
const model={providerId:"p",modelId:"m",messages:[{role:"user",content:"hi"}],maxOutputTokens:32};
const provider={complete:async()=>({providerId:"p",modelId:"m",content:"ok",usage:{inputTokens:1,outputTokens:1},completedAt:"2026-10-21T00:00:00.000Z"})};
test("records completed action with correlation and workspace",async()=>{
 const receipts=[];
 const runner=new GovernedTurnRunner(new ModelTurnRunner(new Map([["p",provider]])),{invokeCapability:async()=>({ok:true})},{record:async r=>{receipts.push(r)}});
 await runner.run(context,{model,action:{capabilityId:"example",input:{}}});
 assert.equal(receipts.length,1);assert.equal(receipts[0].outcome,"action_completed");assert.equal(receipts[0].workspaceId,"w");assert.equal(receipts[0].traceId,"trace");
});
test("denial records failure without fabricating success",async()=>{
 const receipts=[];
 const runner=new GovernedTurnRunner(new ModelTurnRunner(new Map([["p",provider]])),{invokeCapability:async()=>{throw Error("denied")}}, {record:async r=>{receipts.push(r)}});
 await assert.rejects(runner.run(context,{model,action:{capabilityId:"restricted",input:{}}}),/denied/);
 assert.deepEqual(receipts.map(r=>r.outcome),["action_failed"]);
});
test("receipt storage failure is not silently ignored",async()=>{
 const runner=new GovernedTurnRunner(new ModelTurnRunner(new Map([["p",provider]])),{invokeCapability:async()=>({ok:true})},{record:async()=>{throw Error("receipt unavailable")}});
 await assert.rejects(runner.run(context,{model,action:{capabilityId:"example",input:{}}}),/receipt unavailable/);
});
