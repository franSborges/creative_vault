import express, { application } from "express"
import referenceRoutes from "./modules/references/reference.routes"

const app = express()

app.use(express.json())

app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        application: "creative-vault-api"
    })
})


app.use("/api/references", referenceRoutes)

export default app