import { z } from 'zod'
import { getDb, news } from '@fluxo/db'
import { eq } from '@fluxo/db'

export const deleteNewsSchema = z
    .object({
        id: z.coerce.number('News ID is required'),
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

        ;(data as any).news = newsArticle
    })
    .transform((data) => ({
        news: (data as any).news,
    }))
