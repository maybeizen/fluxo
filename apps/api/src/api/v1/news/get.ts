import { Request, Response } from 'express'
import {
    getDb,
    news,
    newsAuthors,
    newsComments,
    newsRead,
    users,
    newsReactions,
} from '@fluxo/db'
import { eq, and, or, ilike, desc, inArray, sql } from '@fluxo/db'
import { logger } from '../../../utils/logger'
import { NewsVisibility } from '@fluxo/types'
import { newsCache } from '../../../utils/cache'

const populateAuthorsAndComments = async (
    newsArticle: any,
    db: ReturnType<typeof getDb>
) => {
    if (!newsArticle) return newsArticle

    const authorsList = await db
        .select({
            userId: newsAuthors.userId,
        })
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

    const reactions = await db
        .select()
        .from(newsReactions)
        .where(eq(newsReactions.newsId, newsArticle.id))

    newsObj.reactions = {
        likes: reactions.filter((r) => r.reactionType === 'like').length,
        dislikes: reactions.filter((r) => r.reactionType === 'dislike').length,
    }

    return newsObj
}

export const getPublishedNews = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const search = req.query.search as string
        const tags = req.query.tags as string
        const featured = req.query.featured as string

        const cacheKey = `public:list:${page}:${limit}:${search || 'all'}:${tags || 'all'}:${featured || 'all'}`
        const cacheGetStart = Date.now()
        const cached = await newsCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart

        if (cached) {
            logger.info(
                `[Cache HIT] getPublishedNews - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getPublishedNews - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const conditions = [eq(news.visibility, NewsVisibility.PUBLIC)]

        if (search) {
            conditions.push(
                or(
                    ilike(news.title, `%${search}%`),
                    ilike(news.summary, `%${search}%`)
                )
            )
        }

        if (tags) {
            const tagArray = tags.split(',')
        }

        if (featured === 'true') {
            conditions.push(eq(news.isFeatured, true))
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

        let newsQuery = db.select().from(news)
        if (whereClause) {
            newsQuery = newsQuery.where(whereClause)
        }
        let newsList = await newsQuery
            .orderBy(desc(news.publishedAt))
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

        let newsWithReadStatus = enrichedNews
        if (req.userId) {
            const newsIds = enrichedNews.map((n: any) => n.id)
            const readRecords = await db
                .select({ newsId: newsRead.newsId })
                .from(newsRead)
                .where(
                    and(
                        eq(newsRead.userId, req.userId),
                        inArray(newsRead.newsId, newsIds)
                    )
                )

            const readSet = new Set(readRecords.map((r) => r.newsId))

            newsWithReadStatus = enrichedNews.map((article: any) => ({
                ...article,
                isRead: readSet.has(article.id),
            }))
        }

        const response = {
            success: true,
            message: 'News fetched successfully',
            news: newsWithReadStatus,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }

        const cacheSetStart = Date.now()
        await newsCache.set(cacheKey, response, 180)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getPublishedNews - Key: ${cacheKey}, TTL: 180s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting published news - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}

export const getFeaturedNews = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const limit = parseInt(req.query.limit as string) || 5

        const cacheKey = `public:featured:${limit}`
        const cacheGetStart = Date.now()
        const cached = await newsCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart

        if (cached) {
            logger.info(
                `[Cache HIT] getFeaturedNews - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getFeaturedNews - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const newsList = await db
            .select()
            .from(news)
            .where(
                and(
                    eq(news.visibility, NewsVisibility.PUBLIC),
                    eq(news.isFeatured, true)
                )
            )
            .orderBy(desc(news.publishedAt))
            .limit(limit)

        const enrichedNews = await Promise.all(
            newsList.map((article) => populateAuthorsAndComments(article, db))
        )

        const response = {
            success: true,
            message: 'Featured news fetched successfully',
            news: enrichedNews,
        }

        const cacheSetStart = Date.now()
        await newsCache.set(cacheKey, response, 300)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getFeaturedNews - Key: ${cacheKey}, TTL: 300s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting featured news - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}

export const getPublishedNewsBySlug = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const slug = req.params.slug
        const cacheKey = `public:slug:${slug}`

        const cacheGetStart = Date.now()
        const cached = await newsCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart
        if (cached) {
            logger.info(
                `[Cache HIT] getPublishedNewsBySlug - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getPublishedNewsBySlug - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

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
            `[Cache SET] getPublishedNewsBySlug - Key: ${cacheKey}, TTL: 300s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
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

export const getTags = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const cacheKey = 'public:tags'
        const cacheGetStart = Date.now()
        const cached = await newsCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart

        if (cached) {
            logger.info(
                `[Cache HIT] getTags - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getTags - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const newsList = await db
            .select({ tags: news.tags })
            .from(news)
            .where(eq(news.visibility, NewsVisibility.PUBLIC))

        const allTags = new Set<string>()
        newsList.forEach((article) => {
            const tags = (article.tags as string[]) || []
            tags.forEach((tag) => allTags.add(tag))
        })

        const tags = Array.from(allTags).sort()

        const response = {
            success: true,
            message: 'Tags fetched successfully',
            tags,
        }

        const cacheSetStart = Date.now()
        await newsCache.set(cacheKey, response, 600)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getTags - Key: ${cacheKey}, TTL: 600s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting tags - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}
