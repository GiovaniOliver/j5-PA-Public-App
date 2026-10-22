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

export class GovernedTurnRunner {
  constructor(private readonly models: ModelTurnRunner, private readonly harness: HarnessCore) {}

  async run(context: RequestContext, input: GovernedTurnInput): Promise<GovernedTurnResult> {
    // A provider failure prevents all actions. Action execution is gated by the
    // capability registry, validator and policy engine in HarnessCore.
    const response = await this.models.complete(context, input.model);
    const result: GovernedTurnResult = {
      response,
      requestId: context.requestId,
      traceId: context.traceId,
    };
    if (!input.action) return result;
    const output = await this.harness.invokeCapability(context, input.action.capabilityId, input.action.input);
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
