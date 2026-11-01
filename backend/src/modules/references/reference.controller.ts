import { Request, Response } from "express"
import { createReferenceSchema } from "./reference.schema"
import { referenceService } from "./reference.service"


export const referenceController = {
    create(req: Request, res: Response) {
        const result = createReferenceSchema.safeParse(req.body)
    
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid reference data",
                errors: result.error.flatten(),
            })
        }

        const reference = referenceService.create(result.data)

        return res.status(201).json(reference)
    
    },


    findAll(_req: Request, res: Response) {
        const references = referenceService.findAll()

        return res.status(200).json(references)
    }
}