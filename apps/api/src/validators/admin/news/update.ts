import { z } from 'zod'
import { getDb, news } from '@fluxo/db'
import { eq, and, ne } from '@fluxo/db'
import { NewsVisibility } from '@fluxo/types'

export const updateNewsSchema = z
    .object({
        id: z.coerce.number('News ID is required'),
        updates: z
            .object({
                title: z
                    .string()
                    .min(5, 'Title must be at least 5 characters long')
                    .max(200, 'Title must be less than 200 characters long')
                    .optional(),
                content: z
                    .string()
                    .min(50, 'Content must be at least 50 characters long')
                    .optional(),
                summary: z
                    .string()
                    .min(20, 'Summary must be at least 20 characters long')
                    .max(500, 'Summary must be less than 500 characters long')
                    .optional(),
                isFeatured: z.boolean().optional(),
                tags: z.array(z.string()).optional(),
                visibility: z
                    .enum(
                        Object.values(NewsVisibility) as [string, ...string[]],
                        'Invalid visibility value'
                    )
                    .optional(),
                metadata: z
                    .object({
                        slug: z
                            .string()
                            .min(3)
                            .max(200)
                            .regex(
                                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                'Slug must be lowercase letters, numbers, and hyphens only'
                            )
                            .optional(),
                        featuredImageUrl: z
                            .union([z.url(), z.literal('')])
                            .optional(),
                        seoTitle: z
                            .union([z.string().max(60), z.literal('')])
                            .optional(),
                        seoDescription: z
                            .union([z.string().max(160), z.literal('')])
                            .optional(),
                    })
                    .optional(),
            })
            .optional()
            .default({}),
    })
    .superRefine(async (data, ctx) => {
        const db = getDb()
        const [newsArticle] = await db
            .select()
            .from(news)
            .where(eq(news.id, data.id))
            .limit(1)
        if (!newsArticle) {
            ctx.addIssue({
                code: 'custom',
                path: ['id'],
                message: 'News not found',
            })
            return
        }

        const hasUpdates =
            data.updates &&
            Object.keys(data.updates).filter(
                (key) =>
                    data.updates![key as keyof typeof data.updates] !==
                    undefined
            ).length > 0

        if (!hasUpdates) {
            ctx.addIssue({
                code: 'custom',
                path: ['updates'],
                message: 'No updates provided',
            })
            return
        }

        if (
            data.updates?.metadata?.slug &&
            data.updates.metadata.slug !== newsArticle.slug
        ) {
            const [existingNews] = await db
                .select()
                .from(news)
                .where(
                    and(
                        eq(news.slug, data.updates.metadata.slug),
                        ne(news.id, data.id)
                    )
                )
                .limit(1)
            if (existingNews) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['updates', 'metadata', 'slug'],
                    message: 'Slug is already taken',
                })
                return
            }
        }

        ;(data as any).news = newsArticle
    })
    .transform((data) => ({
        news: (data as any).news,
        updates: data.updates,
    }))
