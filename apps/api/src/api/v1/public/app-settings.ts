import { Request, Response } from 'express'
import { getDb, settings } from '@fluxo/db'
import { settingsCache } from '../../../utils/cache'
import { logger } from '../../../utils/logger'

export const getAppSettings = async (req: Request, res: Response) => {
    try {
        const cacheKey = 'public:app-settings'
        const cached = await settingsCache.get(cacheKey)

        if (cached) {
            return res.status(200).json({
                success: true,
                settings: cached,
            })
        }

        const db = getDb()
        const [settingsRow] = await db
            .select({
                appName: settings.appName,
                appLogoUrl: settings.appLogoUrl,
            })
            .from(settings)
            .limit(1)

        const appSettings = {
            name: settingsRow?.appName,
            logoUrl: settingsRow?.appLogoUrl,
        }

        await settingsCache.set(cacheKey, appSettings, 600)

        res.status(200).json({
            success: true,
            settings: appSettings,
        })
    } catch (error: unknown) {
        logger.error(`Error fetching app settings: ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
