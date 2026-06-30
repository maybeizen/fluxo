import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { createLogger } from '@fluxo/logger'
import { UserRole } from '@fluxo/types'
import { withDb } from '../utils/db.js'
import { findRepoRoot } from '../utils/paths.js'
import { getOrCreateSettings } from '../utils/settings.js'
import {
    createUserRecord,
    formatUserDetail,
    passwordSchema,
    usernameSchema,
} from '../utils/users.js'
import {
    intro,
    outro,
    promptConfirm,
    promptPassword,
    promptText,
} from '../utils/prompts.js'
import type { CommandData, CommandExecute } from '../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'setup',
    description: 'Bootstrap database, settings, and optional first admin user',
    usage: 'fluxo setup',
    examples: ['fluxo setup'],
}

export const execute: CommandExecute = async () => {
    intro('Fluxo setup')

    const root = findRepoRoot()
    const envPath = join(root, '.env')
    const setupEnvScript = join(root, 'scripts', 'setup-env.sh')

    if (!existsSync(envPath)) {
        logger.warn('.env not found')
        if (existsSync(setupEnvScript)) {
            console.log(`Generate one with: bash scripts/setup-env.sh`)
        } else {
            console.log('Copy .env.example to .env and configure POSTGRES_URL')
        }
    }

    if (!process.env.POSTGRES_URL) {
        throw new Error(
            'POSTGRES_URL is not set. Add it to .env or export it before running setup.'
        )
    }

    logger.info('Connecting to database and applying migrations...')

    await withDb(
        async (db) => {
        const settingsRow = await getOrCreateSettings(db)
        logger.success(`Settings row ready (id ${settingsRow.id})`)

        const createAdmin = await promptConfirm(
            'Create a first admin user now?',
            true
        )

        if (createAdmin) {
            const email = await promptText('Admin email', {
                validate: (v) =>
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
                        ? undefined
                        : 'Enter a valid email',
            })

            const username = await promptText('Admin username', {
                defaultValue: 'admin',
                validate: (v) => {
                    const r = usernameSchema.safeParse(v)
                    return r.success ? undefined : r.error.issues[0]?.message
                },
            })

            const password = await promptPassword('Admin password', {
                validate: (v) => {
                    const r = passwordSchema.safeParse(v)
                    return r.success ? undefined : r.error.issues[0]?.message
                },
            })

            const user = await createUserRecord(db, {
                email,
                username,
                password,
                role: UserRole.ADMIN,
                isVerified: true,
            })

            console.log('\n' + formatUserDetail(user))
            logger.success(`Admin user ${user.id} created`)
        }
    },
        { migrate: true }
    )

    outro('Setup complete')
    console.log('\nNext steps:')
    console.log('  bun run fluxo doctor')
    if (existsSync(setupEnvScript)) {
        console.log('  bash scripts/setup-env.sh   # generate or refresh .env')
    }
}
