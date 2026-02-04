import { z } from 'zod'
import { getDb, news } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { NewsVisibility } from '@fluxo/types'

export const createNewsSchema = z
    .object({
        title: z
            .string('Title is required')
            .min(5, 'Title must be at least 5 characters long')
            .max(200, 'Title must be less than 200 characters long'),
        content: z
            .string('Content is required')
            .min(50, 'Content must be at least 50 characters long'),
        summary: z
            .string('Summary is required')
            .min(20, 'Summary must be at least 20 characters long')
            .max(500, 'Summary must be less than 500 characters long'),
        isFeatured: z.boolean().optional().default(false),
        tags: z.array(z.string()).optional().default([]),
        visibility: z
            .enum(
                Object.values(NewsVisibility) as [string, ...string[]],
                'Invalid visibility value'
            )
            .optional()
            .default(NewsVisibility.DRAFT),
        metadata: z.object({
            slug: z
                .string()
                .min(3, 'Slug must be at least 3 characters')
                .max(200, 'Slug must be less than 200 characters')
                .regex(
                    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    'Slug must be lowercase letters, numbers, and hyphens only'
                ),
            featuredImageUrl: z.url().optional(),
            seoTitle: z.string().max(60).optional(),
            seoDescription: z.string().max(160).optional(),
        }),
    })
    .superRefine(async (data, ctx) => {
        if (data.metadata?.slug) {
            const db = getDb()
            const [existingNews] = await db
                .select()
                .from(news)
                .where(eq(news.slug, data.metadata.slug))
                .limit(1)

            if (existingNews) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['metadata', 'slug'],
                    message: 'Slug already exists',
                })
            }
        }
    })
