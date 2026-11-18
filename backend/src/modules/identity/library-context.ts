import type { PrismaClient } from "../../generated/prisma";
import { NotFoundError } from "../../shared/errors";

export interface LibraryContext {
  resolveLibraryId(): Promise<string>;
}

export function createDevLibraryContext(prisma: PrismaClient): LibraryContext {
  let cached: string | undefined;
  return {
    async resolveLibraryId() {
      if (cached) return cached;
      if (process.env.DEV_LIBRARY_ID) return (cached = process.env.DEV_LIBRARY_ID);
      const email = process.env.DEV_USER_EMAIL ?? "dev@creativevault.local";
      const library = await prisma.library.findFirst({ where: { owner: { email } } });
      if (!library) throw new NotFoundError(`Biblioteca de desenvolvimento não encontrada para ${email}. Rode npm run seed.`);
      return (cached = library.id);
    },
  };
}
