import { Request, Response } from 'express'
import { getProfileSchema } from '../../../../validators/profile/get'
import { logger } from '../../../../utils/logger'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { userCache } from '../../../../utils/cache'

export const getProfile = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const { username } = getProfileSchema.parse(req.params)

        const cacheKey = `profile:${username}`
        const cacheGetStart = Date.now()
        const cached = await userCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart

        if (cached) {
            logger.info(
                `[Cache HIT] getProfile - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getProfile - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
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

        const profile = {
            ...user,
            uuid: user.id.toString(),
            profile: {
                username: user.username,
                slug: user.slug,
                headline: user.headline,
                about: user.about,
                avatarUrl: user.avatarUrl,
            },
        }

        const response = {
            success: true,
            message: 'Profile fetched successfully',
            profile,
        }

        const cacheSetStart = Date.now()
        await userCache.set(cacheKey, response, 300)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getProfile - Key: ${cacheKey}, TTL: 300s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error fetching profile - ${error}`)

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
