import { z } from 'zod';
import { OpaqueId, SchemaVersionV1 } from './common.js';
import { MemoryAuthorityClass } from './memory.js';

export const PolicyEffect = z.enum(['allow', 'deny', 'require_approval']);
export type PolicyEffect = z.infer<typeof PolicyEffect>;

export const TurnBudgetV1 = z.object({
  schemaVersion: SchemaVersionV1,
  maxContextTokens: z.number().int().min(1).max(100_000),
  maxOutputTokens: z.number().int().min(1).max(100_000),
  maxRetrievalResults: z.number().int().min(1).max(100),
  maxProviderAttempts: z.number().int().min(1).max(20),
  maxWallTimeMs: z.number().int().min(1).max(3_600_000),
}).strict();
export type TurnBudgetV1 = z.infer<typeof TurnBudgetV1>;

export const PolicyDecisionV1 = z.object({
  schemaVersion: SchemaVersionV1,
  id: OpaqueId,
  effect: PolicyEffect,
  reasonCodes: z.array(z.string().trim().min(1)).min(1),
  allowedScopes: z.array(z.string().trim().min(1)),
  allowedMemorySpaces: z.array(OpaqueId),
  allowedAuthorityClasses: z.array(MemoryAuthorityClass),
  sensitivityCeiling: z.string().trim().min(1),
  budget: TurnBudgetV1,
  approvalRequestId: OpaqueId.optional(),
}).strict().superRefine((decision, context) => {
  if (decision.effect === 'allow') {
    if (decision.allowedMemorySpaces.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['allowedMemorySpaces'],
        message: 'Allowed turns require at least one authorized memory space.',
      });
    }
    if (decision.allowedAuthorityClasses.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['allowedAuthorityClasses'],
        message: 'Allowed turns require at least one authorized authority class.',
      });
    }
  }

  if (decision.effect === 'require_approval' && !decision.approvalRequestId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['approvalRequestId'],
      message: 'Approval-gated decisions require an approval request identifier.',
    });
  }
});
export type PolicyDecisionV1 = z.infer<typeof PolicyDecisionV1>;
