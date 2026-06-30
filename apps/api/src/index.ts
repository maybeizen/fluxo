import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import httpServer from './app'
import { connect, getDb, settings } from '@fluxo/db'
import { env } from './utils/env'
import { setEmailThemeColor } from './utils/email-templates'
import { startAllWorkers } from './workers'
import { logger } from './utils/logger'
import { seedDatabase } from './utils/seed'
import { defaultPluginsDir, initPlugins } from './plugins/manager'
import { ensureRedisConnected } from './utils/redis'

const __dirname = dirname(fileURLToPath(import.meta.url))

;(async () => {
    try {
        logger.info(
            'Initializing database connection and running migrations...'
        )
        await connect({
            uri: env.POSTGRES_URL,
        })
        logger.success('Connected to PostgreSQL (migrations applied)')

        logger.info('Seeding database...')
        await seedDatabase()
        logger.success('Database seeding completed')

        const [settingsRow] = await getDb().select().from(settings).limit(1)
        if (settingsRow?.appThemeColor) {
            setEmailThemeColor(settingsRow.appThemeColor)
        }

        const pluginsDir = process.env.PLUGINS_DIR || defaultPluginsDir
        logger.info('Loading plugins...')
        await initPlugins(pluginsDir)
        logger.success('Plugins loaded')

        logger.info('Connecting to Redis...')
        await ensureRedisConnected()
        logger.success('Redis ready')

        startAllWorkers()

        httpServer.listen(env.PORT, () => {
            logger.success(
                `${env.APP_NAME} running at http://localhost:${env.PORT}`,
                {
                    source: 'Server',
                }
            )
        })
    } catch (error: unknown) {
        logger.fatal(`Failed to initialize Express application - ${error}`, {
            source: 'Server',
        })
        process.exit(1)
    }
})()
