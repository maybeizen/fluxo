import { getDb, settings } from '@fluxo/db'
import { logger } from './logger'

export const seedDatabase = async (): Promise<void> => {
    try {
        const db = getDb()

        const [existingSettings] = await db.select().from(settings).limit(1)

        if (!existingSettings) {
            logger.info('Seeding settings table with default values...')
            await db.insert(settings).values({
                appName: null,
                appLogoUrl: null,
                authDisableEmailVerification: false,
                authDisableRegistration: false,
                authDisableLogin: false,
                authDisablePasswordChange: false,
                discordClientId: null,
                discordClientSecret: null,
                discordRedirectUri: null,
                emailSmtpHost: null,
                emailSmtpPort: null,
                emailSmtpUser: null,
                emailSmtpPass: null,
                emailFrom: null,
                gateways: {},
                security: {},
                pterodactylBaseUrl: null,
                pterodactylApiKey: null,
            })
            logger.success('Settings table seeded successfully')
        } else {
            logger.info('Settings table already exists, skipping seed')
        }
    } catch (error: unknown) {
        logger.error(`Error seeding database: ${error}`)
        throw error
    }
}
