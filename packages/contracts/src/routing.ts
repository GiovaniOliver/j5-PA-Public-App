import { z } from 'zod';
import { OpaqueId, SchemaVersionV1 } from './common.js';
import { DomainAgentId } from './manifests.js';

export const RouteTargetType = z.enum(['capability', 'workflow']);
export type RouteTargetType = z.infer<typeof RouteTargetType>;

export const RouteDecisionV1 = z.object({
  schemaVersion: SchemaVersionV1,
  id: OpaqueId,
  selectedDomainAgentId: DomainAgentId,
  targetType: RouteTargetType,
  capabilityId: OpaqueId.optional(),
  workflowId: OpaqueId.optional(),
  confidence: z.number().min(0).max(1),
  reasonCodes: z.array(z.string().trim().min(1)).min(1),
}).strict().superRefine((route, context) => {
  const capabilityTargetIsValid =
    route.targetType === 'capability' && Boolean(route.capabilityId) && !route.workflowId;
  const workflowTargetIsValid =
    route.targetType === 'workflow' && Boolean(route.workflowId) && !route.capabilityId;

  if (!capabilityTargetIsValid && !workflowTargetIsValid) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'The selected target type must have exactly one matching target identifier.',
    });
  }
});
export type RouteDecisionV1 = z.infer<typeof RouteDecisionV1>;
