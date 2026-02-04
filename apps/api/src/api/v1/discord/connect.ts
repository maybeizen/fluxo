import { Request, Response } from 'express'
import { env } from '../../../utils/env'
import { logger } from '../../../utils/logger'

export const initiateDiscordOAuth = async (req: Request, res: Response) => {
    try {
        const state = req.session.userId
        if (!state) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Login required.',
            })
        }

        const params = new URLSearchParams({
            client_id: env.DISCORD_CLIENT_ID,
            redirect_uri: env.DISCORD_REDIRECT_URI,
            response_type: 'code',
            scope: 'identify',
            state,
        })

        const authUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`

        res.status(200).json({
            success: true,
            message: 'Discord OAuth URL generated',
            authUrl,
        })
    } catch (error: unknown) {
        logger.error(`Error initiating Discord OAuth - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
