import { z } from 'zod'

export const addScopeSchema = z.object({
    params: z.object({
        id: z.coerce.number().min(1, 'Option ID is required'),
    }),
    body: z.object({
        productId: z.coerce.number().min(1, 'Product ID is required'),
    }),
})

export type AddScopeInput = z.infer<typeof addScopeSchema>
