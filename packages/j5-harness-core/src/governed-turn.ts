import type { ModelRequest, ModelResponse, RequestContext, Identifier } from "@j5/harness-contracts";
import type { HarnessCore } from "./index.js";
import { ModelTurnRunner } from "./model-turn.js";

/**
 * Deliberately explicit, host-selected capability invocation.
 * Model text is NOT interpreted as a tool call. The host must validate a
 * capability request and grant policy before the executor can run.
 */
export interface GovernedTurnInput {
  model: ModelRequest;
  action?: { capabilityId: Identifier; input: unknown };
}
export interface GovernedTurnResult {
  response: ModelResponse;
  requestId: Identifier;
  traceId: Identifier;
  action?: { capabilityId: Identifier; output: unknown; verifiedBy: "output-schema" };
}

export interface TurnReceiptSink {
  record(receipt: {
    requestId: Identifier;
    traceId: Identifier;
    workspaceId: Identifier;
    capabilityId?: Identifier;
    outcome: "model_completed" | "action_completed" | "action_failed" | "model_failed";
    occurredAt: string;
  }): Promise<void>;
}

export class GovernedTurnRunner {
  constructor(
    private readonly models: ModelTurnRunner,
    private readonly harness: HarnessCore,
    private readonly receipts?: TurnReceiptSink,
  ) {}

  async run(context: RequestContext, input: GovernedTurnInput): Promise<GovernedTurnResult> {
    // A provider failure prevents all actions. Action execution is gated by the
    // capability registry, validator and policy engine in HarnessCore.
    const record = async (outcome: "model_completed" | "action_completed" | "action_failed" | "model_failed") => {
      if (!this.receipts) return;
      await this.receipts.record({
        requestId: context.requestId,
        traceId: context.traceId,
        workspaceId: context.actor.workspaceId,
        ...(input.action ? { capabilityId: input.action.capabilityId } : {}),
        outcome,
        occurredAt: new Date().toISOString(),
      });
    };
    let response: ModelResponse;
    try {
      response = await this.models.complete(context, input.model);
    } catch (error) {
      await record("model_failed");
      throw error;
    }
    const result: GovernedTurnResult = {
      response,
      requestId: context.requestId,
      traceId: context.traceId,
    };
    if (!input.action) {
      await record("model_completed");
      return result;
    }
    let output: unknown;
    try {
      output = await this.harness.invokeCapability(context, input.action.capabilityId, input.action.input);
    } catch (error) {
      await record("action_failed");
      throw error;
    }
    await record("action_completed");
    return {
      ...result,
      action: {
        capabilityId: input.action.capabilityId,
        output,
        verifiedBy: "output-schema",
      },
    };
  }
}
