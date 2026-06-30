import { z } from 'zod'
import { NewsVisibility } from '@fluxo/types'

export const createNewsSchema = z.object({
    title: z
        .string()
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title must be less than 200 characters'),
    summary: z
        .string()
        .min(20, 'Summary must be at least 20 characters')
        .max(500, 'Summary must be less than 500 characters'),
    content: z.string().min(50, 'Content must be at least 50 characters'),
    slug: z
        .string()
        .min(3, 'Slug must be at least 3 characters')
        .max(200, 'Slug must be less than 200 characters')
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            'Slug must be lowercase letters, numbers, and hyphens only'
        ),
    visibility: z.enum(NewsVisibility),
    isFeatured: z.boolean(),
    tags: z.string().optional(),
    featuredImageUrl: z.url('Must be a valid URL').optional().or(z.literal('')),
    seoTitle: z
        .string()
        .max(60, 'SEO title must be less than 60 characters')
        .optional()
        .or(z.literal('')),
    seoDescription: z
        .string()
        .max(160, 'SEO description must be less than 160 characters')
        .optional()
        .or(z.literal('')),
})

export type CreateNewsFormData = z.infer<typeof createNewsSchema>
