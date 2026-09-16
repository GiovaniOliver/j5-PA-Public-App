import { z } from 'zod';

export const SchemaVersionV1 = z.literal('1');
export type SchemaVersionV1 = z.infer<typeof SchemaVersionV1>;

export const OpaqueId = z.string().trim().min(1).max(200);
export type OpaqueId = z.infer<typeof OpaqueId>;

export const IsoDateTime = z.string().datetime({ offset: true });
export type IsoDateTime = z.infer<typeof IsoDateTime>;

export const RequestChannel = z.enum([
  'web',
  'mobile',
  'voice',
  'watch',
  'automation',
  'device',
  'api',
]);
export type RequestChannel = z.infer<typeof RequestChannel>;

export const RiskClass = z.enum([
  'read',
  'draft',
  'reversible_write',
  'external_communication',
  'financial_or_legal',
  'safety_critical',
]);
export type RiskClass = z.infer<typeof RiskClass>;

export const CapabilityReadiness = z.enum([
  'planned',
  'partial',
  'ready',
  'degraded',
  'disabled',
  'retired',
]);
export type CapabilityReadiness = z.infer<typeof CapabilityReadiness>;
