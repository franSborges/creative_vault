import { Prisma, type PrismaClient } from "../../../generated/prisma";
import { DuplicateError } from "../../../shared/errors";
import type { CollectionRepository } from "../domain/collection";

export function createPrismaCollectionRepository(prisma: PrismaClient): CollectionRepository {
  return {
    listByLibrary: (libraryId) => prisma.collection.findMany({ where: { libraryId }, orderBy: { createdAt: "desc" } }),
    findById: (libraryId, id) => prisma.collection.findFirst({ where: { id, libraryId } }),
    create: (data) => prisma.collection.create({ data }),
    update: (id, data) => prisma.collection.update({ where: { id }, data }),
    async delete(id) {
      await prisma.collection.delete({ where: { id } }); // cascade apaga só CollectionItems
    },
    listItems: (collectionId) =>
      prisma.collectionItem.findMany({
        where: { collectionId },
        orderBy: [{ position: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
      }),
    findItem: (collectionId, vaultItemId) =>
      prisma.collectionItem.findUnique({ where: { collectionId_vaultItemId: { collectionId, vaultItemId } } }),
    async maxPosition(collectionId) {
      const r = await prisma.collectionItem.aggregate({ where: { collectionId }, _max: { position: true } });
      return r._max.position;
    },
    async addItem(data) {
      try {
        return await prisma.collectionItem.create({ data });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") throw new DuplicateError("Item já está nesta coleção");
        throw e;
      }
    },
    async removeItem(collectionId, vaultItemId) {
      await prisma.collectionItem.delete({ where: { collectionId_vaultItemId: { collectionId, vaultItemId } } });
    },
  };
}
