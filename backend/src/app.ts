import express, { type ErrorRequestHandler } from "express"
import { ZodError } from "zod"
import referenceRoutes from "./modules/references/reference.routes"
import { collectionsRouter } from "./modules/collections/http/routes"
import type { CollectionDeps } from "./modules/collections/application/use-cases"
import { createPrismaCollectionRepository } from "./modules/collections/infrastructure/prisma-collection-repository"
import { createPrismaVaultItemReader } from "./modules/vault/infrastructure/prisma-vault-item-reader"
import { createDevLibraryContext, type LibraryContext } from "./modules/identity/library-context"
import { prisma } from "./shared/prisma"
import { DuplicateError, NotFoundError, ValidationError } from "./shared/errors"

export interface AppDeps extends CollectionDeps {
    libraryContext: LibraryContext
}

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: err.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ") } })
    } else if (err instanceof ValidationError || err?.type === "entity.parse.failed") {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: err instanceof ValidationError ? err.message : "JSON inválido" } })
    } else if (err instanceof NotFoundError) {
        res.status(404).json({ error: { code: "RESOURCE_NOT_FOUND", message: err.message } })
    } else if (err instanceof DuplicateError) {
        res.status(409).json({ error: { code: "DUPLICATE_RESOURCE", message: err.message } })
    } else {
        console.error(err)
        res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" } })
    }
}

export function createApp(deps: AppDeps = {
    repo: createPrismaCollectionRepository(prisma),
    vaultItems: createPrismaVaultItemReader(prisma),
    libraryContext: createDevLibraryContext(prisma),
}) {
    const app = express()

    app.use(express.json())

    app.get("/health", (_req, res) => {
        res.status(200).json({
            status: "ok",
            application: "creative-vault-api"
        })
    })

    app.use("/api/references", referenceRoutes)

    app.use("/api/v1", collectionsRouter(deps, deps.libraryContext))

    app.use(errorHandler)

    return app
}

const app = createApp()

export default app
