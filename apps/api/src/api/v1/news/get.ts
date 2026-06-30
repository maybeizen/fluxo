import { type Request, type Response } from 'express'
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
import { paramString } from '../../../utils/sanitize'
import { serializeNewsAuthor } from '../../../utils/serializers/user'

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
                      avatarKey: users.avatarKey,
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
                      avatarKey: users.avatarKey,
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
        author: await Promise.all(
            authorUsers.map((user) => serializeNewsAuthor(user))
        ),
        comments: await Promise.all(
            commentsList.map(async (comment) => {
                const author = userMap.get(comment.authorId)
                return {
                    ...comment,
                    uuid: comment.id.toString(),
                    author: author ? await serializeNewsAuthor(author) : null,
                }
            })
        ),
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
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const search = req.query.search as string
        const tags = req.query.tags as string
        const featured = req.query.featured as string

        const cacheKey = `public:list:${page}:${limit}:${search || 'all'}:${tags || 'all'}:${featured || 'all'}`
        const cached = await newsCache.get(cacheKey)

        if (cached) {
            return res.status(200).json(cached)
        }

        const db = getDb()
        const conditions = [eq(news.visibility, NewsVisibility.PUBLIC)]

        if (search) {
            const searchCondition = or(
                ilike(news.title, `%${search}%`),
                ilike(news.summary, `%${search}%`)
            )
            if (searchCondition) conditions.push(searchCondition)
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

        const newsList = await (
            whereClause
                ? db.select().from(news).where(whereClause)
                : db.select().from(news)
        )
            .orderBy(desc(news.publishedAt))
            .limit(limit)
            .offset((page - 1) * limit)

        let filteredNewsList = newsList
        if (tags) {
            const tagArray = tags.split(',')
            filteredNewsList = newsList.filter((article) => {
                const articleTags = (article.tags as string[]) || []
                return tagArray.some((tag) => articleTags.includes(tag))
            })
        }

        const enrichedNews = await Promise.all(
            filteredNewsList.map((article) =>
                populateAuthorsAndComments(article, db)
            )
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

        await newsCache.set(cacheKey, response, 180)

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
    try {
        const limit = parseInt(req.query.limit as string) || 5

        const cacheKey = `public:featured:${limit}`
        const cached = await newsCache.get(cacheKey)

        if (cached) {
            return res.status(200).json(cached)
        }

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

        await newsCache.set(cacheKey, response, 300)

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
    try {
        const slug = paramString(req.params.slug)
        const cacheKey = `public:slug:${slug}`
        const cached = await newsCache.get(cacheKey)
        if (cached) {
            return res.status(200).json(cached)
        }

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

        await newsCache.set(cacheKey, response, 300)

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
    try {
        const cacheKey = 'public:tags'
        const cached = await newsCache.get(cacheKey)

        if (cached) {
            return res.status(200).json(cached)
        }

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

        await newsCache.set(cacheKey, response, 600)

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
