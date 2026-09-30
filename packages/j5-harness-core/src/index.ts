import type {
  AgentManifest,
  CapabilityExecutor,
  CapabilityManifest,
  Identifier,
  PolicyEngine,
  RequestContext,
  WorkflowManifest,
  WorkflowRuntime,
} from "@j5/harness-contracts";

export class HarnessConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HarnessConfigurationError";
  }
}

export class CapabilityDeniedError extends Error {
  readonly reasonCode: string;

  constructor(reasonCode: string) {
    super(`Capability invocation denied by policy: ${reasonCode}`);
    this.name = "CapabilityDeniedError";
    this.reasonCode = reasonCode;
  }
}

export class ApprovalRequiredError extends Error {
  readonly reasonCode: string;

  constructor(reasonCode: string) {
    super(`Capability invocation requires approval: ${reasonCode}`);
    this.name = "ApprovalRequiredError";
    this.reasonCode = reasonCode;
  }
}

export interface RegisteredCapability {
  manifest: CapabilityManifest;
  executor: CapabilityExecutor;
}

export class AgentRegistry {
  private readonly agents = new Map<Identifier, AgentManifest>();

  constructor(manifests: readonly AgentManifest[]) {
    for (const manifest of manifests) {
      if (!manifest.id.trim() || !manifest.version.trim()) {
        throw new HarnessConfigurationError("Agent manifests require an ID and version");
      }
      if (this.agents.has(manifest.id)) {
        throw new HarnessConfigurationError(`Duplicate agent manifest: ${manifest.id}`);
      }
      this.agents.set(manifest.id, manifest);
    }
  }

  get(agentId: Identifier): AgentManifest {
    const manifest = this.agents.get(agentId);
    if (!manifest) {
      throw new HarnessConfigurationError(`Agent manifest is not registered: ${agentId}`);
    }
    return manifest;
  }

  list(): readonly AgentManifest[] {
    return [...this.agents.values()];
  }
}

export class CapabilityRegistry {
  private readonly capabilities = new Map<Identifier, RegisteredCapability>();

  constructor(entries: readonly RegisteredCapability[]) {
    for (const entry of entries) {
      const capabilityId = entry.manifest.id;
      if (!capabilityId.trim() || !entry.manifest.version.trim()) {
        throw new HarnessConfigurationError("Capability manifests require an ID and version");
      }
      if (this.capabilities.has(capabilityId)) {
        throw new HarnessConfigurationError(`Duplicate capability manifest: ${capabilityId}`);
      }
      this.capabilities.set(capabilityId, entry);
    }
  }

  get(capabilityId: Identifier): RegisteredCapability {
    const entry = this.capabilities.get(capabilityId);
    if (!entry) {
      throw new HarnessConfigurationError(
        `Capability handler is not registered: ${capabilityId}`,
      );
    }
    return entry;
  }

  listManifests(): readonly CapabilityManifest[] {
    return [...this.capabilities.values()].map(({ manifest }) => manifest);
  }
}

export class WorkflowRegistry {
  private readonly workflows = new Map<Identifier, WorkflowManifest>();

  constructor(
    manifests: readonly WorkflowManifest[],
    agents: AgentRegistry,
    capabilities: CapabilityRegistry,
  ) {
    for (const manifest of manifests) {
      if (!manifest.id.trim() || !manifest.version.trim()) {
        throw new HarnessConfigurationError("Workflow manifests require an ID and version");
      }
      if (this.workflows.has(manifest.id)) {
        throw new HarnessConfigurationError(`Duplicate workflow manifest: ${manifest.id}`);
      }
      const owner = agents.get(manifest.ownerAgentId);
      if (
        !Number.isFinite(manifest.timeoutMs) || manifest.timeoutMs <= 0 ||
        !Number.isInteger(manifest.maxAttempts) || manifest.maxAttempts < 1 ||
        !Number.isInteger(manifest.maxSteps) || manifest.maxSteps < 1 ||
        !Number.isFinite(manifest.maxCost.amount) || manifest.maxCost.amount < 0 ||
        !manifest.maxCost.currency.trim()
      ) {
        throw new HarnessConfigurationError(`Workflow limits are invalid: ${manifest.id}`);
      }
      for (const capabilityId of manifest.allowedCapabilityIds) {
        const { manifest: capability } = capabilities.get(capabilityId);
        if (!owner.capabilityIds.includes(capabilityId)) {
          throw new HarnessConfigurationError(
            `Workflow ${manifest.id} uses a capability not assigned to ${owner.id}: ${capabilityId}`,
          );
        }
        if (!capability.executionModes.includes(manifest.executionMode)) {
          throw new HarnessConfigurationError(
            `Capability ${capabilityId} does not support ${manifest.executionMode} execution`,
          );
        }
      }
      this.workflows.set(manifest.id, manifest);
    }
  }

  get(workflowId: Identifier): WorkflowManifest {
    const manifest = this.workflows.get(workflowId);
    if (!manifest) {
      throw new HarnessConfigurationError(`Workflow manifest is not registered: ${workflowId}`);
    }
    return manifest;
  }
}

export interface HarnessCoreDependencies {
  agents: AgentRegistry;
  capabilities: CapabilityRegistry;
  workflows: WorkflowRegistry;
  policy: PolicyEngine;
  workflowRuntime: WorkflowRuntime;
}

export class HarnessCore {
  constructor(private readonly dependencies: HarnessCoreDependencies) {}

  async invokeCapability<TInput, TOutput>(
    context: RequestContext,
    capabilityId: Identifier,
    input: TInput,
  ): Promise<TOutput> {
    const { manifest, executor } = this.dependencies.capabilities.get(capabilityId);
    const decision = await this.dependencies.policy.authorizeCapability(
      context,
      manifest,
      input,
    );

    if (decision.approvalRequired) {
      throw new ApprovalRequiredError(decision.reasonCode);
    }
    if (!decision.allowed) {
      throw new CapabilityDeniedError(decision.reasonCode);
    }

    return executor.execute<TInput, TOutput>(context, manifest, input);
  }

  startWorkflow<TInput>(
    context: RequestContext,
    workflowId: Identifier,
    input: TInput,
    idempotencyKey: string,
  ): Promise<{ runId: Identifier; traceId: Identifier }> {
    const manifest = this.dependencies.workflows.get(workflowId);
    if (manifest.idempotencyRequired && idempotencyKey.trim().length === 0) {
      throw new HarnessConfigurationError(
        `Workflow ${workflowId} requires a non-empty idempotency key`,
      );
    }

    return this.dependencies.workflowRuntime.start(
      context,
      manifest,
      input,
      idempotencyKey,
    );
  }

  cancelWorkflow(context: RequestContext, runId: Identifier): Promise<void> {
    return this.dependencies.workflowRuntime.cancel(context, runId);
  }
}
