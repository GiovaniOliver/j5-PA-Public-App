import { z } from 'zod';
import { IsoDateTime, OpaqueId, SchemaVersionV1 } from './common.js';

export const MemoryAuthorityClass = z.enum([
  'transactional_record',
  'source_evidence',
  'wiki_synthesis',
  'accepted_claim',
  'graph_path',
  'workflow_state',
  'audit_event',
]);
export type MemoryAuthorityClass = z.infer<typeof MemoryAuthorityClass>;

export const CitationV1 = z.object({
  schemaVersion: SchemaVersionV1,
  citationId: OpaqueId,
  sourceId: OpaqueId,
  sourceRevisionId: OpaqueId.optional(),
  evidenceChunkId: OpaqueId.optional(),
  label: z.string().trim().min(1),
  locator: z.string().trim().min(1).optional(),
}).strict();
export type CitationV1 = z.infer<typeof CitationV1>;

export const ContextItemV1 = z.object({
  schemaVersion: SchemaVersionV1,
  id: OpaqueId,
  authorityClass: MemoryAuthorityClass,
  content: z.string().trim().min(1),
  citations: z.array(CitationV1),
  observedAt: IsoDateTime,
  validFrom: IsoDateTime.optional(),
  validTo: IsoDateTime.optional(),
  freshness: z.enum(['live', 'fresh', 'stale', 'unknown']),
  sensitivity: z.string().trim().min(1),
}).strict();
export type ContextItemV1 = z.infer<typeof ContextItemV1>;

export const MemoryQueryV1 = z.object({
  schemaVersion: SchemaVersionV1,
  tenantId: OpaqueId,
  workspaceId: OpaqueId,
  actorId: OpaqueId,
  objective: z.string().trim().min(1),
  allowedMemorySpaces: z.array(OpaqueId),
  allowedAuthorityClasses: z.array(MemoryAuthorityClass).min(1),
  sensitivityCeiling: z.string().trim().min(1),
  retrievalModes: z.array(z.enum(['transactional', 'lexical', 'vector', 'wiki', 'graph'])).min(1),
  maxResults: z.number().int().min(1).max(100),
  maxContextTokens: z.number().int().min(1).max(100_000),
}).strict();
export type MemoryQueryV1 = z.infer<typeof MemoryQueryV1>;

export const ContextPackageV1 = z.object({
  schemaVersion: SchemaVersionV1,
  retrievalReceiptId: OpaqueId,
  items: z.array(ContextItemV1),
  conflictsDetected: z.boolean(),
  truncated: z.boolean(),
  generatedAt: IsoDateTime,
}).strict();
export type ContextPackageV1 = z.infer<typeof ContextPackageV1>;
