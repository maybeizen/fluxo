import { type Request, type Response } from 'express'
import { getDb, settings } from '@fluxo/db'
import { settingsCache } from '../../../utils/cache'
import { logger } from '../../../utils/logger'
import { resolveLogoUrl } from '../../../utils/serializers/user'

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
                appLogoKey: settings.appLogoKey,
                appLogoUrl: settings.appLogoUrl,
                appThemeColor: settings.appThemeColor,
                ticketsEnabled: settings.ticketsEnabled,
                maintenanceMode: settings.maintenanceMode,
                maintenanceMessage: settings.maintenanceMessage,
                announcementEnabled: settings.announcementEnabled,
                announcementMessage: settings.announcementMessage,
            })
            .from(settings)
            .limit(1)

        const appSettings = {
            name: settingsRow?.appName,
            logoUrl: await resolveLogoUrl(settingsRow ?? {}),
            themeColor: settingsRow?.appThemeColor ?? '#ffd952',
            ticketsEnabled: settingsRow?.ticketsEnabled ?? true,
            maintenanceMode: settingsRow?.maintenanceMode ?? false,
            maintenanceMessage: settingsRow?.maintenanceMessage ?? undefined,
            announcementEnabled: settingsRow?.announcementEnabled ?? false,
            announcementMessage: settingsRow?.announcementMessage ?? undefined,
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
