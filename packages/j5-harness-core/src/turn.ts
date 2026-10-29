import {
  ModelRequestSchema, ModelResponseSchema, RequestContextSchema,
} from "@j5/harness-contracts";
import type {
  ModelProvider, ModelRequest, ModelResponse, RequestContext, ModelMessage,
} from "@j5/harness-contracts";
import { HarnessCore, RequestContextValidationError } from "./index.js";

/** A bounded provider adapter, not an authorization boundary. The host owns authentication. */
export class OpenAIChatCompletionsProvider implements ModelProvider {
  constructor(private readonly options: {
    apiKey: string;
    baseUrl?: string;
    timeoutMs?: number;
    fetchFn?: typeof fetch;
  }) {
    if (!options.apiKey.trim()) throw new Error("MODEL_CREDENTIAL_MISSING");
    const endpoint = new URL(options.baseUrl ?? "https://api.openai.com/v1/chat/completions");
    if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password || endpoint.hash) {
      throw new Error("MODEL_ENDPOINT_INVALID");
    }
  }

  async complete(context: RequestContext, request: ModelRequest): Promise<ModelResponse> {
    if (!RequestContextSchema.safeParse(context).success) throw new RequestContextValidationError();
    const input = ModelRequestSchema.parse(request);
    if (input.providerId !== "openai") throw new Error("MODEL_PROVIDER_UNSUPPORTED");
    const endpoint = this.options.baseUrl ?? "https://api.openai.com/v1/chat/completions";
    const abort = new AbortController();
    const timeoutMs = Math.min(120_000, Math.max(1_000, this.options.timeoutMs ?? 30_000));
    const timeout = setTimeout(() => abort.abort(), timeoutMs);
    try {
      const res = await (this.options.fetchFn ?? fetch)(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.options.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: input.modelId,
          messages: input.messages,
          max_completion_tokens: input.maxOutputTokens,
          ...(input.responseFormat === "json" ? { response_format: { type: "json_object" } } : {}),
        }),
        signal: abort.signal,
      });
      if (!res.ok) throw new Error(`MODEL_HTTP_${res.status}`);
      const raw: unknown = await res.json();
      if (!raw || typeof raw !== "object") throw new Error("MODEL_RESPONSE_INVALID");
      const data = raw as {
        choices?: Array<{ message?: { content?: unknown } }>;
        usage?: { prompt_tokens?: unknown; completion_tokens?: unknown };
      };
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== "string") throw new Error("MODEL_RESPONSE_INVALID");
      const result: ModelResponse = {
        providerId: "openai", modelId: input.modelId, content,
        usage: {
          inputTokens: Number(data.usage?.prompt_tokens ?? 0),
          outputTokens: Number(data.usage?.completion_tokens ?? 0),
        },
        completedAt: new Date().toISOString(),
      };
      return ModelResponseSchema.parse(result);
    } finally {
      clearTimeout(timeout);
    }
  }
}

export interface TurnReceipt {
  requestId: string;
  traceId: string;
  tenantId: string;
  workspaceId: string;
  providerId: string;
  modelId: string;
  result: "completed";
  usage: { inputTokens: number; outputTokens: number };
  capabilityId?: string;
}

export class HarnessTurnService {
  constructor(
    private readonly provider: ModelProvider,
    private readonly core: HarnessCore,
  ) {}

  /** Phase-1 explicit tool selection. LLM text is NEVER parsed into executable commands. */
  async run(input: {
    context: RequestContext;
    model: { providerId: string; modelId: string; maxOutputTokens?: number };
    prompt: string;
    systemPrompt?: string;
    capability?: { id: string; input: unknown };
  }): Promise<{ answer: string; capabilityOutput?: unknown; receipt: TurnReceipt }> {
    const parsed = RequestContextSchema.safeParse(input.context);
    if (!parsed.success) throw new RequestContextValidationError();
    if (typeof input.prompt !== "string" || !input.prompt.trim() || input.prompt.length > 100_000) {
      throw new Error("TURN_PROMPT_INVALID");
    }
    const messages: ModelMessage[] = [];
    if (input.systemPrompt) messages.push({ role: "system", content: input.systemPrompt });
    messages.push({ role: "user", content: input.prompt });
    const request = ModelRequestSchema.parse({
      providerId: input.model.providerId,
      modelId: input.model.modelId,
      messages,
      maxOutputTokens: input.model.maxOutputTokens ?? 512,
    });
    const modelResponse = ModelResponseSchema.parse(await this.provider.complete(parsed.data, request));
    if (modelResponse.providerId !== request.providerId || modelResponse.modelId !== request.modelId) {
      throw new Error("MODEL_IDENTITY_MISMATCH");
    }
    // Only an explicit caller-supplied capability enters the core's policy gate.
    // Never execute an instruction copied from untrusted model output.
    const capabilityOutput = input.capability
      ? await this.core.invokeCapability(parsed.data, input.capability.id, input.capability.input)
      : undefined;
    return {
      answer: modelResponse.content,
      ...(input.capability ? { capabilityOutput } : {}),
      receipt: {
        requestId: parsed.data.requestId, traceId: parsed.data.traceId,
        tenantId: parsed.data.actor.tenantId, workspaceId: parsed.data.actor.workspaceId,
        providerId: modelResponse.providerId, modelId: modelResponse.modelId,
        result: "completed", usage: modelResponse.usage,
        ...(input.capability ? { capabilityId: input.capability.id } : {}),
      },
    };
  }
}
