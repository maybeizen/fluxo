import { Request, Response } from 'express'
import { getDb, settings } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { decrypt } from '../../../../utils/encryption'
import { settingsCache } from '../../../../utils/cache'

export const getPterodactylSettings = async (req: Request, res: Response) => {
    try {
        const db = getDb()
        const [settingsRow] = await db.select().from(settings).limit(1)

        if (!settingsRow) {
            return res.status(404).json({
                success: false,
                message: 'Settings not found',
            })
        }

        const pterodactylSettings = {
            baseUrl: settingsRow.pterodactylBaseUrl,
            apiKey: settingsRow.pterodactylApiKey
                ? decrypt(settingsRow.pterodactylApiKey)
                : undefined,
        }

        res.status(200).json({
            success: true,
            message: 'Pterodactyl settings fetched successfully',
            settings: pterodactylSettings,
        })
    } catch (error: unknown) {
        logger.error(`Error fetching Pterodactyl settings: ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
