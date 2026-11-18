import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

// Seed idempotente: usuário dev + biblioteca + um VaultItem de cada tipo.
// IDs fixos permitem rodar várias vezes sem duplicar (upsert).
const prisma = new PrismaClient();
const email = process.env.DEV_USER_EMAIL ?? "dev@creativevault.local";

const ids = {
  book: "00000000-0000-4000-8000-000000000001",
  movie: "00000000-0000-4000-8000-000000000002",
  quote: "00000000-0000-4000-8000-000000000003",
  link: "00000000-0000-4000-8000-000000000004",
  image: "00000000-0000-4000-8000-000000000005",
};

async function main() {
  const user = await prisma.user.upsert({ where: { email }, update: {}, create: { name: "Dev", email } });
  const library = await prisma.library.upsert({ where: { ownerId: user.id }, update: {}, create: { ownerId: user.id } });
  const base = (id: string, type: "BOOK" | "MOVIE" | "QUOTE" | "LINK" | "IMAGE") => ({ where: { id }, update: {}, create: { id, type, libraryId: library.id } });

  await prisma.vaultItem.upsert({ ...base(ids.book, "BOOK"), create: { ...base(ids.book, "BOOK").create, book: { create: { title: "Fingersmith", author: "Sarah Waters", publicationYear: 2002 } } } });
  await prisma.vaultItem.upsert({ ...base(ids.movie, "MOVIE"), create: { ...base(ids.movie, "MOVIE").create, movie: { create: { title: "A Criada", originalTitle: "Ah-ga-ssi", director: "Park Chan-wook", releaseYear: 2016 } } } });
  await prisma.vaultItem.upsert({ ...base(ids.quote, "QUOTE"), create: { ...base(ids.quote, "QUOTE").create, quote: { create: { content: "My mother, I thought, would be proud of me.", author: "Sarah Waters", sourceTitle: "Fingersmith" } } } });
  await prisma.vaultItem.upsert({ ...base(ids.link, "LINK"), create: { ...base(ids.link, "LINK").create, link: { create: { url: "https://pt.wikipedia.org/wiki/Sarah_Waters", title: "Sarah Waters — Wikipédia" } } } });
  await prisma.vaultItem.upsert({ ...base(ids.image, "IMAGE"), create: { ...base(ids.image, "IMAGE").create, image: { create: { title: "Mansão vitoriana", externalUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg" } } } });

  console.log(`Seed OK — usuário ${email}, biblioteca ${library.id}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
