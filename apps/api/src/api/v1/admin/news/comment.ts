import { Request, Response } from 'express'
import {
    addCommentSchema,
    deleteCommentSchema,
} from '../../../../validators/admin/news/comment'
import { ZodError } from 'zod'
import { getDb, news, newsComments, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { newsCache } from '../../../../utils/cache'

export const addComment = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const newsIdParam = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id
        const newsId = parseInt(newsIdParam, 10)
        if (isNaN(newsId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid news ID',
            })
        }

        const validated = await addCommentSchema.parseAsync({
            newsId,
            content: req.body.content,
        })

        const db = getDb()
        const [user] = await db
            .select({
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
                username: users.username,
                avatarUrl: users.avatarUrl,
            })
            .from(users)
            .where(eq(users.id, req.userId))
            .limit(1)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            })
        }

        const [newComment] = await db
            .insert(newsComments)
            .values({
                newsId: validated.news.id,
                authorId: user.id,
                content: validated.content,
            })
            .returning()

        await newsCache.del(`id:${validated.news.id}`)
        await newsCache.delPattern('public:*')
        if (validated.news.slug) {
            await newsCache.del(`slug:${validated.news.slug}`)
        }

        const comment = {
            ...newComment,
            uuid: newComment.id.toString(),
            author: {
                id: user.id,
                uuid: user.id.toString(),
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                avatarUrl: user.avatarUrl || '',
            },
        }

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            comment,
        })
    } catch (error: unknown) {
        logger.error(`Error adding comment - ${error}`)

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

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const newsIdParam = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id
        const commentIdParam = Array.isArray(req.params.commentId)
            ? req.params.commentId[0]
            : req.params.commentId
        const newsId = parseInt(newsIdParam, 10)
        const commentId = parseInt(commentIdParam, 10)
        if (isNaN(newsId) || isNaN(commentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid news ID or comment ID',
            })
        }

        const { comment } = await deleteCommentSchema.parseAsync({
            newsId,
            commentId,
        })

        const db = getDb()
        await db.delete(newsComments).where(eq(newsComments.id, comment.id))

        await newsCache.del(`id:${comment.newsId}`)
        await newsCache.delPattern('public:*')
        const [newsArticle] = await db
            .select({ slug: news.slug })
            .from(news)
            .where(eq(news.id, comment.newsId))
            .limit(1)
        if (newsArticle?.slug) {
            await newsCache.del(`slug:${newsArticle.slug}`)
        }

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error deleting comment - ${error}`)

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
