import { ModelRequestSchema, ModelResponseSchema, RequestContextSchema } from "@j5/harness-contracts";
import type { ModelProvider, ModelRequest, ModelResponse, RequestContext } from "@j5/harness-contracts";

/**
 * Minimal provider-neutral turn boundary.
 * A host supplies a real provider adapter and authenticated request context.
 * No automatic retries, silent provider fallback, invented identities, or mock output.
 */
export class ModelTurnError extends Error {
  constructor(
    readonly code: "REQUEST_CONTEXT_INVALID" | "MODEL_REQUEST_INVALID" |
      "MODEL_PROVIDER_MISSING" | "MODEL_RESPONSE_INVALID",
    message: string,
  ) {
    super(message);
    this.name = "ModelTurnError";
  }
}

export class ModelTurnRunner {
  constructor(private readonly providers: ReadonlyMap<string, ModelProvider>) {}

  async complete(context: RequestContext, request: ModelRequest): Promise<ModelResponse> {
    const validatedContext = RequestContextSchema.safeParse(context);
    if (!validatedContext.success) {
      throw new ModelTurnError("REQUEST_CONTEXT_INVALID", "Authenticated request context is invalid");
    }
    const validatedRequest = ModelRequestSchema.safeParse(request);
    if (!validatedRequest.success) {
      throw new ModelTurnError("MODEL_REQUEST_INVALID", "Model request failed validation");
    }
    const provider = this.providers.get(validatedRequest.data.providerId);
    if (!provider) {
      throw new ModelTurnError("MODEL_PROVIDER_MISSING", "Configured model provider is not registered");
    }
    // Preserve adapter errors. Never return simulated success or route to another provider.
    const { responseFormat, ...requiredRequest } = validatedRequest.data;
    const response = await provider.complete(validatedContext.data, {
      ...requiredRequest,
      ...(responseFormat === undefined ? {} : { responseFormat }),
    });
    const validatedResponse = ModelResponseSchema.safeParse(response);
    if (!validatedResponse.success ||
      validatedResponse.data.providerId !== validatedRequest.data.providerId ||
      validatedResponse.data.modelId !== validatedRequest.data.modelId) {
      throw new ModelTurnError("MODEL_RESPONSE_INVALID", "Provider response was invalid or mismatched");
    }
    return validatedResponse.data;
  }
}
