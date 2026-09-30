import {
  AgentManifestSchema,
  CapabilityInvocationCommandSchema,
  CapabilityManifestSchema,
  PolicyDecisionSchema,
  RequestContextSchema,
  WorkflowStartResultSchema,
  WorkflowCancelCommandSchema,
  WorkflowManifestSchema,
  WorkflowStartCommandSchema,
} from "@j5/harness-contracts";
import type {
  AgentManifest,
  CapabilityExecutor,
  CapabilityManifest,
  Identifier,
  PolicyEngine,
  RequestContext,
  RuntimeValidator,
  WorkflowManifest,
  WorkflowRuntime,
} from "@j5/harness-contracts";

export type HarnessErrorCode =
  | "HARNESS_CONFIGURATION_INVALID"
  | "REQUEST_CONTEXT_INVALID"
  | "WORKFLOW_COMMAND_INVALID"
  | "CAPABILITY_INPUT_INVALID"
  | "CAPABILITY_OUTPUT_INVALID"
  | "CAPABILITY_DENIED"
  | "APPROVAL_REQUIRED"
  | "POLICY_DECISION_INVALID"
  | "WORKFLOW_RUNTIME_INVALID";

export class HarnessError extends Error {
  constructor(readonly code: HarnessErrorCode, message: string) {
    super(message);
    this.name = "HarnessError";
  }
}

export class HarnessConfigurationError extends HarnessError {
  constructor(message: string) {
    super("HARNESS_CONFIGURATION_INVALID", message);
    this.name = "HarnessConfigurationError";
  }
}

export class RequestContextValidationError extends HarnessError {
  constructor() {
    super("REQUEST_CONTEXT_INVALID", "Request context failed validation");
    this.name = "RequestContextValidationError";
  }
}

export class WorkflowCommandValidationError extends HarnessError {
  constructor(message: string) {
    super("WORKFLOW_COMMAND_INVALID", message);
    this.name = "WorkflowCommandValidationError";
  }
}

export class CapabilityInputValidationError extends HarnessError {
  constructor() {
    super("CAPABILITY_INPUT_INVALID", "Capability input failed validation");
    this.name = "CapabilityInputValidationError";
  }
}

export class CapabilityOutputValidationError extends HarnessError {
  constructor() {
    super("CAPABILITY_OUTPUT_INVALID", "Capability output failed validation");
    this.name = "CapabilityOutputValidationError";
  }
}

export class PolicyDecisionValidationError extends HarnessError {
  constructor() {
    super("POLICY_DECISION_INVALID", "Policy adapter returned an invalid decision");
    this.name = "PolicyDecisionValidationError";
  }
}

export class WorkflowRuntimeValidationError extends HarnessError {
  constructor() {
    super("WORKFLOW_RUNTIME_INVALID", "Workflow runtime returned an invalid start result");
    this.name = "WorkflowRuntimeValidationError";
  }
}

export class CapabilityDeniedError extends HarnessError {
  constructor(readonly reasonCode: string) {
    super("CAPABILITY_DENIED", `Capability invocation denied by policy: ${reasonCode}`);
    this.name = "CapabilityDeniedError";
  }
}

export class ApprovalRequiredError extends HarnessError {
  constructor(readonly reasonCode: string) {
    super("APPROVAL_REQUIRED", `Capability invocation requires approval: ${reasonCode}`);
    this.name = "ApprovalRequiredError";
  }
}

function parseRequestContext(context: RequestContext): RequestContext {
  try {
    return RequestContextSchema.parse(context);
  } catch {
    throw new RequestContextValidationError();
  }
}

export interface RegisteredCapability {
  manifest: CapabilityManifest;
  inputValidator: RuntimeValidator;
  outputValidator: RuntimeValidator;
  executor: CapabilityExecutor;
}

export class AgentRegistry {
  private readonly agents = new Map<Identifier, AgentManifest>();

  constructor(manifests: readonly AgentManifest[]) {
    for (const candidate of manifests) {
      let manifest: AgentManifest;
      try {
        manifest = AgentManifestSchema.parse(candidate);
      } catch {
        throw new HarnessConfigurationError("Agent manifest failed validation");
      }
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
    for (const candidate of entries) {
      let manifest: CapabilityManifest;
      try {
        manifest = CapabilityManifestSchema.parse(candidate.manifest);
      } catch {
        throw new HarnessConfigurationError("Capability manifest failed validation");
      }
      const entry = { ...candidate, manifest };
      const capabilityId = entry.manifest.id;
      if (!capabilityId.trim() || !entry.manifest.version.trim()) {
        throw new HarnessConfigurationError("Capability manifests require an ID and version");
      }
      if (entry.inputValidator.schemaId !== manifest.inputSchema) {
        throw new HarnessConfigurationError(
          `Input validator ${entry.inputValidator.schemaId} does not match ${manifest.inputSchema}`,
        );
      }
      if (entry.outputValidator.schemaId !== manifest.outputSchema) {
        throw new HarnessConfigurationError(
          `Output validator ${entry.outputValidator.schemaId} does not match ${manifest.outputSchema}`,
        );
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

export interface RegisteredWorkflow {
  manifest: WorkflowManifest;
  inputValidator: RuntimeValidator;
  outputValidator: RuntimeValidator;
}

export class WorkflowRegistry {
  private readonly workflows = new Map<Identifier, RegisteredWorkflow>();

  constructor(
    entries: readonly RegisteredWorkflow[],
    agents: AgentRegistry,
    capabilities: CapabilityRegistry,
  ) {
    for (const candidate of entries) {
      let manifest: WorkflowManifest;
      try {
        manifest = WorkflowManifestSchema.parse(candidate.manifest);
      } catch {
        throw new HarnessConfigurationError("Workflow manifest failed validation");
      }
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
      if (candidate.inputValidator.schemaId !== manifest.inputSchema) {
        throw new HarnessConfigurationError(
          `Workflow input validator ${candidate.inputValidator.schemaId} does not match ${manifest.inputSchema}`,
        );
      }
      if (candidate.outputValidator.schemaId !== manifest.outputSchema) {
        throw new HarnessConfigurationError(
          `Workflow output validator ${candidate.outputValidator.schemaId} does not match ${manifest.outputSchema}`,
        );
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
      this.workflows.set(manifest.id, { ...candidate, manifest });
    }
  }

  get(workflowId: Identifier): RegisteredWorkflow {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new HarnessConfigurationError(`Workflow manifest is not registered: ${workflowId}`);
    }
    return workflow;
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

  async invokeCapability(
    context: RequestContext,
    capabilityId: Identifier,
    input: unknown,
  ): Promise<unknown> {
    const validatedContext = parseRequestContext(context);
    let command: { capabilityId: Identifier; input: unknown; idempotencyKey?: string | undefined };
    try {
      command = CapabilityInvocationCommandSchema.parse({ capabilityId, input });
    } catch {
      throw new CapabilityInputValidationError();
    }

    const { manifest, inputValidator, outputValidator, executor } =
      this.dependencies.capabilities.get(command.capabilityId);
    let validatedInput: unknown;
    try {
      validatedInput = inputValidator.parse(command.input);
    } catch {
      throw new CapabilityInputValidationError();
    }

    const rawDecision = await this.dependencies.policy.authorizeCapability(
      validatedContext,
      manifest,
      validatedInput,
    );
    let decision;
    try {
      decision = PolicyDecisionSchema.parse(rawDecision);
    } catch {
      throw new PolicyDecisionValidationError();
    }
    if (decision.approvalRequired) {
      throw new ApprovalRequiredError(decision.reasonCode);
    }
    if (!decision.allowed) {
      throw new CapabilityDeniedError(decision.reasonCode);
    }

    const output = await executor.execute<unknown, unknown>(
      validatedContext,
      manifest,
      validatedInput,
    );
    try {
      return outputValidator.parse(output);
    } catch {
      throw new CapabilityOutputValidationError();
    }
  }

  startWorkflow(
    context: RequestContext,
    workflowId: Identifier,
    input: unknown,
    idempotencyKey?: string,
  ): Promise<{ runId: Identifier; traceId: string }> {
    const validatedContext = parseRequestContext(context);
    let command: { workflowId: Identifier; input: unknown; idempotencyKey?: string | undefined };
    try {
      command = WorkflowStartCommandSchema.parse({ workflowId, input, idempotencyKey });
    } catch {
      throw new WorkflowCommandValidationError("Workflow command failed validation");
    }

    const { manifest, inputValidator } = this.dependencies.workflows.get(command.workflowId);
    if (manifest.idempotencyRequired && !command.idempotencyKey) {
      throw new WorkflowCommandValidationError(
        `Workflow ${command.workflowId} requires an idempotency key`,
      );
    }

    let validatedInput: unknown;
    try {
      validatedInput = inputValidator.parse(command.input);
    } catch {
      throw new WorkflowCommandValidationError("Workflow input failed validation");
    }

    return this.dependencies.workflowRuntime
      .start(validatedContext, manifest, validatedInput, command.idempotencyKey)
      .then((result) => {
        try {
          return WorkflowStartResultSchema.parse(result);
        } catch {
          throw new WorkflowRuntimeValidationError();
        }
      });
  }

  cancelWorkflow(context: RequestContext, runId: Identifier): Promise<void> {
    const validatedContext = parseRequestContext(context);
    let command: { runId: Identifier };
    try {
      command = WorkflowCancelCommandSchema.parse({ runId });
    } catch {
      throw new WorkflowCommandValidationError("Workflow cancellation failed validation");
    }
    return this.dependencies.workflowRuntime.cancel(validatedContext, command.runId);
  }
}
