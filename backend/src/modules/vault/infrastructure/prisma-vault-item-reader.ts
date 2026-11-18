import type { PrismaClient } from "../../../generated/prisma";
import { displayTitle, type VaultItemReader } from "../domain/vault-item-reader";

export function createPrismaVaultItemReader(prisma: PrismaClient): VaultItemReader {
  return {
    async existsInLibrary(libraryId, vaultItemId) {
      return (await prisma.vaultItem.count({ where: { id: vaultItemId, libraryId } })) > 0;
    },
    async findSummaries(libraryId, ids) {
      if (ids.length === 0) return [];
      const rows = await prisma.vaultItem.findMany({
        where: { libraryId, id: { in: ids } },
        include: { book: true, movie: true, image: true, quote: true, link: true },
      });
      return rows.map((r) => ({ id: r.id, type: r.type, title: displayTitle(r) }));
    },
  };
}
