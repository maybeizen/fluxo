import { z } from 'zod'

export const cancelMyServiceSchema = z.object({
    params: z.object({
        id: z.coerce.number().min(1, 'Service ID is required'),
    }),
    body: z.object({
        cancellationReason: z
            .string()
            .min(10, 'Cancellation reason must be at least 10 characters')
            .max(500, 'Cancellation reason must be at most 500 characters'),
    }),
})
