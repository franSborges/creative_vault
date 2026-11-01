import { referenceRepository } from "./reference.repository";
import { CreateReferenceInput } from "./reference.types";

export const referenceService = {
    create(data: CreateReferenceInput) {
        return referenceRepository.create(data)
    },

    findAll() {
        return referenceRepository.findAll()
    }
}