import { createLogger } from '@fluxo/logger'
import { encrypt } from '@fluxo/crypto'
import { settings, eq } from '@fluxo/db'
import { withDb } from '../../utils/db.js'
import {
    getOrCreateSettings,
    requireEncryptionKey,
} from '../../utils/settings.js'
import {
    promptConfirm,
    promptPassword,
    promptText,
} from '../../utils/prompts.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'turnstile',
    description: 'Configure Cloudflare Turnstile',
    usage: 'fluxo settings turnstile [--enabled] [--no-enabled] [--site-key <key>] [--secret-key <key>]',
    group: 'Settings',
    options: [
        { name: 'enabled', description: 'Enable Turnstile', type: 'boolean' },
        {
            name: 'no-enabled',
            description: 'Disable Turnstile',
            type: 'boolean',
        },
        { name: 'site-key', description: 'Turnstile site key' },
        { name: 'secret-key', description: 'Turnstile secret key' },
    ],
    examples: [
        'fluxo settings turnstile --enabled --site-key 0x... --secret-key 0x...',
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
    let enabled: boolean
    if (options.enabled === true) enabled = true
    else if (options['no-enabled'] === true) enabled = false
    else enabled = await promptConfirm('Enable Turnstile?', false)

    const siteKey =
        optString(options, 'site-key') ??
        (await promptText('Site key', { defaultValue: '' }))
    const secretKey =
        optString(options, 'secret-key') ??
        (enabled
            ? await promptPassword('Secret key')
            : await promptText('Secret key (optional)', { defaultValue: '' }))

    if (secretKey) requireEncryptionKey()

    await withDb(async (db) => {
        const row = await getOrCreateSettings(db)
        const currentSecurity = (row.security ?? {}) as Record<string, unknown>
        const currentCloudflare = (currentSecurity.cloudflare ?? {}) as Record<
            string,
            unknown
        >

        const updatedSecurity = {
            ...currentSecurity,
            cloudflare: {
                ...currentCloudflare,
                turnstileEnabled: enabled,
                turnstileSiteKey: siteKey || undefined,
                ...(secretKey
                    ? { turnstileSecretKey: encrypt(secretKey) }
                    : {}),
            },
        }

        await db
            .update(settings)
            .set({
                security: updatedSecurity as NonNullable<
                    typeof settings.$inferSelect.security
                >,
            })
            .where(eq(settings.id, row.id))

        logger.success('Turnstile settings updated')
    })
}
