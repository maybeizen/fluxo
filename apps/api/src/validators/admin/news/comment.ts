import { z } from 'zod'
import { getDb, news, newsComments } from '@fluxo/db'
import { eq, and } from '@fluxo/db'

export const addCommentSchema = z
    .object({
        newsId: z.coerce.number('News ID is required'),
        content: z
            .string('Comment content is required')
            .min(1, 'Comment must not be empty')
            .max(1000, 'Comment must be less than 1000 characters'),
    })
    .superRefine(async (data, ctx) => {
        const db = getDb()
        const [newsArticle] = await db
            .select()
            .from(news)
            .where(eq(news.id, data.newsId))
            .limit(1)
        if (!newsArticle) {
            ctx.addIssue({
                code: 'custom',
                path: ['newsId'],
                message: 'News not found',
            })
            return
        }

        ;(data as any).news = newsArticle
    })
    .transform((data) => ({
        news: (data as any).news,
        content: data.content,
    }))

export const deleteCommentSchema = z
    .object({
        newsId: z.coerce.number('News ID is required'),
        commentId: z.coerce.number('Comment ID is required'),
    })
    .superRefine(async (data, ctx) => {
        const db = getDb()
        const [newsArticle] = await db
            .select()
            .from(news)
            .where(eq(news.id, data.newsId))
            .limit(1)
        if (!newsArticle) {
            ctx.addIssue({
                code: 'custom',
                path: ['newsId'],
                message: 'News not found',
            })
            return
        }

        const [comment] = await db
            .select()
            .from(newsComments)
            .where(
                and(
                    eq(newsComments.newsId, data.newsId),
                    eq(newsComments.id, data.commentId)
                )
            )
            .limit(1)
        if (!comment) {
            ctx.addIssue({
                code: 'custom',
                path: ['commentId'],
                message: 'Comment not found',
            })
            return
        }

        ;(data as any).news = newsArticle
        ;(data as any).comment = comment
    })
    .transform((data) => ({
        news: (data as any).news,
        comment: (data as any).comment,
    }))
