import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createJsonlReceiptSink } from "./node-file-receipts.mjs";

test("persists append-only receipt lines to an isolated file",async()=>{
 const dir=await mkdtemp(join(tmpdir(),"j5-receipts-"));
 try {
  const path=join(dir,"audit.jsonl");
  const sink=createJsonlReceiptSink(path);
  const entry={requestId:"r",traceId:"t",workspaceId:"w",outcome:"action_completed",occurredAt:"2026-10-21T00:00:00Z"};
  await sink.record(entry);await sink.record({...entry,outcome:"action_failed"});
  const lines=(await readFile(path,"utf8")).trim().split("\n").map(JSON.parse);
  assert.equal(lines.length,2);assert.deepEqual(lines[0],entry);assert.equal(lines[1].outcome,"action_failed");
 } finally {await rm(dir,{recursive:true,force:true});}
});
test("refuses untrusted relative paths and invalid entries",async()=>{
 assert.throws(()=>createJsonlReceiptSink("./receipts.jsonl"),/absolute/);
 await assert.rejects(createJsonlReceiptSink("/tmp/j5-invalid-audit.jsonl").record({outcome:"fake"}),/Invalid receipt/);
});
