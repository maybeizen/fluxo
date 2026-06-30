import { type Request, type Response } from 'express'
import { getProfileSchema } from '../../../../validators/profile/get'
import { logger } from '../../../../utils/logger'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { userCache } from '../../../../utils/cache'
import { serializeProfile } from '../../../../utils/serializers/user'

export const getProfile = async (req: Request, res: Response) => {
    try {
        const { username } = getProfileSchema.parse(req.params)

        const cacheKey = `profile:${username}`
        const cached = await userCache.get(cacheKey)

        if (cached) {
            return res.status(200).json(cached)
        }

        const db = getDb()
        const [user] = await db
            .select({
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                role: users.role,
                isVerified: users.isVerified,
                username: users.username,
                slug: users.slug,
                headline: users.headline,
                about: users.about,
                avatarKey: users.avatarKey,
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

        const profile = await serializeProfile(user)

        const response = {
            success: true,
            message: 'Profile fetched successfully',
            profile,
        }

        await userCache.set(cacheKey, response, 300)

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error fetching profile - ${error}`)

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
