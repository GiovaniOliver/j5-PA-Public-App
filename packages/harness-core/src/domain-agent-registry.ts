import {
  DomainAgentManifestV1,
  type DomainAgentId,
  type DomainAgentManifestV1 as DomainAgentManifest,
} from '@j5/contracts';

export interface DomainAgentRegistry {
  get(id: DomainAgentId): DomainAgentManifest | undefined;
  list(): readonly DomainAgentManifest[];
}

export class InMemoryDomainAgentRegistry implements DomainAgentRegistry {
  readonly #manifests = new Map<DomainAgentId, DomainAgentManifest>();

  constructor(manifests: readonly DomainAgentManifest[]) {
    for (const candidate of manifests) {
      const manifest = DomainAgentManifestV1.parse(candidate);
      if (this.#manifests.has(manifest.id)) {
        throw new Error(`Duplicate domain-agent manifest: ${manifest.id}`);
      }
      this.#manifests.set(manifest.id, Object.freeze({ ...manifest }));
    }
  }

  get(id: DomainAgentId): DomainAgentManifest | undefined {
    return this.#manifests.get(id);
  }

  list(): readonly DomainAgentManifest[] {
    return [...this.#manifests.values()];
  }
}
