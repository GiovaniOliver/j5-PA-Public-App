import {
  ActionReceiptV1,
  ContextPackageV1,
  HarnessTurnRequestV1,
  HarnessTurnResponseV1,
  MemoryQueryV1,
  PolicyDecisionV1,
  ProposedActionV1,
  RequestContextV1,
  RouteDecisionV1,
  type CitationV1,
  type HarnessTurnResponseV1 as HarnessTurnResponse,
} from '@j5/contracts';
import type { DomainAgentRegistry } from './domain-agent-registry.js';
import { HarnessRuntimeError, harnessError } from './errors.js';
import type {
  ClockPort,
  IdGeneratorPort,
  IntentRouterPort,
  MemoryRouterPort,
  ModelGatewayPort,
  PolicyEnginePort,
  ReceiptStorePort,
  VerifierPort,
} from './ports.js';

export interface HarnessTurnServiceDependencies {
  domainAgents: DomainAgentRegistry;
  policyEngine: PolicyEnginePort;
  intentRouter: IntentRouterPort;
  memoryRouter: MemoryRouterPort;
  modelGateway: ModelGatewayPort;
  verifier: VerifierPort;
  receiptStore: ReceiptStorePort;
  clock: ClockPort;
  ids: IdGeneratorPort;
}

export class HarnessTurnService {
  constructor(private readonly dependencies: HarnessTurnServiceDependencies) {}

  async execute(input: { context: unknown; request: unknown }): Promise<HarnessTurnResponse> {
    const rawCorrelationId = readCorrelationId(input.context);
    const parsedContext = RequestContextV1.safeParse(input.context);
    if (!parsedContext.success) {
      throw harnessError({
        code: 'INVALID_REQUEST',
        message: 'The request context is invalid or missing tenant/workspace identity.',
        retryable: false,
        correlationId: rawCorrelationId,
      });
    }
    const context = parsedContext.data;

    const parsedRequest = HarnessTurnRequestV1.safeParse(input.request);
    if (!parsedRequest.success) {
      throw harnessError({
        code: 'INVALID_REQUEST',
        message: 'The harness turn request is invalid.',
        retryable: false,
        correlationId: context.correlationId,
      });
    }
    const request = parsedRequest.data;

    const route = RouteDecisionV1.parse(
      await this.dependencies.intentRouter.route({
        context,
        request,
        availableDomainAgents: this.dependencies.domainAgents.list(),
      }),
    );

    if (
      request.requestedDomainAgentId &&
      request.requestedDomainAgentId !== route.selectedDomainAgentId
    ) {
      throw harnessError({
        code: 'CONFLICT',
        message: 'The selected route conflicts with the requested domain agent.',
        retryable: false,
        correlationId: context.correlationId,
      });
    }

    const domainAgent = this.dependencies.domainAgents.get(route.selectedDomainAgentId);
    if (!domainAgent) {
      throw harnessError({
        code: 'CAPABILITY_UNAVAILABLE',
        message: `Domain agent ${route.selectedDomainAgentId} is not registered.`,
        retryable: false,
        correlationId: context.correlationId,
        setupAction: 'Install or enable the required domain pack.',
      });
    }

    if (route.targetType !== 'capability' || !route.capabilityId) {
      throw harnessError({
        code: 'CAPABILITY_UNAVAILABLE',
        message: 'Workflow execution is not enabled in this first harness slice.',
        retryable: false,
        correlationId: context.correlationId,
        setupAction: 'Route this turn to a ready direct capability.',
      });
    }

    if (!domainAgent.allowedCapabilityIds.includes(route.capabilityId)) {
      throw harnessError({
        code: 'FORBIDDEN',
        message: `Capability ${route.capabilityId} is outside the domain-agent manifest.`,
        retryable: false,
        correlationId: context.correlationId,
      });
    }

    const policy = PolicyDecisionV1.parse(
      await this.dependencies.policyEngine.evaluate({
        context,
        request,
        route,
        domainAgent,
      }),
    );
    this.assertPolicyAllowsTurn(policy, context.correlationId);

    const allowedMemorySpaces = domainAgent.memorySpaces.filter((memorySpace) =>
      policy.allowedMemorySpaces.includes(memorySpace),
    );
    if (allowedMemorySpaces.length === 0) {
      throw harnessError({
        code: 'FORBIDDEN',
        message: 'Policy and domain-agent memory boundaries do not overlap.',
        retryable: false,
        correlationId: context.correlationId,
      });
    }

    const memoryQuery = MemoryQueryV1.parse({
      schemaVersion: '1',
      tenantId: context.actor.tenantId,
      workspaceId: context.actor.workspaceId,
      actorId: context.actor.actorId,
      objective: request.input,
      allowedMemorySpaces,
      allowedAuthorityClasses: policy.allowedAuthorityClasses,
      sensitivityCeiling: stricterSensitivity(
        domainAgent.sensitivityCeiling,
        policy.sensitivityCeiling,
      ),
      retrievalModes: ['transactional', 'lexical', 'vector', 'wiki', 'graph'],
      maxResults: policy.budget.maxRetrievalResults,
      maxContextTokens: policy.budget.maxContextTokens,
    });

    const contextPackage = ContextPackageV1.parse(
      await this.dependencies.memoryRouter.retrieve(memoryQuery),
    );
    if (contextPackage.items.length === 0) {
      throw harnessError({
        code: 'NO_AUTHORIZED_EVIDENCE',
        message: 'No authorized evidence was found for this request.',
        retryable: false,
        correlationId: context.correlationId,
      });
    }

    let modelResult;
    try {
      modelResult = await this.dependencies.modelGateway.generate({
        context,
        request,
        domainAgent,
        route,
        contextPackage,
        maxOutputTokens: policy.budget.maxOutputTokens,
        maxAttempts: policy.budget.maxProviderAttempts,
      });
    } catch (error) {
      throw harnessError({
        code: 'PROVIDER_FAILURE',
        message: error instanceof Error ? error.message : 'The model provider failed.',
        retryable: true,
        correlationId: context.correlationId,
      });
    }

    const selectedItems = selectUsedContextItems(
      contextPackage,
      modelResult.usedContextItemIds,
      context.correlationId,
    );
    const proposedActions = modelResult.proposedActions.map((proposal) =>
      ProposedActionV1.parse(proposal),
    );
    const unauthorizedProposal = proposedActions.find(
      (proposal) => !domainAgent.allowedCapabilityIds.includes(proposal.capabilityId),
    );
    if (unauthorizedProposal) {
      throw harnessError({
        code: 'FORBIDDEN',
        message: `The model proposed capability ${unauthorizedProposal.capabilityId} outside the domain-agent manifest.`,
        retryable: false,
        correlationId: context.correlationId,
      });
    }

    const verification = await this.dependencies.verifier.verify({
      request,
      domainAgent,
      route,
      contextPackage,
      modelResult,
    });
    if (!verification.passed || !verification.summary.trim()) {
      throw harnessError({
        code: 'VERIFICATION_FAILURE',
        message: verification.summary || 'The generated response failed verification.',
        retryable: false,
        correlationId: context.correlationId,
      });
    }

    const turnId = this.dependencies.ids.next('turn');
    const actionReceipt = ActionReceiptV1.parse({
      schemaVersion: '1',
      id: this.dependencies.ids.next('action-receipt'),
      tenantId: context.actor.tenantId,
      workspaceId: context.actor.workspaceId,
      actorId: context.actor.actorId,
      turnId,
      capabilityId: route.capabilityId,
      policyDecisionId: policy.id,
      ...(context.idempotencyKey ? { idempotencyKey: context.idempotencyKey } : {}),
      safeParameterSummary: {
        domainAgentId: domainAgent.id,
        contextItemCount: selectedItems.length,
      },
      outcome: 'succeeded',
      verificationSummary: verification.summary,
      createdAt: this.dependencies.clock.now(),
    });
    await this.dependencies.receiptStore.appendActionReceipt(actionReceipt);

    return HarnessTurnResponseV1.parse({
      schemaVersion: '1',
      turnId,
      routedDomainAgentId: domainAgent.id,
      output: modelResult.output,
      citations: collectCitations(selectedItems),
      proposedActions,
      retrievalReceiptIds: [contextPackage.retrievalReceiptId],
      actionReceiptIds: [actionReceipt.id],
      capabilityStatus: [{ capabilityId: route.capabilityId, status: 'used' }],
    });
  }

  private assertPolicyAllowsTurn(
    policy: ReturnType<typeof PolicyDecisionV1.parse>,
    correlationId: string,
  ): void {
    if (policy.effect === 'deny') {
      throw harnessError({
        code: 'FORBIDDEN',
        message: `Policy denied the turn: ${policy.reasonCodes.join(', ')}.`,
        retryable: false,
        correlationId,
      });
    }
    if (policy.effect === 'require_approval') {
      throw harnessError({
        code: 'APPROVAL_REQUIRED',
        message: 'This turn requires approval before execution.',
        retryable: false,
        correlationId,
        setupAction: `Approve request ${policy.approvalRequestId}.`,
      });
    }
  }
}

function readCorrelationId(context: unknown): string {
  if (
    typeof context === 'object' &&
    context !== null &&
    'correlationId' in context &&
    typeof context.correlationId === 'string' &&
    context.correlationId.trim()
  ) {
    return context.correlationId;
  }
  return 'unresolved-correlation';
}

function stricterSensitivity(domainCeiling: string, policyCeiling: string): string {
  const levels = ['public', 'internal', 'private', 'restricted'];
  const domainIndex = levels.indexOf(domainCeiling);
  const policyIndex = levels.indexOf(policyCeiling);
  if (domainIndex === -1 || policyIndex === -1) {
    return policyCeiling;
  }
  return levels[Math.min(domainIndex, policyIndex)] ?? policyCeiling;
}

function selectUsedContextItems(
  contextPackage: ReturnType<typeof ContextPackageV1.parse>,
  usedContextItemIds: readonly string[],
  correlationId: string,
) {
  const available = new Map(contextPackage.items.map((item) => [item.id, item]));
  const uniqueIds = [...new Set(usedContextItemIds)];
  const selected = uniqueIds.map((id) => available.get(id));
  if (selected.length === 0 || selected.some((item) => !item)) {
    throw harnessError({
      code: 'VERIFICATION_FAILURE',
      message: 'The provider referenced missing or no authorized context items.',
      retryable: false,
      correlationId,
    });
  }
  return selected.filter((item): item is NonNullable<typeof item> => Boolean(item));
}

function collectCitations(
  items: ReturnType<typeof selectUsedContextItems>,
): CitationV1[] {
  const citations = new Map<string, CitationV1>();
  for (const item of items) {
    for (const citation of item.citations) {
      citations.set(citation.citationId, citation);
    }
  }
  return [...citations.values()];
}

export { HarnessRuntimeError };
