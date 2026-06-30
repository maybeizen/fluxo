import { z } from 'zod'

export const getAllConfigurableOptionsSchema = z.object({
    query: z.object({
        page: z.string().optional().default('1').transform(Number),
        limit: z.string().optional().default('20').transform(Number),
    }),
})

export const getConfigurableOptionByIdSchema = z.object({
    params: z.object({
        id: z.coerce.number().min(1, 'ID is required'),
    }),
})

export type GetAllConfigurableOptionsInput = z.infer<
    typeof getAllConfigurableOptionsSchema
>
export type GetConfigurableOptionByIdInput = z.infer<
    typeof getConfigurableOptionByIdSchema
>
