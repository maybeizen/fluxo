import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { readdir } from 'node:fs/promises'
import { createLogger } from '@fluxo/logger'
import { findRepoRoot } from '../utils/paths.js'
import type { CommandData, CommandExecute } from '../types.js'

const logger = createLogger({ source: 'CLI', file: false })

interface CheckResult {
    name: string
    ok: boolean
    detail?: string
}

export const data: CommandData = {
    name: 'doctor',
    description: 'Check environment, database, and plugin directories',
    usage: 'fluxo doctor',
    group: 'Diagnostics',
}

export const execute: CommandExecute = async () => {
    const root = findRepoRoot()
    const checks: CheckResult[] = []

    checks.push({
        name: 'Repo root',
        ok: existsSync(join(root, 'turbo.json')),
        detail: root,
    })

    checks.push({
        name: 'POSTGRES_URL',
        ok: Boolean(process.env.POSTGRES_URL),
        detail: process.env.POSTGRES_URL ? 'set' : 'missing',
    })

    checks.push({
        name: 'Plugins directory',
        ok: existsSync(join(root, 'plugins')),
        detail: join(root, 'plugins'),
    })

    const pluginsDir = join(root, 'plugins')
    if (existsSync(pluginsDir)) {
        const entries = await readdir(pluginsDir, { withFileTypes: true })
        const pluginCount = entries.filter((e) => e.isDirectory()).length
        checks.push({
            name: 'Discovered plugins',
            ok: pluginCount > 0,
            detail: `${pluginCount} directories`,
        })
    }

    if (process.env.POSTGRES_URL) {
        try {
            const { connect, disconnect } = await import('@fluxo/db')
            await connect({ uri: process.env.POSTGRES_URL, migrate: false })
            checks.push({ name: 'Database connection', ok: true })
            await disconnect()
        } catch (err) {
            checks.push({
                name: 'Database connection',
                ok: false,
                detail: err instanceof Error ? err.message : String(err),
            })
        }
    }

    let failed = 0
    for (const check of checks) {
        if (check.ok) {
            logger.success(
                `${check.name}${check.detail ? `: ${check.detail}` : ''}`
            )
        } else {
            failed++
            logger.error(
                `${check.name}${check.detail ? `: ${check.detail}` : ''}`
            )
        }
    }

    if (failed > 0) {
        throw new Error(`${failed} check(s) failed`)
    }
    logger.success('All checks passed')
}
