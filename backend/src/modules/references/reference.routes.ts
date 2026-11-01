import { Router } from "express"
import { referenceController } from "./reference.controller"

const referenceRoutes = Router()

referenceRoutes.post("/", referenceController.create)
referenceRoutes.get("/", referenceController.findAll)

export default referenceRoutes