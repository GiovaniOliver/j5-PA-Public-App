import { describe, expect, it } from 'vitest';
import type {
  ActionReceiptV1,
  MemoryQueryV1,
  PolicyDecisionV1,
} from '@j5/contracts';
import {
  makeAllowedPolicyDecision,
  makeHarnessTurnRequest,
  makeJ2KnowledgeRoute,
  makeJ2Manifest,
  makeProjectContextPackage,
  makeRequestContext,
} from '@j5/test-kit';
import { InMemoryDomainAgentRegistry } from './domain-agent-registry.js';
import {
  HarnessRuntimeError,
  HarnessTurnService,
  type HarnessTurnServiceDependencies,
} from './harness-turn.service.js';

function makeDependencies(overrides: Partial<HarnessTurnServiceDependencies> = {}) {
  const receipts: ActionReceiptV1[] = [];
  const dependencies: HarnessTurnServiceDependencies = {
    domainAgents: new InMemoryDomainAgentRegistry([makeJ2Manifest()]),
    policyEngine: {
      evaluate: async () => makeAllowedPolicyDecision(),
    },
    intentRouter: {
      route: async () => makeJ2KnowledgeRoute(),
    },
    memoryRouter: {
      retrieve: async () => makeProjectContextPackage(),
    },
    modelGateway: {
      generate: async () => ({
        output: 'We decided to ship the public harness in auditable slices.',
        usedContextItemIds: ['context-item-1'],
        proposedActions: [],
      }),
    },
    verifier: {
      verify: async () => ({ passed: true, summary: 'Grounded in authorized evidence.' }),
    },
    receiptStore: {
      appendActionReceipt: async (receipt) => {
        receipts.push(receipt);
      },
    },
    clock: {
      now: () => '2026-09-16T20:00:02Z',
    },
    ids: {
      next: (namespace) => namespace === 'turn' ? 'turn-1' : 'action-receipt-1',
    },
    ...overrides,
  };
  return { dependencies, receipts };
}

describe('HarnessTurnService', () => {
  it('denies after metadata-only routing and before memory retrieval', async () => {
    let routeCalls = 0;
    let memoryCalls = 0;
    const denied: PolicyDecisionV1 = {
      ...makeAllowedPolicyDecision(),
      effect: 'deny',
      reasonCodes: ['workspace-access-denied'],
      allowedMemorySpaces: [],
      allowedAuthorityClasses: [],
    };
    const { dependencies } = makeDependencies({
      policyEngine: { evaluate: async () => denied },
      intentRouter: {
        route: async () => {
          routeCalls += 1;
          return makeJ2KnowledgeRoute();
        },
      },
      memoryRouter: {
        retrieve: async () => {
          memoryCalls += 1;
          return makeProjectContextPackage();
        },
      },
    });

    await expect(new HarnessTurnService(dependencies).execute({
      context: makeRequestContext(),
      request: makeHarnessTurnRequest(),
    })).rejects.toMatchObject({ detail: { code: 'FORBIDDEN' } });
    expect(routeCalls).toBe(1);
    expect(memoryCalls).toBe(0);
  });

  it('executes an authorized J2 knowledge turn with citations and receipts', async () => {
    let capturedQuery: MemoryQueryV1 | undefined;
    const { dependencies, receipts } = makeDependencies({
      memoryRouter: {
        retrieve: async (query) => {
          capturedQuery = query;
          return makeProjectContextPackage();
        },
      },
    });

    const response = await new HarnessTurnService(dependencies).execute({
      context: makeRequestContext(),
      request: makeHarnessTurnRequest(),
    });

    expect(capturedQuery).toMatchObject({
      tenantId: 'tenant-1',
      workspaceId: 'workspace-1',
      actorId: 'actor-1',
      allowedMemorySpaces: ['projects'],
    });
    expect(response).toMatchObject({
      turnId: 'turn-1',
      routedDomainAgentId: 'j2',
      retrievalReceiptIds: ['retrieval-receipt-1'],
      actionReceiptIds: ['action-receipt-1'],
      citations: [{ citationId: 'citation-1', sourceId: 'project-note-1' }],
    });
    expect(receipts).toHaveLength(1);
    expect(receipts[0]).toMatchObject({
      tenantId: 'tenant-1',
      workspaceId: 'workspace-1',
      capabilityId: 'knowledge.read',
      policyDecisionId: 'policy-decision-1',
      outcome: 'succeeded',
    });
  });

  it('fails closed when authorized retrieval returns no evidence', async () => {
    const emptyPackage = {
      ...makeProjectContextPackage(),
      items: [],
    };
    const { dependencies, receipts } = makeDependencies({
      memoryRouter: { retrieve: async () => emptyPackage },
    });

    await expect(new HarnessTurnService(dependencies).execute({
      context: makeRequestContext(),
      request: makeHarnessTurnRequest(),
    })).rejects.toMatchObject({ detail: { code: 'NO_AUTHORIZED_EVIDENCE' } });
    expect(receipts).toHaveLength(0);
  });

  it('rejects provider references to context that was not authorized', async () => {
    const { dependencies, receipts } = makeDependencies({
      modelGateway: {
        generate: async () => ({
          output: 'An ungrounded answer.',
          usedContextItemIds: ['invented-context-item'],
          proposedActions: [],
        }),
      },
    });

    await expect(new HarnessTurnService(dependencies).execute({
      context: makeRequestContext(),
      request: makeHarnessTurnRequest(),
    })).rejects.toMatchObject({ detail: { code: 'VERIFICATION_FAILURE' } });
    expect(receipts).toHaveLength(0);
  });

  it('rejects a route outside the domain-agent capability allowlist', async () => {
    const { dependencies } = makeDependencies({
      intentRouter: {
        route: async () => ({
          ...makeJ2KnowledgeRoute(),
          capabilityId: 'finance.transfer',
        }),
      },
    });

    await expect(new HarnessTurnService(dependencies).execute({
      context: makeRequestContext(),
      request: makeHarnessTurnRequest(),
    })).rejects.toMatchObject({ detail: { code: 'FORBIDDEN' } });
  });

  it('surfaces typed runtime errors', async () => {
    const { dependencies } = makeDependencies();

    try {
      await new HarnessTurnService(dependencies).execute({ context: {}, request: {} });
      throw new Error('Expected execution to fail.');
    } catch (error) {
      expect(error).toBeInstanceOf(HarnessRuntimeError);
      expect((error as HarnessRuntimeError).detail.code).toBe('INVALID_REQUEST');
    }
  });
});

describe('InMemoryDomainAgentRegistry', () => {
  it('rejects duplicate domain-agent identifiers', () => {
    expect(() => new InMemoryDomainAgentRegistry([
      makeJ2Manifest(),
      makeJ2Manifest(),
    ])).toThrow('Duplicate domain-agent manifest: j2');
  });
});
