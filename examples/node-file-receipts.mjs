import { appendFile, mkdir, open } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Developer-preview append-only JSONL sink. Host supplies a trusted absolute path.
 * Do not expose this path to agents or use local disk for multi-replica deployments.
 */
export function createJsonlReceiptSink(path) {
 if (typeof path !== "string" || !path.startsWith("/") || path.includes("\0")) {
   throw new Error("A trusted absolute receipt file path is required");
 }
 return {
  async record(receipt) {
   if (!receipt || typeof receipt.requestId !== "string" ||
       typeof receipt.traceId !== "string" || typeof receipt.workspaceId !== "string" ||
       !["model_completed","model_failed","action_completed","action_failed"].includes(receipt.outcome)) {
     throw new Error("Invalid receipt");
   }
   await mkdir(dirname(path), { recursive: true, mode: 0o700 });
   const handle = await open(path, "a", 0o600);
   try {
     await handle.writeFile(JSON.stringify(receipt) + "\n", "utf8");
     await handle.sync();
   } finally {
     await handle.close();
   }
  },
 };
}
