import { DuplicateError, NotFoundError } from "../../../shared/errors";
import type { VaultItemReader, VaultItemType } from "../../vault/domain/vault-item-reader";
import type { Collection, CollectionItem, CollectionRepository, UpdateCollectionData } from "../domain/collection";

export interface CollectionDeps {
  repo: CollectionRepository;
  vaultItems: VaultItemReader;
}

export type CollectionItemView = CollectionItem & { vaultItem: { id: string; type: VaultItemType; title: string } };
export type CollectionDetail = Collection & { items: CollectionItemView[] };

async function requireCollection(repo: CollectionRepository, libraryId: string, id: string) {
  const c = await repo.findById(libraryId, id);

  if (!c) throw new NotFoundError("Coleção não encontrada");
  return c;
}

export const listCollections = (d: CollectionDeps, libraryId: string) => d.repo.listByLibrary(libraryId);

export async function getCollection(d: CollectionDeps, libraryId: string, id: string): Promise<CollectionDetail> {
  const c = await requireCollection(d.repo, libraryId, id);
  const items = await d.repo.listItems(c.id);
  const summaries = new Map((await d.vaultItems.findSummaries(libraryId, items.map((i) => i.vaultItemId))).map((s) => [s.id, s]));
  return {
    ...c,
    items: items.filter((i) => summaries.has(i.vaultItemId)).map((i) => ({ ...i, vaultItem: summaries.get(i.vaultItemId)! })),
  };
}

export const createCollection = (d: CollectionDeps, libraryId: string, input: { name: string; description?: string | null; coverUrl?: string | null }) =>
  d.repo.create({ libraryId, ...input });

export async function updateCollection(d: CollectionDeps, libraryId: string, id: string, patch: UpdateCollectionData) {
  await requireCollection(d.repo, libraryId, id);
  return d.repo.update(id, patch);
}

export async function deleteCollection(d: CollectionDeps, libraryId: string, id: string) {
  await requireCollection(d.repo, libraryId, id);
  await d.repo.delete(id);
}

export async function addItemToCollection(
  d: CollectionDeps, libraryId: string, collectionId: string,
  input: { vaultItemId: string; coverUrl?: string | null; position?: number | null },
) {
  await requireCollection(d.repo, libraryId, collectionId);
  if (!(await d.vaultItems.existsInLibrary(libraryId, input.vaultItemId))) throw new NotFoundError("Item do vault não encontrado");

  if (await d.repo.findItem(collectionId, input.vaultItemId)) throw new DuplicateError("Item já está nesta coleção");

  const position = input.position ?? ((await d.repo.maxPosition(collectionId)) ?? -1) + 1;
  return d.repo.addItem({ collectionId, vaultItemId: input.vaultItemId, coverUrl: input.coverUrl ?? null, position });
}

export async function removeItemFromCollection(d: CollectionDeps, libraryId: string, collectionId: string, vaultItemId: string) {
  await requireCollection(d.repo, libraryId, collectionId);
  if (!(await d.repo.findItem(collectionId, vaultItemId))) throw new NotFoundError("Item não está nesta coleção");
  await d.repo.removeItem(collectionId, vaultItemId);
}
