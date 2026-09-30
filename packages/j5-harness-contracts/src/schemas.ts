import { z } from "zod";

const identifierSchema = z
  .string()
  .min(1)
  .max(256)
  .refine((value) => value === value.trim(), "Identifier cannot have surrounding whitespace");

const schemaIdSchema = z
  .string()
  .min(1)
  .max(256)
  .regex(/:v[1-9]\d*$/, "Schema IDs must end in an immutable version suffix")
  .refine((value) => value === value.trim(), "Schema IDs cannot have surrounding whitespace");
const semanticVersionSchema = z
  .string()
  .max(64)
  .regex(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/,
    "Expected a semantic version",
  );
const boundedTextSchema = z.string().min(1).max(100_000);
const nonNegativeIntegerSchema = z.number().int().min(0);
const positiveIntegerSchema = z.number().int().min(1);
const uniqueIdentifierListSchema = z
  .array(identifierSchema)
  .refine((values) => new Set(values).size === values.length, "Values must be unique");

export const ActorContextSchema = z.strictObject({
  actorId: identifierSchema,
  actorType: z.enum(["human", "service", "agent"]),
  tenantId: identifierSchema,
  workspaceId: identifierSchema,
  roles: uniqueIdentifierListSchema,
});

export const RequestContextSchema = z.strictObject({
  actor: ActorContextSchema,
  requestId: identifierSchema,
  traceId: identifierSchema,
  startedAt: z.iso.datetime(),
});

export const ExecutionModeSchema = z.enum(["direct", "deterministic", "queued", "graph"]);
export const RiskClassSchema = z.enum(["low", "moderate", "high", "critical"]);

export const AgentManifestSchema = z.strictObject({
  id: identifierSchema,
  version: semanticVersionSchema,
  displayName: boundedTextSchema.max(256),
  description: z.string().max(10_000),
  domains: uniqueIdentifierListSchema,
  capabilityIds: uniqueIdentifierListSchema,
});

export const CapabilityManifestSchema = z.strictObject({
  id: identifierSchema,
  version: semanticVersionSchema,
  description: z.string().max(10_000),
  inputSchema: schemaIdSchema,
  outputSchema: schemaIdSchema,
  requiredPermissions: uniqueIdentifierListSchema,
  risk: RiskClassSchema,
  executionModes: z.array(ExecutionModeSchema).min(1).refine(
    (values) => new Set(values).size === values.length,
    "Execution modes must be unique",
  ),
});

export const WorkflowManifestSchema = z.strictObject({
  id: identifierSchema,
  version: semanticVersionSchema,
  ownerAgentId: identifierSchema,
  executionMode: ExecutionModeSchema,
  inputSchema: schemaIdSchema,
  outputSchema: schemaIdSchema,
  stateSchema: schemaIdSchema,
  allowedCapabilityIds: uniqueIdentifierListSchema,
  memoryReadScopes: uniqueIdentifierListSchema,
  memoryWritePolicy: z.enum(["none", "propose", "approved"]),
  risk: RiskClassSchema,
  approvalRequired: z.boolean(),
  timeoutMs: positiveIntegerSchema,
  maxAttempts: positiveIntegerSchema,
  idempotencyRequired: z.boolean(),
  maxSteps: positiveIntegerSchema,
  maxCost: z.strictObject({
    amount: z.number().finite().min(0),
    currency: identifierSchema.max(16),
  }),
  checkpointRetention: z.enum(["ephemeral", "workflow", "audited"]),
});

export const MemoryAuthoritySchema = z.enum([
  "operational_record",
  "source_evidence",
  "approved_synthesis",
  "derived_projection",
]);

export const MemoryCitationSchema = z.strictObject({
  sourceId: identifierSchema,
  sourceRevision: identifierSchema,
  locator: boundedTextSchema,
  excerpt: z.string().max(100_000).optional(),
});

export const MemoryContextItemSchema = z.strictObject({
  id: identifierSchema,
  workspaceId: identifierSchema,
  authority: MemoryAuthoritySchema,
  content: z.string().max(1_000_000),
  sourceId: identifierSchema,
  sourceRevision: identifierSchema,
  observedAt: z.iso.datetime(),
  freshness: z.enum(["current", "stale", "unknown"]),
  citations: z.array(MemoryCitationSchema).max(10_000),
});

export const SourceRevisionSchema = z.strictObject({
  sourceId: identifierSchema,
  revision: identifierSchema,
  mediaType: identifierSchema.max(256),
  contentHash: identifierSchema.max(256),
  capturedAt: z.iso.datetime(),
  locator: boundedTextSchema,
});

export const WikiPageSchema = z.strictObject({
  pageId: identifierSchema,
  revision: identifierSchema,
  title: boundedTextSchema.max(512),
  markdown: z.string().max(1_000_000),
  updatedAt: z.iso.datetime(),
  citations: z.array(MemoryCitationSchema).max(10_000),
});

export const GraphPathSchema = z.strictObject({
  nodeIds: z.array(identifierSchema).min(1).max(10_000),
  relationIds: z.array(identifierSchema).max(10_000),
  citations: z.array(MemoryCitationSchema).max(10_000),
});

export const ModelMessageSchema = z.strictObject({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string().max(1_000_000),
});

export const ModelRequestSchema = z.strictObject({
  providerId: identifierSchema,
  modelId: identifierSchema,
  messages: z.array(ModelMessageSchema).min(1).max(10_000),
  maxOutputTokens: positiveIntegerSchema,
  responseFormat: z.enum(["text", "json"]).optional(),
});

export const ModelResponseSchema = z.strictObject({
  providerId: identifierSchema,
  modelId: identifierSchema,
  content: z.string().max(1_000_000),
  usage: z.strictObject({
    inputTokens: nonNegativeIntegerSchema,
    outputTokens: nonNegativeIntegerSchema,
  }),
  completedAt: z.iso.datetime(),
});

export const PolicyDecisionSchema = z.strictObject({
  allowed: z.boolean(),
  policyVersion: identifierSchema,
  reasonCode: identifierSchema,
  approvalRequired: z.boolean(),
});

export const RetrievalReceiptSchema = z.strictObject({
  id: identifierSchema,
  requestId: identifierSchema,
  traceId: identifierSchema,
  workspaceId: identifierSchema,
  retrievedAt: z.iso.datetime(),
  sourceIds: uniqueIdentifierListSchema,
  memoryItemIds: uniqueIdentifierListSchema,
  policyVersion: identifierSchema,
});

/** Host-facing commands deliberately omit actor context; the authenticated host attaches it. */
export const CapabilityInvocationCommandSchema = z.strictObject({
  capabilityId: identifierSchema,
  input: z.unknown(),
});

export const WorkflowStartCommandSchema = z.strictObject({
  workflowId: identifierSchema,
  input: z.unknown(),
  idempotencyKey: identifierSchema.optional(),
});

export const WorkflowCancelCommandSchema = z.strictObject({
  runId: identifierSchema,
});

export const GraphTraversalRequestSchema = z.strictObject({
  startEntityId: identifierSchema,
  maxDepth: z.number().int().min(0).max(64),
  maxNodes: positiveIntegerSchema.max(100_000),
});

export interface RuntimeValidator {
  /** Immutable schema reference; schema revisions must use a new identifier. */
  schemaId: string;
  parse(value: unknown): unknown;
}

export const WorkflowStartResultSchema = z.strictObject({
  runId: identifierSchema,
  traceId: identifierSchema,
});
