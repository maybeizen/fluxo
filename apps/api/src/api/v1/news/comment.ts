import { Request, Response } from 'express'
import { addCommentSchema } from '../../../validators/admin/news/comment'
import { ZodError } from 'zod'
import { getDb, news, newsComments, users } from '@fluxo/db'
import { eq, and } from '@fluxo/db'
import { logger } from '../../../utils/logger'
import { NewsVisibility } from '@fluxo/types'

export const addPublicComment = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId

        const validated = await addCommentSchema.parseAsync({
            newsId: req.params.slug,
            content: req.body.content,
        })

        const db = getDb()
        const [newsArticle] = await db
            .select()
            .from(news)
            .where(
                and(
                    eq(news.slug, req.params.slug),
                    eq(news.visibility, NewsVisibility.PUBLIC)
                )
            )
            .limit(1)

        if (!newsArticle) {
            return res.status(404).json({
                success: false,
                message: 'News not found',
            })
        }

        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                username: users.username,
                slug: users.slug,
                headline: users.headline,
                about: users.about,
                avatarUrl: users.avatarUrl,
            })
            .from(users)
            .where(eq(users.id, userId))
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
                newsId: newsArticle.id,
                authorId: user.id,
                content: validated.content,
            })
            .returning()

        const comment = {
            ...newComment,
            uuid: newComment.id.toString(),
            author: {
                id: user.id,
                uuid: user.id.toString(),
                name: `${user.username}`,
                email: user.email,
                username: user.username,
                avatarUrl: user.avatarUrl,
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
