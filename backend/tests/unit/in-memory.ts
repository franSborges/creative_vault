import { randomUUID } from "node:crypto";
import { DuplicateError } from "../../src/shared/errors";
import type { Collection, CollectionItem, CollectionRepository } from "../../src/modules/collections/domain/collection";
import type { VaultItemReader, VaultItemSummary } from "../../src/modules/vault/domain/vault-item-reader";

// Repositórios em memória para os testes unitários (sem banco)
export function inMemory() {
  const collections: Collection[] = [];
  let items: CollectionItem[] = [];
  const vault: (VaultItemSummary & { libraryId: string })[] = [];
  let tick = 0;
  const now = () => new Date(Date.UTC(2026, 0, 1, 0, 0, tick++));

  const repo: CollectionRepository = {
    listByLibrary: async (lib) => collections.filter((c) => c.libraryId === lib).sort((a, b) => +b.createdAt - +a.createdAt),
    findById: async (lib, id) => collections.find((c) => c.id === id && c.libraryId === lib) ?? null,
    create: async (d) => {
      const t = now();
      const c = { id: randomUUID(), libraryId: d.libraryId, name: d.name, description: d.description ?? null, coverUrl: d.coverUrl ?? null, createdAt: t, updatedAt: t };
      collections.push(c);
      return c;
    },
    update: async (id, d) => Object.assign(collections.find((c) => c.id === id)!, d, { updatedAt: now() }),
    delete: async (id) => {
      collections.splice(collections.findIndex((c) => c.id === id), 1);
      items = items.filter((i) => i.collectionId !== id);
    },
    listItems: async (cid) =>
      items.filter((i) => i.collectionId === cid).sort((a, b) =>
        a.position === b.position ? +a.createdAt - +b.createdAt : a.position === null ? 1 : b.position === null ? -1 : a.position - b.position),
    findItem: async (cid, vid) => items.find((i) => i.collectionId === cid && i.vaultItemId === vid) ?? null,
    maxPosition: async (cid) => {
      const ps = items.filter((i) => i.collectionId === cid && i.position !== null).map((i) => i.position!);
      return ps.length ? Math.max(...ps) : null;
    },
    addItem: async (d) => {
      if (items.some((i) => i.collectionId === d.collectionId && i.vaultItemId === d.vaultItemId)) throw new DuplicateError("dup");
      const it = { id: randomUUID(), createdAt: now(), ...d };
      items.push(it);
      return it;
    },
    removeItem: async (cid, vid) => {
      items = items.filter((i) => !(i.collectionId === cid && i.vaultItemId === vid));
    },
  };
  const vaultItems: VaultItemReader = {
    existsInLibrary: async (lib, id) => vault.some((v) => v.id === id && v.libraryId === lib),
    findSummaries: async (lib, ids) => vault.filter((v) => v.libraryId === lib && ids.includes(v.id)).map(({ libraryId, ...s }) => s),
  };
  return { deps: { repo, vaultItems }, vault, collections, getItems: () => items, pushRawItem: (i: CollectionItem) => items.push(i) };
}
