import { spawnSync } from 'node:child_process'
import { createLogger } from '@fluxo/logger'
import { findRepoRoot } from '../utils/paths.js'
import type { CommandData, CommandExecute } from '../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'types',
    description: 'Run TypeScript checks across the monorepo',
    usage: 'fluxo types',
    group: 'Development',
}

export const execute: CommandExecute = async () => {
    const root = findRepoRoot()
    logger.info('Running turbo types...')
    const result = spawnSync('bun', ['run', 'types'], {
        cwd: root,
        stdio: 'inherit',
        env: process.env,
    })
    if (result.status !== 0) {
        throw new Error('Type check failed')
    }
    logger.success('Type check passed')
}
