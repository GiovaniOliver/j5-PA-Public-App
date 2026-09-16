import { describe, expect, it } from 'vitest';
import {
  ActorContextV1,
  CapabilityManifestV1,
  DomainAgentId,
  PolicyDecisionV1,
  RouteDecisionV1,
  WorkflowManifestV1,
} from './index.js';

describe('J5 harness contract invariants', () => {
  it('requires explicit tenant and workspace scope', () => {
    const result = ActorContextV1.safeParse({
      schemaVersion: '1',
      actorId: 'actor-1',
      userId: 'user-1',
      tenantId: 'tenant-1',
      membershipId: 'member-1',
      roles: ['member'],
      sessionId: 'session-1',
      channel: 'web',
      authenticatedAt: '2026-09-16T20:00:00Z',
    });

    expect(result.success).toBe(false);
  });

  it('does not model J5 as a domain agent', () => {
    expect(DomainAgentId.safeParse('j5').success).toBe(false);
  });

  it('does not expose a ready capability without an implementation', () => {
    const result = CapabilityManifestV1.safeParse({
      schemaVersion: '1',
      id: 'knowledge.read',
      capabilityVersion: '1.0.0',
      owner: 'knowledge',
      readiness: 'ready',
      inputSchemaId: 'knowledge.read.input.v1',
      outputSchemaId: 'knowledge.read.output.v1',
      effect: 'read',
      requiredScopes: ['knowledge:read'],
      supportedDomainAgentIds: ['j2'],
      riskClass: 'read',
      approvalPolicyId: 'approval.read.v1',
      timeoutMs: 5_000,
      maxAttempts: 1,
      supportsCancellation: false,
      requiresIdempotencyKey: false,
    });

    expect(result.success).toBe(false);
  });

  it('requires durable state for LangGraph workflows', () => {
    const result = WorkflowManifestV1.safeParse({
      schemaVersion: '1',
      id: 'knowledge.graph.construct',
      workflowVersion: '1.0.0',
      owner: 'j5-platform',
      executionMode: 'langgraph',
      inputSchemaId: 'graph.construct.input.v1',
      outputSchemaId: 'graph.construct.output.v1',
      allowedCapabilityIds: ['knowledge.read'],
      memorySpaces: ['knowledge'],
      riskClass: 'draft',
      approvalNodeIds: [],
      timeoutMs: 600_000,
      maxSteps: 30,
      maxAttempts: 2,
      supportsCancellation: true,
      requiresIdempotencyKey: true,
      checkpointPolicy: 'ephemeral',
    });

    expect(result.success).toBe(false);
  });

  it('requires usable memory authority for an allowed policy decision', () => {
    const result = PolicyDecisionV1.safeParse({
      schemaVersion: '1',
      id: 'policy-decision-1',
      effect: 'allow',
      reasonCodes: ['member-read'],
      allowedScopes: ['knowledge:read'],
      allowedMemorySpaces: [],
      allowedAuthorityClasses: [],
      sensitivityCeiling: 'private',
      budget: {
        schemaVersion: '1',
        maxContextTokens: 4_000,
        maxOutputTokens: 1_000,
        maxRetrievalResults: 10,
        maxProviderAttempts: 1,
        maxWallTimeMs: 30_000,
      },
    });

    expect(result.success).toBe(false);
  });

  it('requires exactly one execution target on a route', () => {
    const result = RouteDecisionV1.safeParse({
      schemaVersion: '1',
      id: 'route-1',
      selectedDomainAgentId: 'j2',
      targetType: 'capability',
      capabilityId: 'knowledge.read',
      workflowId: 'knowledge.refresh',
      confidence: 0.9,
      reasonCodes: ['project-question'],
    });

    expect(result.success).toBe(false);
  });
});
