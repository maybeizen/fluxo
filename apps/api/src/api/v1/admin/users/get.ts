import { Request, Response } from 'express'
import { getDb, users } from '@fluxo/db'
import { eq, and, or, ilike, desc, sql } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { userCache } from '../../../../utils/cache'

export const getAllUsers = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const search = req.query.search as string
        const role = req.query.role as string
        const verified = req.query.verified as string

        const cacheKey = `list:${page}:${limit}:${search || 'all'}:${role || 'all'}:${verified || 'all'}`
        const cacheGetStart = Date.now()
        const cached = await userCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart

        if (cached) {
            logger.info(
                `[Cache HIT] getAllUsers - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getAllUsers - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const conditions = []

        if (search) {
            conditions.push(
                or(
                    ilike(users.email, `%${search}%`),
                    ilike(users.firstName, `%${search}%`),
                    ilike(users.lastName, `%${search}%`),
                    ilike(users.username, `%${search}%`)
                )
            )
        }

        if (role) {
            conditions.push(eq(users.role, role as any))
        }

        if (verified) {
            conditions.push(eq(users.isVerified, verified === 'true'))
        }

        const whereClause =
            conditions.length > 0 ? and(...conditions) : undefined

        const totalResult = whereClause
            ? await db
                  .select({ count: sql<number>`count(*)` })
                  .from(users)
                  .where(whereClause)
            : await db.select({ count: sql<number>`count(*)` }).from(users)
        const total = Number(totalResult[0]?.count || 0)

        const usersList = whereClause
            ? await db
                  .select({
                      id: users.id,
                      email: users.email,
                      firstName: users.firstName,
                      lastName: users.lastName,
                      role: users.role,
                      isVerified: users.isVerified,
                      username: users.username,
                      slug: users.slug,
                      headline: users.headline,
                      about: users.about,
                      avatarUrl: users.avatarUrl,
                      isBanned: users.isBanned,
                      isTicketBanned: users.isTicketBanned,
                      createdAt: users.createdAt,
                      updatedAt: users.updatedAt,
                  })
                  .from(users)
                  .where(whereClause)
                  .orderBy(desc(users.createdAt))
                  .limit(limit)
                  .offset((page - 1) * limit)
            : await db
                  .select({
                      id: users.id,
                      email: users.email,
                      firstName: users.firstName,
                      lastName: users.lastName,
                      role: users.role,
                      isVerified: users.isVerified,
                      username: users.username,
                      slug: users.slug,
                      headline: users.headline,
                      about: users.about,
                      avatarUrl: users.avatarUrl,
                      isBanned: users.isBanned,
                      isTicketBanned: users.isTicketBanned,
                      createdAt: users.createdAt,
                      updatedAt: users.updatedAt,
                  })
                  .from(users)
                  .orderBy(desc(users.createdAt))
                  .limit(limit)
                  .offset((page - 1) * limit)

        const transformedUsers = usersList.map((u) => ({
            ...u,
            uuid: u.id.toString(),
            profile: {
                username: u.username,
                slug: u.slug,
                headline: u.headline,
                about: u.about,
                avatarUrl: u.avatarUrl,
            },
            timestamps: {
                createdAt: u.createdAt,
                updatedAt: u.updatedAt,
            },
        }))

        const response = {
            success: true,
            message: 'Users fetched successfully',
            users: transformedUsers,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }

        const cacheSetStart = Date.now()
        await userCache.set(cacheKey, response, 180)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getAllUsers - Key: ${cacheKey}, TTL: 180s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting users - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}

export const getUserByEmail = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const emailParam = Array.isArray(req.params.email)
            ? req.params.email[0]
            : req.params.email
        if (!emailParam || typeof emailParam !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid email',
            })
        }
        const email = emailParam
        const cacheKey = `email:${email}`

        const cacheGetStart = Date.now()
        const cached = await userCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart
        if (cached) {
            logger.info(
                `[Cache HIT] getUserByEmail - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getUserByEmail - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                role: users.role,
                isVerified: users.isVerified,
                username: users.username,
                slug: users.slug,
                headline: users.headline,
                about: users.about,
                avatarUrl: users.avatarUrl,
                isBanned: users.isBanned,
                isTicketBanned: users.isTicketBanned,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            })
        }

        const transformedUser = {
            ...user,
            uuid: user.id.toString(),
            profile: {
                username: user.username,
                slug: user.slug,
                headline: user.headline,
                about: user.about,
                avatarUrl: user.avatarUrl,
            },
            timestamps: {
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        }

        const response = {
            success: true,
            message: 'User fetched successfully',
            user: transformedUser,
        }

        const cacheSetStart = Date.now()
        await userCache.set(cacheKey, response, 300)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getUserByEmail - Key: ${cacheKey}, TTL: 300s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting user - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}

export const getUserById = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const userIdParam = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id
        const userIdInt = parseInt(userIdParam, 10)
        if (isNaN(userIdInt)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID',
            })
        }
        const cacheKey = `id:${userIdInt}`

        const cacheGetStart = Date.now()
        const cached = await userCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart
        if (cached) {
            logger.info(
                `[Cache HIT] getUserById - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getUserById - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                role: users.role,
                isVerified: users.isVerified,
                username: users.username,
                slug: users.slug,
                headline: users.headline,
                about: users.about,
                avatarUrl: users.avatarUrl,
                isBanned: users.isBanned,
                isTicketBanned: users.isTicketBanned,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, userIdInt))
            .limit(1)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            })
        }

        const transformedUser = {
            ...user,
            uuid: user.id.toString(),
            profile: {
                username: user.username,
                slug: user.slug,
                headline: user.headline,
                about: user.about,
                avatarUrl: user.avatarUrl,
            },
            timestamps: {
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        }

        const response = {
            success: true,
            message: 'User fetched successfully',
            user: transformedUser,
        }

        const cacheSetStart = Date.now()
        await userCache.set(cacheKey, response, 300)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getUserById - Key: ${cacheKey}, TTL: 300s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting user - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}

export const getUserByUsername = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const usernameParam = Array.isArray(req.params.username)
            ? req.params.username[0]
            : req.params.username
        if (!usernameParam || typeof usernameParam !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid username',
            })
        }
        const username = usernameParam
        const cacheKey = `username:${username}`

        const cacheGetStart = Date.now()
        const cached = await userCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart
        if (cached) {
            logger.info(
                `[Cache HIT] getUserByUsername - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getUserByUsername - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                role: users.role,
                isVerified: users.isVerified,
                username: users.username,
                slug: users.slug,
                headline: users.headline,
                about: users.about,
                avatarUrl: users.avatarUrl,
                isBanned: users.isBanned,
                isTicketBanned: users.isTicketBanned,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.username, username))
            .limit(1)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            })
        }

        const transformedUser = {
            ...user,
            uuid: user.id.toString(),
            profile: {
                username: user.username,
                slug: user.slug,
                headline: user.headline,
                about: user.about,
                avatarUrl: user.avatarUrl,
            },
            timestamps: {
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        }

        const response = {
            success: true,
            message: 'User fetched successfully',
            user: transformedUser,
        }

        const cacheSetStart = Date.now()
        await userCache.set(cacheKey, response, 300)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getUserByUsername - Key: ${cacheKey}, TTL: 300s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting user - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}
