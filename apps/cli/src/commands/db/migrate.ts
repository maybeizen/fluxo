import { createLogger } from '@fluxo/logger'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'migrate',
    description: 'Run database migrations',
    usage: 'fluxo db migrate',
    group: 'Database',
}

export const execute: CommandExecute = async () => {
    const uri = process.env.POSTGRES_URL
    if (!uri) {
        throw new Error('POSTGRES_URL is not set')
    }

    logger.info('Connecting to database...')
    const { connect, disconnect } = await import('@fluxo/db')
    await connect({ uri })
    logger.success('Migrations applied successfully')
    await disconnect()
}
