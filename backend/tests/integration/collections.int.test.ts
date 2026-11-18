import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { createApp } from "../../src/app";
import { prisma } from "../../src/shared/prisma";
import { createPrismaCollectionRepository } from "../../src/modules/collections/infrastructure/prisma-collection-repository";
import { createPrismaVaultItemReader } from "../../src/modules/vault/infrastructure/prisma-vault-item-reader";


const url = process.env.DATABASE_URL ?? "";
const enabled = /_test\b/.test(url);

describe.skipIf(!enabled)("Collections API (Postgres)", () => {
  let libA: string, libB: string, bookA: string, quoteA: string, bookB: string;
  let currentLib: string;
  const app = createApp({
    repo: createPrismaCollectionRepository(prisma),
    vaultItems: createPrismaVaultItemReader(prisma),
    libraryContext: { resolveLibraryId: async () => currentLib },
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(`TRUNCATE "User","Library","VaultItem","Book","Movie","Image","Quote","Link","Collection","CollectionItem" CASCADE`);
    const mk = async (email: string) => (await prisma.user.create({ data: { name: email, email, library: { create: {} } }, include: { library: true } })).library!.id;
    libA = await mk("a@test.local");
    libB = await mk("b@test.local");
    bookA = (await prisma.vaultItem.create({ data: { libraryId: libA, type: "BOOK", book: { create: { title: "Fingersmith", author: "Sarah Waters" } } } })).id;
    quoteA = (await prisma.vaultItem.create({ data: { libraryId: libA, type: "QUOTE", quote: { create: { content: "q".repeat(100) } } } })).id;
    bookB = (await prisma.vaultItem.create({ data: { libraryId: libB, type: "BOOK", book: { create: { title: "B" } } } })).id;
    currentLib = libA;
  });

  afterAll(() => prisma.$disconnect());

  const create = async (name = "Vitoriana") => (await request(app).post("/api/v1/collections").send({ name })).body.data.id as string;

  it("CRUD completo e ordenação createdAt DESC", async () => {
    const c1 = await create("Um");
    const c2 = await create("Dois");
    const list = await request(app).get("/api/v1/collections");
    expect(list.body.data.map((c: { id: string }) => c.id)).toEqual([c2, c1]);
    const patched = await request(app).patch(`/api/v1/collections/${c1}`).send({ description: "desc" });
    expect(patched.status).toBe(200);
    expect(patched.body.data.description).toBe("desc");
  });

  it("GET detalhe traz itens com tipo e título, posição max+1, tipos mistos (BR-005)", async () => {
    const c = await create();
    await request(app).post(`/api/v1/collections/${c}/items`).send({ vaultItemId: bookA });
    const r2 = await request(app).post(`/api/v1/collections/${c}/items`).send({ vaultItemId: quoteA, coverUrl: "https://x.test/c.jpg" });
    expect(r2.body.data.position).toBe(1);
    const d = (await request(app).get(`/api/v1/collections/${c}`)).body.data;
    expect(d.items.map((i: { vaultItem: { type: string } }) => i.vaultItem.type)).toEqual(["BOOK", "QUOTE"]);
    expect(d.items[0].vaultItem.title).toBe("Fingersmith");
    expect(d.items[1].vaultItem.title).toHaveLength(80);
    expect(d.items[1].coverUrl).toBe("https://x.test/c.jpg");
  });

  it("duplicado -> 409 (BR-007) e mesmo item em 2 coleções ok (BR-006)", async () => {
    const a = await create("A"), b = await create("B");
    expect((await request(app).post(`/api/v1/collections/${a}/items`).send({ vaultItemId: bookA })).status).toBe(201);
    expect((await request(app).post(`/api/v1/collections/${a}/items`).send({ vaultItemId: bookA })).status).toBe(409);
    expect((await request(app).post(`/api/v1/collections/${b}/items`).send({ vaultItemId: bookA })).status).toBe(201);
  });

  it("isolamento entre bibliotecas -> 404 (BR-009)", async () => {
    const c = await create();
    expect((await request(app).post(`/api/v1/collections/${c}/items`).send({ vaultItemId: bookB })).status).toBe(404);
    currentLib = libB;
    for (const r of [
      request(app).get(`/api/v1/collections/${c}`),
      request(app).patch(`/api/v1/collections/${c}`).send({ name: "x" }),
      request(app).delete(`/api/v1/collections/${c}`),
      request(app).post(`/api/v1/collections/${c}/items`).send({ vaultItemId: bookB }),
      request(app).delete(`/api/v1/collections/${c}/items/${bookA}`),
    ]) expect((await r).status).toBe(404);
    expect((await request(app).get("/api/v1/collections")).body.data).toEqual([]);
    expect(await prisma.collection.count({ where: { id: c } })).toBe(1);
  });

  it("remover item mantém VaultItem (BR-010)", async () => {
    const c = await create();
    await request(app).post(`/api/v1/collections/${c}/items`).send({ vaultItemId: bookA });
    expect((await request(app).delete(`/api/v1/collections/${c}/items/${bookA}`)).status).toBe(204);
    expect(await prisma.collectionItem.count()).toBe(0);
    expect(await prisma.vaultItem.count({ where: { id: bookA } })).toBe(1);
    expect((await request(app).delete(`/api/v1/collections/${c}/items/${bookA}`)).status).toBe(404);
  });

  it("excluir coleção mantém VaultItems (BR-011)", async () => {
    const c = await create();
    await request(app).post(`/api/v1/collections/${c}/items`).send({ vaultItemId: bookA });
    expect((await request(app).delete(`/api/v1/collections/${c}`)).status).toBe(204);
    expect(await prisma.collectionItem.count()).toBe(0);
    expect(await prisma.vaultItem.count({ where: { libraryId: libA } })).toBe(2);
  });

  it("excluir VaultItem remove suas associações em cascata (BR-012)", async () => {
    const a = await create("A"), b = await create("B");
    await request(app).post(`/api/v1/collections/${a}/items`).send({ vaultItemId: bookA });
    await request(app).post(`/api/v1/collections/${b}/items`).send({ vaultItemId: bookA });
    await prisma.vaultItem.delete({ where: { id: bookA } });
    expect(await prisma.collectionItem.count()).toBe(0);
    expect(await prisma.collection.count()).toBe(2);
  });

  it("P2002 tratado como 409 mesmo sem pré-checagem (corrida)", async () => {
    const c = await create();
    const repo = createPrismaCollectionRepository(prisma);
    await repo.addItem({ collectionId: c, vaultItemId: bookA, coverUrl: null, position: 0 });
    await expect(repo.addItem({ collectionId: c, vaultItemId: bookA, coverUrl: null, position: 1 })).rejects.toThrow("Item já está nesta coleção");
  });

  it("uuid inexistente -> 404", async () => {
    expect((await request(app).get(`/api/v1/collections/${randomUUID()}`)).status).toBe(404);
  });
});
