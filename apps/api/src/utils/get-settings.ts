import { getDb, settings } from '@fluxo/db'
import { settingsCache } from './cache'

export interface CachedSettings {
    auth?: {
        disableEmailVerification?: boolean
        disableRegistration?: boolean
        disableLogin?: boolean
        disablePasswordChange?: boolean
    }
    security?: {
        cloudflare?: {
            turnstileEnabled?: boolean
            turnstileSiteKey?: string
            turnstileSecretKey?: string
        }
    }
}

export const getSettings = async (): Promise<CachedSettings | null> => {
    const cacheKey = 'global:minimal'

    const cached = await settingsCache.get<CachedSettings>(cacheKey)
    if (cached) {
        return cached
    }

    const db = getDb()
    const [settingsRow] = await db.select().from(settings).limit(1)

    if (!settingsRow) {
        return null
    }

    const minimal: CachedSettings = {
        auth: {
            disableEmailVerification:
                settingsRow.authDisableEmailVerification || false,
            disableRegistration: settingsRow.authDisableRegistration || false,
            disableLogin: settingsRow.authDisableLogin || false,
            disablePasswordChange:
                settingsRow.authDisablePasswordChange || false,
        },
        security: settingsRow.security as CachedSettings['security'],
    }

    await settingsCache.set(cacheKey, minimal, 600)

    return minimal
}
