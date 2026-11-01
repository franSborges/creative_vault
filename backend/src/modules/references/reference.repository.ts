import { randomUUID } from "node:crypto"
import { Reference, CreateReferenceInput } from "./reference.types"


const references: Reference[] = []

export const referenceRepository = {
    create(data: CreateReferenceInput): Reference {
        const now = new Date()

        const reference: Reference = {
            id: randomUUID(),
            ...data,
            createdAt: now,
            updatedAt: now
        }

       references.push(reference) 

       return reference
    },

    findAll(): Reference[] {
        return references
    }
}