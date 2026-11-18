import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import * as uc from "../../src/modules/collections/application/use-cases";
import { displayTitle } from "../../src/modules/vault/domain/vault-item-reader";
import { DuplicateError, NotFoundError } from "../../src/shared/errors";
import { createApp } from "../../src/app";
import { inMemory } from "./in-memory";

const LIB_A = randomUUID();
const LIB_B = randomUUID();
let m: ReturnType<typeof inMemory>;
const book = randomUUID(), movie = randomUUID(), quote = randomUUID(), otherLibItem = randomUUID();

beforeEach(() => {
  m = inMemory();
  m.vault.push(
    { id: book, libraryId: LIB_A, type: "BOOK", title: "Fingersmith" },
    { id: movie, libraryId: LIB_A, type: "MOVIE", title: "A Criada" },
    { id: quote, libraryId: LIB_A, type: "QUOTE", title: "Citação" },
    { id: otherLibItem, libraryId: LIB_B, type: "BOOK", title: "Outro" },
  );
});

describe("use cases de coleções", () => {
  it("lista coleções por createdAt DESC e só da biblioteca (BR-009)", async () => {
    const a = await uc.createCollection(m.deps, LIB_A, { name: "A" });
    const b = await uc.createCollection(m.deps, LIB_A, { name: "B" });
    await uc.createCollection(m.deps, LIB_B, { name: "C" });
    expect((await uc.listCollections(m.deps, LIB_A)).map((c) => c.id)).toEqual([b.id, a.id]);
  });

  it("coleção de outra biblioteca -> NotFound em get/update/delete/add/remove (BR-009)", async () => {
    const c = await uc.createCollection(m.deps, LIB_B, { name: "B" });
    await expect(uc.getCollection(m.deps, LIB_A, c.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(uc.updateCollection(m.deps, LIB_A, c.id, { name: "x" })).rejects.toBeInstanceOf(NotFoundError);
    await expect(uc.deleteCollection(m.deps, LIB_A, c.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(uc.addItemToCollection(m.deps, LIB_A, c.id, { vaultItemId: book })).rejects.toBeInstanceOf(NotFoundError);
    await expect(uc.removeItemFromCollection(m.deps, LIB_A, c.id, book)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("VaultItem de outra biblioteca -> NotFound (BR-009)", async () => {
    const c = await uc.createCollection(m.deps, LIB_A, { name: "A" });
    await expect(uc.addItemToCollection(m.deps, LIB_A, c.id, { vaultItemId: otherLibItem })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("aceita tipos mistos (BR-005) e anexa com position max+1", async () => {
    const c = await uc.createCollection(m.deps, LIB_A, { name: "A" });
    const i1 = await uc.addItemToCollection(m.deps, LIB_A, c.id, { vaultItemId: book });
    const i2 = await uc.addItemToCollection(m.deps, LIB_A, c.id, { vaultItemId: movie, position: 10 });
    const i3 = await uc.addItemToCollection(m.deps, LIB_A, c.id, { vaultItemId: quote });
    expect([i1.position, i2.position, i3.position]).toEqual([0, 10, 11]);
    const d = await uc.getCollection(m.deps, LIB_A, c.id);
    expect(d.items.map((i) => i.vaultItem.type)).toEqual(["BOOK", "MOVIE", "QUOTE"]);
    expect(d.items[0].vaultItem.title).toBe("Fingersmith");
  });

  it("mesmo item em várias coleções (BR-006)", async () => {
    const a = await uc.createCollection(m.deps, LIB_A, { name: "A" });
    const b = await uc.createCollection(m.deps, LIB_A, { name: "B" });
    await uc.addItemToCollection(m.deps, LIB_A, a.id, { vaultItemId: book });
    await expect(uc.addItemToCollection(m.deps, LIB_A, b.id, { vaultItemId: book })).resolves.toBeTruthy();
  });

  it("item duplicado na mesma coleção -> Duplicate (BR-007)", async () => {
    const c = await uc.createCollection(m.deps, LIB_A, { name: "A" });
    await uc.addItemToCollection(m.deps, LIB_A, c.id, { vaultItemId: book });
    await expect(uc.addItemToCollection(m.deps, LIB_A, c.id, { vaultItemId: book })).rejects.toBeInstanceOf(DuplicateError);
  });

  it("coverUrl/position ficam na associação (BR-008)", async () => {
    const c = await uc.createCollection(m.deps, LIB_A, { name: "A" });
    const it1 = await uc.addItemToCollection(m.deps, LIB_A, c.id, { vaultItemId: book, coverUrl: "https://x.test/c.jpg", position: 3 });
    expect(it1).toMatchObject({ coverUrl: "https://x.test/c.jpg", position: 3 });
  });

  it("ordena position ASC NULLS LAST, depois createdAt ASC", async () => {
    const c = await uc.createCollection(m.deps, LIB_A, { name: "A" });
    const t = (s: number) => new Date(Date.UTC(2025, 0, 1, 0, 0, s));
    m.pushRawItem({ id: randomUUID(), collectionId: c.id, vaultItemId: quote, coverUrl: null, position: null, createdAt: t(1) });
    m.pushRawItem({ id: randomUUID(), collectionId: c.id, vaultItemId: movie, coverUrl: null, position: 1, createdAt: t(3) });
    m.pushRawItem({ id: randomUUID(), collectionId: c.id, vaultItemId: book, coverUrl: null, position: 1, createdAt: t(2) });
    expect((await uc.getCollection(m.deps, LIB_A, c.id)).items.map((i) => i.vaultItemId)).toEqual([book, movie, quote]);
  });

  it("remover item mantém VaultItem (BR-010); remover inexistente -> NotFound", async () => {
    const c = await uc.createCollection(m.deps, LIB_A, { name: "A" });
    await uc.addItemToCollection(m.deps, LIB_A, c.id, { vaultItemId: book });
    await uc.removeItemFromCollection(m.deps, LIB_A, c.id, book);
    expect(m.getItems()).toHaveLength(0);
    expect(m.vault.some((v) => v.id === book)).toBe(true);
    await expect(uc.removeItemFromCollection(m.deps, LIB_A, c.id, book)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("excluir coleção mantém VaultItems (BR-011)", async () => {
    const c = await uc.createCollection(m.deps, LIB_A, { name: "A" });
    await uc.addItemToCollection(m.deps, LIB_A, c.id, { vaultItemId: book });
    await uc.deleteCollection(m.deps, LIB_A, c.id);
    expect(m.collections).toHaveLength(0);
    expect(m.getItems()).toHaveLength(0);
    expect(m.vault).toHaveLength(4);
  });

  it("atualiza coleção", async () => {
    const c = await uc.createCollection(m.deps, LIB_A, { name: "A" });
    expect((await uc.updateCollection(m.deps, LIB_A, c.id, { name: "Novo" })).name).toBe("Novo");
  });
});

describe("displayTitle", () => {
  it("deriva título de cada subtipo", () => {
    expect(displayTitle({ type: "BOOK", book: { title: "Fingersmith" } })).toBe("Fingersmith");
    expect(displayTitle({ type: "MOVIE", movie: { title: "A Criada" } })).toBe("A Criada");
    expect(displayTitle({ type: "IMAGE", image: { title: "Img" } })).toBe("Img");
    expect(displayTitle({ type: "LINK", link: { title: null, url: "https://a.test" } })).toBe("https://a.test");
    expect(displayTitle({ type: "LINK", link: { title: "T", url: "https://a.test" } })).toBe("T");
    const long = "x".repeat(200);
    const t = displayTitle({ type: "QUOTE", quote: { content: long } });
    expect(t.length).toBe(80);
    expect(t.endsWith("…")).toBe(true);
  });
});

describe("HTTP (in-memory)", () => {
  const app = () => createApp({ ...m.deps, libraryContext: { resolveLibraryId: async () => LIB_A } });

  it("GET /health", async () => {
    expect((await request(app()).get("/health")).body).toEqual({ status: "ok", application: "creative-vault-api" });
  });

  it("validação: nome vazio/longo, uuid inválido, URL inválida, JSON inválido -> 400", async () => {
    const a = app();
    for (const body of [{ name: "   " }, { name: "x".repeat(121) }, { name: "ok", coverUrl: "nao-e-url" }]) {
      const r = await request(a).post("/api/v1/collections").send(body);
      expect(r.status).toBe(400);
      expect(r.body.error.code).toBe("VALIDATION_ERROR");
    }
    expect((await request(a).get("/api/v1/collections/123")).status).toBe(400);
    expect((await request(a).post("/api/v1/collections").set("content-type", "application/json").send("{x")).status).toBe(400);
  });

  it("nome é trimado; CRUD + 404/409/204 no formato padrão", async () => {
    const a = app();
    const c = await request(a).post("/api/v1/collections").send({ name: "  Vitoriana  " });
    expect(c.status).toBe(201);
    expect(c.body.data.name).toBe("Vitoriana");
    const id = c.body.data.id;
    expect((await request(a).post(`/api/v1/collections/${id}/items`).send({ vaultItemId: book })).status).toBe(201);
    const dup = await request(a).post(`/api/v1/collections/${id}/items`).send({ vaultItemId: book });
    expect(dup.status).toBe(409);
    expect(dup.body.error.code).toBe("DUPLICATE_RESOURCE");
    const nf = await request(a).get(`/api/v1/collections/${randomUUID()}`);
    expect(nf.status).toBe(404);
    expect(nf.body.error.code).toBe("RESOURCE_NOT_FOUND");
    expect((await request(a).delete(`/api/v1/collections/${id}/items/${book}`)).status).toBe(204);
    expect((await request(a).delete(`/api/v1/collections/${id}`)).status).toBe(204);
    expect((await request(a).get("/rota-inexistente")).status).toBe(404);
  });

  it("erro inesperado -> 500 sem stack trace", async () => {
    const a = createApp({ ...m.deps, libraryContext: { resolveLibraryId: async () => { throw new Error("boom secreto"); } } });
    const r = await request(a).get("/api/v1/collections");
    expect(r.status).toBe(500);
    expect(JSON.stringify(r.body)).not.toMatch(/boom|stack|at /);
  });
});
