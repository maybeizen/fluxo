import { type Request, type Response } from 'express'
import { addCommentSchema } from '../../../validators/admin/news/comment'
import { ZodError } from 'zod'
import { getDb, news, newsComments, users } from '@fluxo/db'
import { eq, and } from '@fluxo/db'
import { logger } from '../../../utils/logger'
import { NewsVisibility } from '@fluxo/types'
import { paramString } from '../../../utils/sanitize'
import { serializeNewsAuthor } from '../../../utils/serializers/user'

export const addPublicComment = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId
        const slug = paramString(req.params.slug)

        const validated = await addCommentSchema.parseAsync({
            newsId: slug,
            content: req.body.content,
        })

        const db = getDb()
        const [newsArticle] = await db
            .select()
            .from(news)
            .where(
                and(
                    eq(news.slug, slug),
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
                avatarKey: users.avatarKey,
                avatarUrl: users.avatarUrl,
                firstName: users.firstName,
                lastName: users.lastName,
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

        const serializedAuthor = await serializeNewsAuthor(user)

        const comment = {
            ...newComment,
            uuid: newComment.id.toString(),
            author: {
                ...serializedAuthor,
                name: user.username,
                email: user.email,
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
