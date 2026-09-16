import { z } from 'zod';
import { IsoDateTime, OpaqueId, RequestChannel, SchemaVersionV1 } from './common.js';

export const ActorContextV1 = z.object({
  schemaVersion: SchemaVersionV1,
  actorId: OpaqueId,
  userId: OpaqueId,
  tenantId: OpaqueId,
  workspaceId: OpaqueId,
  membershipId: OpaqueId,
  roles: z.array(z.string().trim().min(1)).min(1),
  sessionId: OpaqueId,
  channel: RequestChannel,
  authenticatedAt: IsoDateTime,
}).strict();
export type ActorContextV1 = z.infer<typeof ActorContextV1>;

export const DeviceContextV1 = z.object({
  schemaVersion: SchemaVersionV1,
  deviceId: OpaqueId,
  deviceClass: z.string().trim().min(1),
  capabilities: z.array(z.string().trim().min(1)),
  trustLevel: z.enum(['untrusted', 'recognized', 'trusted', 'managed']),
}).strict();
export type DeviceContextV1 = z.infer<typeof DeviceContextV1>;

export const RequestContextV1 = z.object({
  schemaVersion: SchemaVersionV1,
  actor: ActorContextV1,
  device: DeviceContextV1.optional(),
  locale: z.string().trim().min(2),
  timezone: z.string().trim().min(1),
  correlationId: OpaqueId,
  traceId: OpaqueId,
  idempotencyKey: OpaqueId.optional(),
  featureFlags: z.record(z.boolean()).default({}),
}).strict();
export type RequestContextV1 = z.infer<typeof RequestContextV1>;
