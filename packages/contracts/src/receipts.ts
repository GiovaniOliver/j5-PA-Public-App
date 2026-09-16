import { z } from 'zod';
import { IsoDateTime, OpaqueId, SchemaVersionV1 } from './common.js';

export const ReceiptOutcome = z.enum(['succeeded', 'failed', 'denied', 'cancelled']);
export type ReceiptOutcome = z.infer<typeof ReceiptOutcome>;

export const RetrievalReceiptV1 = z.object({
  schemaVersion: SchemaVersionV1,
  id: OpaqueId,
  tenantId: OpaqueId,
  workspaceId: OpaqueId,
  actorId: OpaqueId,
  purpose: z.string().trim().min(1),
  policyDecisionId: OpaqueId,
  selectedContextItemIds: z.array(OpaqueId),
  omittedCandidateCount: z.number().int().nonnegative(),
  truncated: z.boolean(),
  createdAt: IsoDateTime,
}).strict();
export type RetrievalReceiptV1 = z.infer<typeof RetrievalReceiptV1>;

export const ActionReceiptV1 = z.object({
  schemaVersion: SchemaVersionV1,
  id: OpaqueId,
  tenantId: OpaqueId,
  workspaceId: OpaqueId,
  actorId: OpaqueId,
  turnId: OpaqueId,
  capabilityId: OpaqueId.optional(),
  workflowId: OpaqueId.optional(),
  policyDecisionId: OpaqueId,
  approvalId: OpaqueId.optional(),
  idempotencyKey: OpaqueId.optional(),
  safeParameterSummary: z.record(z.unknown()),
  outcome: ReceiptOutcome,
  verificationSummary: z.string().trim().min(1),
  createdAt: IsoDateTime,
}).strict().refine(
  (receipt) => Boolean(receipt.capabilityId) !== Boolean(receipt.workflowId),
  { message: 'Exactly one capabilityId or workflowId is required.' },
);
export type ActionReceiptV1 = z.infer<typeof ActionReceiptV1>;
