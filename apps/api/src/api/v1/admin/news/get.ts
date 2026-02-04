import { Request, Response } from 'express'
import {
    getDb,
    news,
    newsAuthors,
    newsComments,
    users,
    newsReactions,
} from '@fluxo/db'
import { eq, and, or, ilike, desc, inArray, sql } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { newsCache } from '../../../../utils/cache'

const populateAuthorsAndComments = async (
    newsArticle: any,
    db: ReturnType<typeof getDb>
) => {
    if (!newsArticle) return newsArticle

    const authorsList = await db
        .select({ userId: newsAuthors.userId })
        .from(newsAuthors)
        .where(eq(newsAuthors.newsId, newsArticle.id))

    const authorUserIds = authorsList.map((a) => a.userId)
    const authorUsers =
        authorUserIds.length > 0
            ? await db
                  .select({
                      id: users.id,
                      firstName: users.firstName,
                      lastName: users.lastName,
                      email: users.email,
                      username: users.username,
                      avatarUrl: users.avatarUrl,
                  })
                  .from(users)
                  .where(inArray(users.id, authorUserIds))
            : []

    const commentsList = await db
        .select()
        .from(newsComments)
        .where(eq(newsComments.newsId, newsArticle.id))
        .orderBy(desc(newsComments.createdAt))

    const commentAuthorIds = commentsList.map((c) => c.authorId)
    const commentAuthors =
        commentAuthorIds.length > 0
            ? await db
                  .select({
                      id: users.id,
                      firstName: users.firstName,
                      lastName: users.lastName,
                      email: users.email,
                      username: users.username,
                      avatarUrl: users.avatarUrl,
                  })
                  .from(users)
                  .where(inArray(users.id, commentAuthorIds))
            : []

    const userMap = new Map(
        [...authorUsers, ...commentAuthors].map((user) => [user.id, user])
    )

    const reactions = await db
        .select()
        .from(newsReactions)
        .where(eq(newsReactions.newsId, newsArticle.id))

    const newsObj = {
        ...newsArticle,
        uuid: newsArticle.id.toString(),
        author: authorUsers.map((user) => ({
            id: user.id,
            uuid: user.id.toString(),
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl,
        })),
        comments: commentsList.map((comment) => {
            const author = userMap.get(comment.authorId)
            return {
                ...comment,
                uuid: comment.id.toString(),
                author: author
                    ? {
                          id: author.id,
                          uuid: author.id.toString(),
                          name: `${author.firstName} ${author.lastName}`,
                          email: author.email,
                          username: author.username,
                          avatarUrl: author.avatarUrl,
                      }
                    : null,
            }
        }),
        reactions: {
            likes: reactions.filter((r) => r.reactionType === 'like').length,
            dislikes: reactions.filter((r) => r.reactionType === 'dislike')
                .length,
        },
        metadata: {
            slug: newsArticle.slug,
            featuredImageUrl: newsArticle.featuredImageUrl,
            seoTitle: newsArticle.seoTitle,
            seoDescription: newsArticle.seoDescription,
        },
        timestamps: {
            createdAt: newsArticle.createdAt,
            publishedAt: newsArticle.publishedAt,
            updatedAt: newsArticle.updatedAt,
        },
    }

    return newsObj
}

export const getAllNews = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const search = req.query.search as string
        const visibility = req.query.visibility as string
        const isFeatured = req.query.isFeatured as string
        const tags = req.query.tags as string

        const cacheKey = `list:${page}:${limit}:${search || 'all'}:${visibility || 'all'}:${isFeatured || 'all'}:${tags || 'all'}`
        const cacheGetStart = Date.now()
        const cached = await newsCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart

        if (cached) {
            logger.info(
                `[Cache HIT] getAllNews - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getAllNews - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const conditions = []

        if (search) {
            conditions.push(
                or(
                    ilike(news.title, `%${search}%`),
                    ilike(news.summary, `%${search}%`),
                    ilike(news.content, `%${search}%`)
                )
            )
        }

        if (visibility) {
            conditions.push(eq(news.visibility, visibility as any))
        }

        if (isFeatured) {
            conditions.push(eq(news.isFeatured, isFeatured === 'true'))
        }

        const whereClause =
            conditions.length > 0 ? and(...conditions) : undefined

        const totalQuery = db
            .select({ count: sql<number>`count(*)` })
            .from(news)
        const totalResult = whereClause
            ? await totalQuery.where(whereClause)
            : await totalQuery
        const total = Number(totalResult[0]?.count || 0)

        let newsList = whereClause
            ? await db
                  .select()
                  .from(news)
                  .where(whereClause)
                  .orderBy(desc(news.createdAt))
                  .limit(limit)
                  .offset((page - 1) * limit)
            : await db
                  .select()
                  .from(news)
                  .orderBy(desc(news.createdAt))
                  .limit(limit)
                  .offset((page - 1) * limit)

        if (tags) {
            const tagArray = tags.split(',')
            newsList = newsList.filter((article) => {
                const articleTags = (article.tags as string[]) || []
                return tagArray.some((tag) => articleTags.includes(tag))
            })
        }

        const enrichedNews = await Promise.all(
            newsList.map((article) => populateAuthorsAndComments(article, db))
        )

        const response = {
            success: true,
            message: 'News fetched successfully',
            news: enrichedNews,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }

        const cacheSetStart = Date.now()
        await newsCache.set(cacheKey, response, 180)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getAllNews - Key: ${cacheKey}, TTL: 180s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting news - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}

export const getNewsById = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const newsId = parseInt(
            Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
            10
        )
        if (isNaN(newsId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid news ID',
            })
        }
        const cacheKey = `id:${newsId}`

        const cacheGetStart = Date.now()
        const cached = await newsCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart
        if (cached) {
            logger.info(
                `[Cache HIT] getNewsById - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getNewsById - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const [newsArticle] = await db
            .select()
            .from(news)
            .where(eq(news.id, newsId))
            .limit(1)

        if (!newsArticle) {
            return res.status(404).json({
                success: false,
                message: 'News not found',
            })
        }

        const enrichedNews = await populateAuthorsAndComments(newsArticle, db)

        const response = {
            success: true,
            message: 'News fetched successfully',
            news: enrichedNews,
        }

        const cacheSetStart = Date.now()
        await newsCache.set(cacheKey, response, 300)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getNewsById - Key: ${cacheKey}, TTL: 300s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting news - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}

export const getNewsBySlug = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const slugParam = Array.isArray(req.params.slug)
            ? req.params.slug[0]
            : req.params.slug
        if (!slugParam || typeof slugParam !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid slug',
            })
        }
        const slug = slugParam
        const cacheKey = `slug:${slug}`

        const cacheGetStart = Date.now()
        const cached = await newsCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart
        if (cached) {
            logger.info(
                `[Cache HIT] getNewsBySlug - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getNewsBySlug - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const [newsArticle] = await db
            .select()
            .from(news)
            .where(eq(news.slug, slug))
            .limit(1)

        if (!newsArticle) {
            return res.status(404).json({
                success: false,
                message: 'News not found',
            })
        }

        const enrichedNews = await populateAuthorsAndComments(newsArticle, db)

        const response = {
            success: true,
            message: 'News fetched successfully',
            news: enrichedNews,
        }

        const cacheSetStart = Date.now()
        await newsCache.set(cacheKey, response, 300)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getNewsBySlug - Key: ${cacheKey}, TTL: 300s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting news - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}
