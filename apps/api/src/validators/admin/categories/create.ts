import { z } from 'zod'

export const createCategorySchema = z.object({
    name: z
        .string()
        .min(1, 'Category name is required')
        .max(100, 'Category name must be less than 100 characters'),
    description: z
        .string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),
})

export type CreateCategorySchema = z.infer<typeof createCategorySchema>
