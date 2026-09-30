/** Stable, portable contracts shared by J5 harness implementations. */

export type Identifier = string;

export interface ActorContext {
  /** Authenticated human, service, or agent identity. Never inferred by a package. */
  actorId: Identifier;
  actorType: "human" | "service" | "agent";
  tenantId: Identifier;
  workspaceId: Identifier;
  roles: readonly string[];
}

export interface RequestContext {
  actor: ActorContext;
  requestId: Identifier;
  traceId: Identifier;
  startedAt: string;
}

export type ExecutionMode = "direct" | "deterministic" | "queued" | "graph";
export type RiskClass = "low" | "moderate" | "high" | "critical";

export interface AgentManifest {
  id: Identifier;
  version: string;
  displayName: string;
  description: string;
  domains: readonly string[];
  capabilityIds: readonly Identifier[];
}

export interface CapabilityManifest {
  id: Identifier;
  version: string;
  description: string;
  inputSchema: string;
  outputSchema: string;
  requiredPermissions: readonly string[];
  risk: RiskClass;
  executionModes: readonly ExecutionMode[];
}

export interface WorkflowManifest {
  id: Identifier;
  version: string;
  ownerAgentId: Identifier;
  executionMode: ExecutionMode;
  inputSchema: string;
  outputSchema: string;
  stateSchema: string;
  allowedCapabilityIds: readonly Identifier[];
  memoryReadScopes: readonly string[];
  memoryWritePolicy: "none" | "propose" | "approved";
  risk: RiskClass;
  approvalRequired: boolean;
  timeoutMs: number;
  maxAttempts: number;
  idempotencyRequired: boolean;
  maxSteps: number;
  maxCost: { amount: number; currency: string };
  checkpointRetention: "ephemeral" | "workflow" | "audited";
}

export type MemoryAuthority =
  | "operational_record"
  | "source_evidence"
  | "approved_synthesis"
  | "derived_projection";

export interface MemoryContextItem {
  id: Identifier;
  workspaceId: Identifier;
  authority: MemoryAuthority;
  content: string;
  sourceId: Identifier;
  sourceRevision: string;
  observedAt: string;
  freshness: "current" | "stale" | "unknown";
  citations: readonly MemoryCitation[];
}

export interface MemoryCitation {
  sourceId: Identifier;
  sourceRevision: string;
  locator: string;
  excerpt?: string;
}

export interface SourceRevision {
  sourceId: Identifier;
  revision: string;
  mediaType: string;
  contentHash: string;
  capturedAt: string;
  locator: string;
}

export interface WikiPage {
  pageId: Identifier;
  revision: string;
  title: string;
  markdown: string;
  updatedAt: string;
  citations: readonly MemoryCitation[];
}

export interface GraphPath {
  nodeIds: readonly Identifier[];
  relationIds: readonly Identifier[];
  citations: readonly MemoryCitation[];
}

export interface ModelMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface ModelRequest {
  providerId: Identifier;
  modelId: string;
  messages: readonly ModelMessage[];
  maxOutputTokens: number;
  responseFormat?: "text" | "json";
}

export interface ModelResponse {
  providerId: Identifier;
  modelId: string;
  content: string;
  usage: { inputTokens: number; outputTokens: number };
  completedAt: string;
}

export interface PolicyDecision {
  allowed: boolean;
  policyVersion: string;
  reasonCode: string;
  approvalRequired: boolean;
}

export interface PolicyEngine {
  authorizeCapability(
    context: RequestContext,
    capability: CapabilityManifest,
    input: unknown,
  ): Promise<PolicyDecision>;
}

export interface ModelProvider {
  complete(context: RequestContext, request: ModelRequest): Promise<ModelResponse>;
}

export interface CapabilityExecutor {
  execute<TInput, TOutput>(
    context: RequestContext,
    capability: CapabilityManifest,
    input: TInput,
  ): Promise<TOutput>;
}

export interface RetrievalReceipt {
  id: Identifier;
  requestId: Identifier;
  traceId: Identifier;
  workspaceId: Identifier;
  retrievedAt: string;
  sourceIds: readonly Identifier[];
  memoryItemIds: readonly Identifier[];
  policyVersion: string;
}

export interface EvidenceStore {
  getSourceRevision(
    context: RequestContext,
    sourceId: Identifier,
    revision: string,
  ): Promise<SourceRevision>;
}

export interface WikiStore {
  readPage(
    context: RequestContext,
    pageId: Identifier,
    revision?: string,
  ): Promise<WikiPage>;
}

export interface VectorStore {
  search(
    context: RequestContext,
    query: string,
    limit: number,
  ): Promise<readonly MemoryContextItem[]>;
}

export interface GraphStore {
  traverse(
    context: RequestContext,
    startEntityId: Identifier,
    maxDepth: number,
    maxNodes: number,
  ): Promise<readonly GraphPath[]>;
}

export interface WorkflowRuntime {
  start<TInput>(
    context: RequestContext,
    manifest: WorkflowManifest,
    input: TInput,
    idempotencyKey?: string,
  ): Promise<{ runId: Identifier; traceId: Identifier }>;
  cancel(context: RequestContext, runId: Identifier): Promise<void>;
}

export * from "./schemas.js";
