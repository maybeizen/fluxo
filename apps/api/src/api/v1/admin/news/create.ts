import { Request, Response } from 'express'
import { createNewsSchema } from '../../../../validators/admin/news/create'
import { ZodError } from 'zod'
import { getDb, news, newsAuthors } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { newsCache } from '../../../../utils/cache'

export const createNews = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const validated = await createNewsSchema.parseAsync(req.body)

        const db = getDb()
        const [newNews] = await db
            .insert(news)
            .values({
                title: validated.title,
                content: validated.content,
                summary: validated.summary,
                isFeatured: validated.isFeatured,
                tags: validated.tags,
                visibility: validated.visibility as
                    | 'public'
                    | 'private'
                    | 'draft'
                    | 'archived',
                slug: validated.metadata.slug,
                featuredImageUrl: validated.metadata.featuredImageUrl || null,
                seoTitle: validated.metadata.seoTitle || null,
                seoDescription: validated.metadata.seoDescription || null,
            })
            .returning()

        await db.insert(newsAuthors).values({
            newsId: newNews.id,
            userId: req.userId,
        })

        await newsCache.delPattern('list:*')
        await newsCache.delPattern('public:*')

        const transformedNews = {
            ...newNews,
            uuid: newNews.id.toString(),
            metadata: {
                slug: newNews.slug,
                featuredImageUrl: newNews.featuredImageUrl,
                seoTitle: newNews.seoTitle,
                seoDescription: newNews.seoDescription,
            },
            timestamps: {
                createdAt: newNews.createdAt,
                publishedAt: newNews.publishedAt,
                updatedAt: newNews.updatedAt,
            },
        }

        res.status(201).json({
            success: true,
            message: 'News created successfully',
            news: transformedNews,
        })
    } catch (error: unknown) {
        logger.error(`Error creating news - ${error}`)

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}
