import { z } from 'zod';
import { OpaqueId, SchemaVersionV1 } from './common.js';
import { CitationV1 } from './memory.js';
import { DomainAgentId } from './manifests.js';

export const HarnessTurnRequestV1 = z.object({
  schemaVersion: SchemaVersionV1,
  input: z.string().trim().min(1).max(100_000),
  requestedDomainAgentId: DomainAgentId.optional(),
  requestedModuleId: OpaqueId.optional(),
  attachmentIds: z.array(OpaqueId).max(20).default([]),
  responseMode: z.enum(['text', 'structured', 'stream']).default('text'),
}).strict();
export type HarnessTurnRequestV1 = z.infer<typeof HarnessTurnRequestV1>;

export const ProposedActionV1 = z.object({
  schemaVersion: SchemaVersionV1,
  proposalId: OpaqueId,
  capabilityId: OpaqueId,
  summary: z.string().trim().min(1),
  approvalRequired: z.boolean(),
}).strict();
export type ProposedActionV1 = z.infer<typeof ProposedActionV1>;

export const HarnessTurnResponseV1 = z.object({
  schemaVersion: SchemaVersionV1,
  turnId: OpaqueId,
  routedDomainAgentId: DomainAgentId.optional(),
  output: z.string(),
  citations: z.array(CitationV1),
  proposedActions: z.array(ProposedActionV1),
  retrievalReceiptIds: z.array(OpaqueId),
  actionReceiptIds: z.array(OpaqueId),
  capabilityStatus: z.array(z.object({
    capabilityId: OpaqueId,
    status: z.enum(['used', 'available', 'unavailable', 'approval_required']),
  }).strict()),
}).strict();
export type HarnessTurnResponseV1 = z.infer<typeof HarnessTurnResponseV1>;

export const HarnessErrorCode = z.enum([
  'UNAUTHENTICATED',
  'WORKSPACE_REQUIRED',
  'FORBIDDEN',
  'INVALID_REQUEST',
  'CAPABILITY_UNAVAILABLE',
  'APPROVAL_REQUIRED',
  'BUDGET_EXCEEDED',
  'NO_AUTHORIZED_EVIDENCE',
  'PROVIDER_FAILURE',
  'VERIFICATION_FAILURE',
  'CONFLICT',
  'INTERNAL_ERROR',
]);
export type HarnessErrorCode = z.infer<typeof HarnessErrorCode>;

export const HarnessErrorV1 = z.object({
  schemaVersion: SchemaVersionV1,
  code: HarnessErrorCode,
  message: z.string().trim().min(1),
  retryable: z.boolean(),
  correlationId: OpaqueId,
  setupAction: z.string().trim().min(1).optional(),
}).strict();
export type HarnessErrorV1 = z.infer<typeof HarnessErrorV1>;
