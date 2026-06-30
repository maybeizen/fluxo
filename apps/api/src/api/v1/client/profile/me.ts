import { type Request, type Response } from 'express'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { serializeProfile } from '../../../../utils/serializers/user'

export const me = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

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
                avatarKey: users.avatarKey,
                avatarUrl: users.avatarUrl,
                isBanned: users.isBanned,
                isTicketBanned: users.isTicketBanned,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, req.userId))
            .limit(1)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Could not find your profile',
            })
        }

        const profile = await serializeProfile(user)

        res.status(200).json({
            success: true,
            message: 'Fetched your profile successfully',
            profile,
        })
    } catch (error: unknown) {
        logger.error(`Error fetching profile - ${error}`)

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
