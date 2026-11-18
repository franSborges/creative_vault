import { Router } from "express";
import type { LibraryContext } from "../../identity/library-context";
import * as uc from "../application/use-cases";
import { addItemBody, createCollectionBody, idParams, itemParams, updateCollectionBody } from "./schemas";


export function collectionsRouter(deps: uc.CollectionDeps, ctx: LibraryContext): Router {
  const route = Router();

  route.get("/collections", async (_req, res) => {
    res.json({ data: await uc.listCollections(deps, await ctx.resolveLibraryId()) });
  });

  route.post("/collections", async (req, res) => {
    const body = createCollectionBody.parse(req.body);
    res.status(201).json({ data: await uc.createCollection(deps, await ctx.resolveLibraryId(), body) });
  });

  route.get("/collections/:id", async (req, res) => {
    const { id } = idParams.parse(req.params);
    res.json({ data: await uc.getCollection(deps, await ctx.resolveLibraryId(), id) });
  });

  route.patch("/collections/:id", async (req, res) => {
    const { id } = idParams.parse(req.params);
    const body = updateCollectionBody.parse(req.body);
    res.json({ data: await uc.updateCollection(deps, await ctx.resolveLibraryId(), id, body) });
  });

  route.delete("/collections/:id", async (req, res) => {
    const { id } = idParams.parse(req.params);
    await uc.deleteCollection(deps, await ctx.resolveLibraryId(), id);
    res.status(204).end();
  });

  route.post("/collections/:id/items", async (req, res) => {
    const { id } = idParams.parse(req.params);
    const body = addItemBody.parse(req.body);
    res.status(201).json({ data: await uc.addItemToCollection(deps, await ctx.resolveLibraryId(), id, body) });
  });

  route.delete("/collections/:id/items/:itemId", async (req, res) => {
    const { id, itemId } = itemParams.parse(req.params);
    await uc.removeItemFromCollection(deps, await ctx.resolveLibraryId(), id, itemId);
    res.status(204).end();
  });

  return route;
}
