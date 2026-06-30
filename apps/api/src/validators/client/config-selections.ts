import { z } from 'zod'

export const submitConfigSelectionsSchema = z.object({
    params: z.object({
        id: z.coerce.number().min(1, 'Service ID is required'),
    }),
    body: z.object({
        selections: z.record(z.coerce.number(), z.unknown()),
    }),
})
