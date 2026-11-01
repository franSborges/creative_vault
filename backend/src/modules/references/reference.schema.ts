import { z } from 'zod'
import { ReferenceType } from './reference.types'

export const createReferenceSchema = z.object({
    title: z.string().trim().min(1).max(120),
    type: z.enum(ReferenceType),
    description: z.string().trim().max(500).optional(),
    url: z.string().url().optional(),
    imageUrl: z.string().url().optional(),
    author: z.string().trim().max(120).optional(),
    notes: z.string().trim().max(2000).optional()
})