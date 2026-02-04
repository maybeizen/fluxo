import { Request, Response } from 'express'
import { updateNewsSchema } from '../../../../validators/admin/news/update'
import { ZodError } from 'zod'
import { getDb, news } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { newsCache } from '../../../../utils/cache'

export const updateNews = async (req: Request, res: Response) => {
    try {
        const validated = await updateNewsSchema.parseAsync({
            id: req.params.id,
            updates: req.body,
        })

        const db = getDb()
        const updateData: any = { updatedAt: new Date() }

        if (validated.updates.title) updateData.title = validated.updates.title
        if (validated.updates.content)
            updateData.content = validated.updates.content
        if (validated.updates.summary)
            updateData.summary = validated.updates.summary
        if (validated.updates.isFeatured !== undefined)
            updateData.isFeatured = validated.updates.isFeatured
        if (validated.updates.tags) updateData.tags = validated.updates.tags
        if (validated.updates.visibility)
            updateData.visibility = validated.updates.visibility

        if (validated.updates.metadata) {
            if (validated.updates.metadata.slug)
                updateData.slug = validated.updates.metadata.slug
            if (validated.updates.metadata.featuredImageUrl !== undefined)
                updateData.featuredImageUrl =
                    validated.updates.metadata.featuredImageUrl || null
            if (validated.updates.metadata.seoTitle !== undefined)
                updateData.seoTitle =
                    validated.updates.metadata.seoTitle || null
            if (validated.updates.metadata.seoDescription !== undefined)
                updateData.seoDescription =
                    validated.updates.metadata.seoDescription || null
        }

        await db
            .update(news)
            .set(updateData)
            .where(eq(news.id, validated.news.id))

        const [updatedNews] = await db
            .select()
            .from(news)
            .where(eq(news.id, validated.news.id))
            .limit(1)

        await newsCache.delPattern('list:*')
        await newsCache.delPattern('public:*')
        await newsCache.del(`id:${validated.news.id}`)
        if (updatedNews?.slug) {
            await newsCache.del(`slug:${updatedNews.slug}`)
        }

        const transformedNews = {
            ...updatedNews,
            uuid: updatedNews.id.toString(),
            metadata: {
                slug: updatedNews.slug,
                featuredImageUrl: updatedNews.featuredImageUrl,
                seoTitle: updatedNews.seoTitle,
                seoDescription: updatedNews.seoDescription,
            },
            timestamps: {
                createdAt: updatedNews.createdAt,
                publishedAt: updatedNews.publishedAt,
                updatedAt: updatedNews.updatedAt,
            },
        }

        res.status(200).json({
            success: true,
            message: 'News updated successfully',
            news: transformedNews,
        })
    } catch (error: unknown) {
        logger.error(`Error updating news - ${error}`)

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
