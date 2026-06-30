import { type Request, type Response } from 'express'
import { getDb, userDiscord } from '@fluxo/db'
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
        const [discordRow] = await db
            .select({ id: userDiscord.id })
            .from(userDiscord)
            .where(eq(userDiscord.userId, req.userId))
            .limit(1)

        if (!discordRow) {
            return res.status(400).json({
                success: false,
                message: 'Discord account not connected',
            })
        }

        await db.delete(userDiscord).where(eq(userDiscord.userId, req.userId))

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
