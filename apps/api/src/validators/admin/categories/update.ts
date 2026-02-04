import { z } from 'zod'

export const updateCategorySchema = z.object({
    name: z
        .string()
        .min(1, 'Category name is required')
        .max(100, 'Category name must be less than 100 characters')
        .optional(),
    description: z
        .string()
        .max(500, 'Description must be less than 500 characters')
        .optional()
        .nullable(),
})

export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>
