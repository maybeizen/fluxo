import { createLogger } from '@fluxo/logger'
import { findRepoRoot } from '../utils/paths.js'
import type { CommandData, CommandExecute } from '../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'status',
    description: 'Show Fluxo installation status',
    usage: 'fluxo status',
}

export const execute: CommandExecute = async () => {
    const root = findRepoRoot()
    logger.info(`Repo root: ${root}`)
    logger.info(`Node env: ${process.env.NODE_ENV ?? 'development'}`)
    logger.success('Fluxo CLI is operational')
}
