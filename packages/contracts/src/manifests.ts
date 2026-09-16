import { z } from 'zod';
import {
  CapabilityReadiness,
  OpaqueId,
  RiskClass,
  SchemaVersionV1,
} from './common.js';

export const DomainAgentId = z.enum(['j0', 'j1', 'j2', 'j3', 'j4']);
export type DomainAgentId = z.infer<typeof DomainAgentId>;

export const DomainAgentManifestV1 = z.object({
  schemaVersion: SchemaVersionV1,
  id: DomainAgentId,
  manifestVersion: z.string().trim().min(1),
  name: z.string().trim().min(1),
  purpose: z.string().trim().min(1),
  routingDescription: z.string().trim().min(1),
  supportedModuleNamespaces: z.array(z.string().trim().min(1)),
  allowedCapabilityIds: z.array(OpaqueId),
  allowedWorkflowIds: z.array(OpaqueId),
  memorySpaces: z.array(OpaqueId),
  sensitivityCeiling: z.string().trim().min(1),
  defaultRiskClass: RiskClass,
}).strict();
export type DomainAgentManifestV1 = z.infer<typeof DomainAgentManifestV1>;

export const CapabilityManifestV1 = z.object({
  schemaVersion: SchemaVersionV1,
  id: OpaqueId,
  capabilityVersion: z.string().trim().min(1),
  owner: z.string().trim().min(1),
  readiness: CapabilityReadiness,
  inputSchemaId: OpaqueId,
  outputSchemaId: OpaqueId,
  effect: z.enum(['read', 'draft', 'write', 'external_effect']),
  requiredScopes: z.array(z.string().trim().min(1)),
  supportedDomainAgentIds: z.array(DomainAgentId),
  riskClass: RiskClass,
  approvalPolicyId: OpaqueId,
  timeoutMs: z.number().int().positive(),
  maxAttempts: z.number().int().min(1).max(20),
  supportsCancellation: z.boolean(),
  requiresIdempotencyKey: z.boolean(),
  implementationAdapterId: OpaqueId.optional(),
}).strict().superRefine((manifest, context) => {
  if (manifest.readiness === 'ready' && !manifest.implementationAdapterId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['implementationAdapterId'],
      message: 'Ready capabilities require an implementation adapter.',
    });
  }
});
export type CapabilityManifestV1 = z.infer<typeof CapabilityManifestV1>;

export const WorkflowExecutionMode = z.enum([
  'direct',
  'deterministic',
  'queued',
  'langgraph',
]);
export type WorkflowExecutionMode = z.infer<typeof WorkflowExecutionMode>;

export const WorkflowManifestV1 = z.object({
  schemaVersion: SchemaVersionV1,
  id: OpaqueId,
  workflowVersion: z.string().trim().min(1),
  owner: z.union([DomainAgentId, z.literal('j5-platform')]),
  executionMode: WorkflowExecutionMode,
  inputSchemaId: OpaqueId,
  outputSchemaId: OpaqueId,
  stateSchemaId: OpaqueId.optional(),
  allowedCapabilityIds: z.array(OpaqueId),
  memorySpaces: z.array(OpaqueId),
  riskClass: RiskClass,
  approvalNodeIds: z.array(OpaqueId),
  timeoutMs: z.number().int().positive(),
  maxSteps: z.number().int().min(1).max(1_000),
  maxAttempts: z.number().int().min(1).max(20),
  supportsCancellation: z.boolean(),
  requiresIdempotencyKey: z.boolean(),
  checkpointPolicy: z.enum(['none', 'ephemeral', 'durable']),
}).strict().superRefine((manifest, context) => {
  if (manifest.executionMode === 'langgraph' && !manifest.stateSchemaId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['stateSchemaId'],
      message: 'LangGraph workflows require a versioned state schema.',
    });
  }
  if (manifest.executionMode === 'langgraph' && manifest.checkpointPolicy !== 'durable') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['checkpointPolicy'],
      message: 'LangGraph workflows require durable checkpoints.',
    });
  }
});
export type WorkflowManifestV1 = z.infer<typeof WorkflowManifestV1>;
