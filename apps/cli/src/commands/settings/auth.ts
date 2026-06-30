import { createLogger } from '@fluxo/logger'
import { settings, eq } from '@fluxo/db'
import { withDb } from '../../utils/db.js'
import { getOrCreateSettings } from '../../utils/settings.js'
import { flushSettingsCache } from '../../utils/settings-cache.js'
import { promptConfirm } from '../../utils/prompts.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'auth',
    description: 'Toggle auth restriction flags',
    usage: 'fluxo settings auth [--disable-email-verification] [--disable-registration] [--disable-login] [--disable-password-change]',
    group: 'Settings',
    options: [
        {
            name: 'disable-email-verification',
            description: 'Disable email verification',
            type: 'boolean',
        },
        {
            name: 'disable-registration',
            description: 'Disable registration',
            type: 'boolean',
        },
        {
            name: 'disable-login',
            description: 'Disable login',
            type: 'boolean',
        },
        {
            name: 'disable-password-change',
            description: 'Disable password change',
            type: 'boolean',
        },
        {
            name: 'no-disable-email-verification',
            description: 'Enable email verification',
            type: 'boolean',
        },
        {
            name: 'no-disable-registration',
            description: 'Enable registration',
            type: 'boolean',
        },
        {
            name: 'no-disable-login',
            description: 'Enable login',
            type: 'boolean',
        },
        {
            name: 'no-disable-password-change',
            description: 'Enable password change',
            type: 'boolean',
        },
    ],
    examples: [
        'fluxo settings auth --disable-registration',
        'fluxo settings auth --no-disable-login',
    ],
}

function resolveFlag(
    options: Record<string, string | boolean>,
    enableKey: string,
    disableKey: string,
    current: boolean,
    label: string
): Promise<boolean> {
    if (options[enableKey] === true) return Promise.resolve(true)
    if (options[disableKey] === true) return Promise.resolve(false)
    return promptConfirm(
        `${label}? (currently ${current ? 'disabled' : 'enabled'})`,
        current
    )
}

export const execute: CommandExecute = async (_positionals, options) => {
    await withDb(async (db) => {
        const row = await getOrCreateSettings(db)

        const authDisableEmailVerification = await resolveFlag(
            options,
            'disable-email-verification',
            'no-disable-email-verification',
            row.authDisableEmailVerification ?? false,
            'Disable email verification'
        )
        const authDisableRegistration = await resolveFlag(
            options,
            'disable-registration',
            'no-disable-registration',
            row.authDisableRegistration ?? false,
            'Disable registration'
        )
        const authDisableLogin = await resolveFlag(
            options,
            'disable-login',
            'no-disable-login',
            row.authDisableLogin ?? false,
            'Disable login'
        )
        const authDisablePasswordChange = await resolveFlag(
            options,
            'disable-password-change',
            'no-disable-password-change',
            row.authDisablePasswordChange ?? false,
            'Disable password change'
        )

        await db
            .update(settings)
            .set({
                authDisableEmailVerification,
                authDisableRegistration,
                authDisableLogin,
                authDisablePasswordChange,
            })
            .where(eq(settings.id, row.id))

        await flushSettingsCache()
        logger.success('Auth settings updated')
    })
}
