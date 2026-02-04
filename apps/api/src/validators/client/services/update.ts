import { z } from 'zod'

export const updateMyServiceSchema = z.object({
    params: z.object({
        id: z.coerce.number().min(1, 'Service ID is required'),
    }),
    body: z.object({
        serviceName: z
            .string()
            .min(3, 'Service name must be at least 3 characters')
            .max(24, 'Service name must be at most 24 characters')
            .regex(
                /^[a-zA-Z0-9\s\-_()]+$/,
                'Service name can only contain letters, numbers, spaces, and basic punctuation'
            )
            .optional(),
    }),
})
