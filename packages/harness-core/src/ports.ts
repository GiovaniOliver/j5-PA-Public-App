import type {
  ActionReceiptV1,
  ContextPackageV1,
  DomainAgentManifestV1,
  HarnessTurnRequestV1,
  MemoryQueryV1,
  PolicyDecisionV1,
  ProposedActionV1,
  RequestContextV1,
  RouteDecisionV1,
} from '@j5/contracts';

export interface PolicyEnginePort {
  evaluate(input: {
    context: RequestContextV1;
    request: HarnessTurnRequestV1;
    route: RouteDecisionV1;
    domainAgent: DomainAgentManifestV1;
  }): Promise<PolicyDecisionV1>;
}

export interface IntentRouterPort {
  route(input: {
    context: RequestContextV1;
    request: HarnessTurnRequestV1;
    availableDomainAgents: readonly DomainAgentManifestV1[];
  }): Promise<RouteDecisionV1>;
}

export interface MemoryRouterPort {
  retrieve(query: MemoryQueryV1): Promise<ContextPackageV1>;
}

export interface ModelGatewayResult {
  output: string;
  usedContextItemIds: string[];
  proposedActions: ProposedActionV1[];
}

export interface ModelGatewayPort {
  generate(input: {
    context: RequestContextV1;
    request: HarnessTurnRequestV1;
    domainAgent: DomainAgentManifestV1;
    route: RouteDecisionV1;
    contextPackage: ContextPackageV1;
    maxOutputTokens: number;
    maxAttempts: number;
  }): Promise<ModelGatewayResult>;
}

export interface VerificationResult {
  passed: boolean;
  summary: string;
}

export interface VerifierPort {
  verify(input: {
    request: HarnessTurnRequestV1;
    domainAgent: DomainAgentManifestV1;
    route: RouteDecisionV1;
    contextPackage: ContextPackageV1;
    modelResult: ModelGatewayResult;
  }): Promise<VerificationResult>;
}

export interface ReceiptStorePort {
  appendActionReceipt(receipt: ActionReceiptV1): Promise<void>;
}

export interface ClockPort {
  now(): string;
}

export interface IdGeneratorPort {
  next(namespace: 'turn' | 'action-receipt'): string;
}
