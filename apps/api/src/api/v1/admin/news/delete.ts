import { Request, Response } from 'express'
import { deleteNewsSchema } from '../../../../validators/admin/news/delete'
import { ZodError } from 'zod'
import { getDb, news } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { newsCache } from '../../../../utils/cache'

export const deleteNews = async (req: Request, res: Response) => {
    try {
        const { news: newsArticle } = await deleteNewsSchema.parseAsync({
            id: req.params.id,
        })

        const db = getDb()
        await db.delete(news).where(eq(news.id, newsArticle.id))

        await newsCache.delPattern('list:*')
        await newsCache.delPattern('public:*')
        await newsCache.del(`id:${newsArticle.id}`)
        if (newsArticle?.slug) {
            await newsCache.del(`slug:${newsArticle.slug}`)
        }

        res.status(200).json({
            success: true,
            message: 'News deleted successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error deleting news - ${error}`)

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
