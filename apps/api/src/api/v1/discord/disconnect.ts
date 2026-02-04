import { Request, Response } from 'express'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../utils/logger'

export const disconnectDiscord = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const db = getDb()
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, req.userId))
            .limit(1)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            })
        }

        if (!user.discordId) {
            return res.status(400).json({
                success: false,
                message: 'Discord account not connected',
            })
        }

        await db
            .update(users)
            .set({
                discordId: null,
                discordUsername: null,
                discordAvatarHash: null,
                discordAccessToken: null,
                discordRefreshToken: null,
                discordTokenExpiresAt: null,
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id))

        res.status(200).json({
            success: true,
            message: 'Discord account disconnected successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error disconnecting Discord - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
