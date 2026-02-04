import { Request, Response } from 'express'
import { getDb, news, newsRead } from '@fluxo/db'
import { eq, and, inArray } from '@fluxo/db'
import { logger } from '../../../utils/logger'
import { NewsVisibility } from '@fluxo/types'

export const markNewsAsRead = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'You must be logged in to mark news as read',
            })
        }

        const userId = req.userId
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

        const [existingRead] = await db
            .select()
            .from(newsRead)
            .where(
                and(
                    eq(newsRead.newsId, newsArticle.id),
                    eq(newsRead.userId, userId)
                )
            )
            .limit(1)

        if (existingRead) {
            return res.status(200).json({
                success: true,
                message: 'News already marked as read',
            })
        }

        await db.insert(newsRead).values({
            newsId: newsArticle.id,
            userId,
        })

        res.status(200).json({
            success: true,
            message: 'News marked as read',
        })
    } catch (error: unknown) {
        logger.error(`Error marking news as read - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}

export const markAllNewsAsRead = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'You must be logged in to mark news as read',
            })
        }

        const userId = req.userId
        const db = getDb()

        const allNewsList = await db
            .select({ id: news.id })
            .from(news)
            .where(eq(news.visibility, NewsVisibility.PUBLIC))

        const alreadyReadList = await db
            .select({ newsId: newsRead.newsId })
            .from(newsRead)
            .where(eq(newsRead.userId, userId))

        const alreadyReadSet = new Set(alreadyReadList.map((r) => r.newsId))

        const unreadNews = allNewsList.filter(
            (article) => !alreadyReadSet.has(article.id)
        )

        if (unreadNews.length > 0) {
            await db.insert(newsRead).values(
                unreadNews.map((article) => ({
                    newsId: article.id,
                    userId,
                }))
            )
        }

        res.status(200).json({
            success: true,
            message: `Marked ${unreadNews.length} news article(s) as read`,
            markedCount: unreadNews.length,
        })
    } catch (error: unknown) {
        logger.error(`Error marking all news as read - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}
