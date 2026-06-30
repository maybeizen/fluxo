import { createLogger } from '@fluxo/logger'
import { encrypt } from '@fluxo/crypto'
import { settings, eq } from '@fluxo/db'
import { withDb } from '../../utils/db.js'
import {
    getOrCreateSettings,
    requireEncryptionKey,
} from '../../utils/settings.js'
import { promptPassword, promptText } from '../../utils/prompts.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'smtp',
    description: 'Configure SMTP email settings',
    usage: 'fluxo settings smtp [--host <host>] [--port <port>] [--user <user>] [--pass <pass>] [--from <email>]',
    group: 'Settings',
    options: [
        { name: 'host', description: 'SMTP host' },
        { name: 'port', description: 'SMTP port' },
        { name: 'user', description: 'SMTP username' },
        { name: 'pass', description: 'SMTP password' },
        { name: 'from', description: 'From email address' },
    ],
    examples: [
        'fluxo settings smtp --host smtp.example.com --port 587 --user mail --pass secret --from noreply@example.com',
    ],
}

function optString(
    options: Record<string, string | boolean>,
    key: string
): string | undefined {
    const v = options[key]
    return typeof v === 'string' ? v : undefined
}

export const execute: CommandExecute = async (_positionals, options) => {
    const host =
        optString(options, 'host') ??
        (await promptText('SMTP host', { placeholder: 'smtp.example.com' }))
    const portRaw =
        optString(options, 'port') ??
        (await promptText('SMTP port', { defaultValue: '587' }))
    const port = Number.parseInt(portRaw, 10)
    if (!Number.isFinite(port)) {
        throw new Error('SMTP port must be a number')
    }
    const user =
        optString(options, 'user') ??
        (await promptText('SMTP user', { defaultValue: '' }))
    const pass =
        optString(options, 'pass') ?? (await promptPassword('SMTP password'))
    const from =
        optString(options, 'from') ??
        (await promptText('From email', { placeholder: 'noreply@example.com' }))

    requireEncryptionKey()

    await withDb(async (db) => {
        const row = await getOrCreateSettings(db)

        await db
            .update(settings)
            .set({
                emailSmtpHost: host,
                emailSmtpPort: port,
                emailSmtpUser: user || null,
                emailSmtpPass: pass ? encrypt(pass) : null,
                emailFrom: from,
            })
            .where(eq(settings.id, row.id))

        logger.success('SMTP settings updated')
    })
}
