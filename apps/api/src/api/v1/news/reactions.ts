import { Request, Response } from 'express'
import { getDb, news, newsReactions } from '@fluxo/db'
import { eq, and } from '@fluxo/db'
import { logger } from '../../../utils/logger'
import { NewsVisibility } from '@fluxo/types'

export const getUserReaction = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(200).json({
                success: true,
                reaction: null,
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

        const [reaction] = await db
            .select()
            .from(newsReactions)
            .where(
                and(
                    eq(newsReactions.newsId, newsArticle.id),
                    eq(newsReactions.userId, userId)
                )
            )
            .limit(1)

        res.status(200).json({
            success: true,
            reaction: reaction ? reaction.reactionType : null,
        })
    } catch (error: unknown) {
        logger.error(`Error getting user reaction - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}

export const likeNews = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'You must be logged in to react to news',
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

        const [existingReaction] = await db
            .select()
            .from(newsReactions)
            .where(
                and(
                    eq(newsReactions.newsId, newsArticle.id),
                    eq(newsReactions.userId, userId)
                )
            )
            .limit(1)

        const allReactions = await db
            .select()
            .from(newsReactions)
            .where(eq(newsReactions.newsId, newsArticle.id))

        const likes = allReactions.filter(
            (r) => r.reactionType === 'like'
        ).length
        const dislikes = allReactions.filter(
            (r) => r.reactionType === 'dislike'
        ).length

        if (existingReaction) {
            if (existingReaction.reactionType === 'like') {
                await db
                    .delete(newsReactions)
                    .where(eq(newsReactions.id, existingReaction.id))

                return res.status(200).json({
                    success: true,
                    message: 'Like removed',
                    reactions: {
                        likes: likes - 1,
                        dislikes,
                    },
                    removed: true,
                })
            } else {
                await db
                    .update(newsReactions)
                    .set({ reactionType: 'like', updatedAt: new Date() })
                    .where(eq(newsReactions.id, existingReaction.id))

                return res.status(200).json({
                    success: true,
                    message: 'Reaction updated to like',
                    reactions: {
                        likes: likes + 1,
                        dislikes: dislikes - 1,
                    },
                })
            }
        }

        await db.insert(newsReactions).values({
            newsId: newsArticle.id,
            userId,
            reactionType: 'like',
        })

        res.status(200).json({
            success: true,
            message: 'News liked successfully',
            reactions: {
                likes: likes + 1,
                dislikes,
            },
        })
    } catch (error: unknown) {
        logger.error(`Error liking news - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}

export const dislikeNews = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'You must be logged in to react to news',
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

        const [existingReaction] = await db
            .select()
            .from(newsReactions)
            .where(
                and(
                    eq(newsReactions.newsId, newsArticle.id),
                    eq(newsReactions.userId, userId)
                )
            )
            .limit(1)

        const allReactions = await db
            .select()
            .from(newsReactions)
            .where(eq(newsReactions.newsId, newsArticle.id))

        const likes = allReactions.filter(
            (r) => r.reactionType === 'like'
        ).length
        const dislikes = allReactions.filter(
            (r) => r.reactionType === 'dislike'
        ).length

        if (existingReaction) {
            if (existingReaction.reactionType === 'dislike') {
                await db
                    .delete(newsReactions)
                    .where(eq(newsReactions.id, existingReaction.id))

                return res.status(200).json({
                    success: true,
                    message: 'Dislike removed',
                    reactions: {
                        likes,
                        dislikes: dislikes - 1,
                    },
                    removed: true,
                })
            } else {
                await db
                    .update(newsReactions)
                    .set({ reactionType: 'dislike', updatedAt: new Date() })
                    .where(eq(newsReactions.id, existingReaction.id))

                return res.status(200).json({
                    success: true,
                    message: 'Reaction updated to dislike',
                    reactions: {
                        likes: likes - 1,
                        dislikes: dislikes + 1,
                    },
                })
            }
        }

        await db.insert(newsReactions).values({
            newsId: newsArticle.id,
            userId,
            reactionType: 'dislike',
        })

        res.status(200).json({
            success: true,
            message: 'News disliked successfully',
            reactions: {
                likes,
                dislikes: dislikes + 1,
            },
        })
    } catch (error: unknown) {
        logger.error(`Error disliking news - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}
