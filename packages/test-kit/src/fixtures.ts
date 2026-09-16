import {
  ContextPackageV1,
  DomainAgentManifestV1,
  HarnessTurnRequestV1,
  PolicyDecisionV1,
  RequestContextV1,
  RouteDecisionV1,
} from '@j5/contracts';

export function makeRequestContext() {
  return RequestContextV1.parse({
    schemaVersion: '1',
    actor: {
      schemaVersion: '1',
      actorId: 'actor-1',
      userId: 'user-1',
      tenantId: 'tenant-1',
      workspaceId: 'workspace-1',
      membershipId: 'membership-1',
      roles: ['member'],
      sessionId: 'session-1',
      channel: 'web',
      authenticatedAt: '2026-09-16T20:00:00Z',
    },
    locale: 'en-US',
    timezone: 'America/New_York',
    correlationId: 'correlation-1',
    traceId: 'trace-1',
    featureFlags: {},
  });
}

export function makeHarnessTurnRequest() {
  return HarnessTurnRequestV1.parse({
    schemaVersion: '1',
    input: 'What decision did we make about the public launch?',
    requestedDomainAgentId: 'j2',
    attachmentIds: [],
    responseMode: 'text',
  });
}

export function makeJ2Manifest() {
  return DomainAgentManifestV1.parse({
    schemaVersion: '1',
    id: 'j2',
    manifestVersion: '1.0.0',
    name: 'Projects and Work',
    purpose: 'Manage authorized project and work knowledge.',
    routingDescription: 'Project notes, decisions, plans, and work questions.',
    supportedModuleNamespaces: ['projects'],
    allowedCapabilityIds: ['knowledge.read'],
    allowedWorkflowIds: [],
    memorySpaces: ['projects'],
    sensitivityCeiling: 'private',
    defaultRiskClass: 'read',
  });
}

export function makeAllowedPolicyDecision() {
  return PolicyDecisionV1.parse({
    schemaVersion: '1',
    id: 'policy-decision-1',
    effect: 'allow',
    reasonCodes: ['workspace-member-read'],
    allowedScopes: ['knowledge:read'],
    allowedMemorySpaces: ['projects'],
    allowedAuthorityClasses: ['source_evidence', 'wiki_synthesis', 'accepted_claim'],
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
}

export function makeJ2KnowledgeRoute() {
  return RouteDecisionV1.parse({
    schemaVersion: '1',
    id: 'route-1',
    selectedDomainAgentId: 'j2',
    targetType: 'capability',
    capabilityId: 'knowledge.read',
    confidence: 0.98,
    reasonCodes: ['project-note-question'],
  });
}

export function makeProjectContextPackage() {
  return ContextPackageV1.parse({
    schemaVersion: '1',
    retrievalReceiptId: 'retrieval-receipt-1',
    items: [{
      schemaVersion: '1',
      id: 'context-item-1',
      authorityClass: 'source_evidence',
      content: 'The launch decision is to ship the public harness in auditable slices.',
      citations: [{
        schemaVersion: '1',
        citationId: 'citation-1',
        sourceId: 'project-note-1',
        sourceRevisionId: 'project-note-1-revision-3',
        evidenceChunkId: 'project-note-1-chunk-2',
        label: 'Public launch architecture note',
        locator: 'Decision section',
      }],
      observedAt: '2026-09-16T20:00:00Z',
      freshness: 'fresh',
      sensitivity: 'private',
    }],
    conflictsDetected: false,
    truncated: false,
    generatedAt: '2026-09-16T20:00:01Z',
  });
}
