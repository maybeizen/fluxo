import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import httpServer from './app'
import { connect } from '@fluxo/db'
import { env } from './utils/env'
import { startAllWorkers } from './workers'
import { logger } from './utils/logger'
import { seedDatabase } from './utils/seed'
import { initPluginRegistry } from './plugins/registry'
import { runPluginMigrations } from './plugins/migrations/runner'
import './utils/redis'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultPluginsDir = resolve(__dirname, '..', 'plugins')

;(async () => {
    try {
        logger.info('Initializing database connection...')
        const db = await connect({
            uri: env.POSTGRES_URL,
        })
        logger.success('Connected to PostgreSQL')

        logger.info('Seeding database...')
        await seedDatabase()
        logger.success('Database seeding completed')

        const pluginsDir = process.env.PLUGINS_DIR || defaultPluginsDir
        logger.info('Running plugin migrations...')
        await runPluginMigrations(pluginsDir)
        logger.success('Plugin migrations completed')

        logger.info('Loading plugins...')
        await initPluginRegistry(pluginsDir)
        logger.success('Plugins loaded')

        startAllWorkers()

        console.log(env.NODE_ENV)
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
