import { createLogger } from '@fluxo/logger'
import { settings, eq } from '@fluxo/db'
import { withDb } from '../../utils/db.js'
import { getOrCreateSettings } from '../../utils/settings.js'
import { flushSettingsCache } from '../../utils/settings-cache.js'
import { promptConfirm, promptText } from '../../utils/prompts.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'system',
    description:
        'Toggle system flags (tickets, maintenance, debug, announcement)',
    usage: 'fluxo settings system [--tickets-enabled|--no-tickets-enabled] [--maintenance|--no-maintenance] [--maintenance-message <text>] [--debug|--no-debug] [--announcement|--no-announcement] [--announcement-message <text>]',
    group: 'Settings',
    options: [
        {
            name: 'tickets-enabled',
            description: 'Enable support tickets',
            type: 'boolean',
        },
        {
            name: 'no-tickets-enabled',
            description: 'Disable support tickets',
            type: 'boolean',
        },
        {
            name: 'maintenance',
            description: 'Enable maintenance mode',
            type: 'boolean',
        },
        {
            name: 'no-maintenance',
            description: 'Disable maintenance mode',
            type: 'boolean',
        },
        {
            name: 'maintenance-message',
            description: 'Maintenance mode message',
        },
        {
            name: 'debug',
            description: 'Enable debug mode',
            type: 'boolean',
        },
        {
            name: 'no-debug',
            description: 'Disable debug mode',
            type: 'boolean',
        },
        {
            name: 'announcement',
            description: 'Enable announcement banner',
            type: 'boolean',
        },
        {
            name: 'no-announcement',
            description: 'Disable announcement banner',
            type: 'boolean',
        },
        {
            name: 'announcement-message',
            description: 'Announcement banner message',
        },
    ],
    examples: [
        'fluxo settings system --maintenance --maintenance-message "Back in 30 minutes"',
        'fluxo settings system --no-tickets-enabled',
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
        `${label}? (currently ${current ? 'enabled' : 'disabled'})`,
        current
    )
}

function optString(
    options: Record<string, string | boolean>,
    key: string
): string | undefined {
    const v = options[key]
    return typeof v === 'string' ? v : undefined
}

export const execute: CommandExecute = async (_positionals, options) => {
    await withDb(async (db) => {
        const row = await getOrCreateSettings(db)

        const ticketsEnabled = await resolveFlag(
            options,
            'tickets-enabled',
            'no-tickets-enabled',
            row.ticketsEnabled ?? true,
            'Enable support tickets'
        )
        const maintenanceMode = await resolveFlag(
            options,
            'maintenance',
            'no-maintenance',
            row.maintenanceMode ?? false,
            'Enable maintenance mode'
        )
        const debugMode = await resolveFlag(
            options,
            'debug',
            'no-debug',
            row.debugMode ?? false,
            'Enable debug mode'
        )
        const announcementEnabled = await resolveFlag(
            options,
            'announcement',
            'no-announcement',
            row.announcementEnabled ?? false,
            'Enable announcement banner'
        )

        const maintenanceMessage =
            optString(options, 'maintenance-message') ??
            (maintenanceMode
                ? await promptText('Maintenance message', {
                      defaultValue: row.maintenanceMessage ?? '',
                  })
                : row.maintenanceMessage)

        const announcementMessage =
            optString(options, 'announcement-message') ??
            (announcementEnabled
                ? await promptText('Announcement message', {
                      defaultValue: row.announcementMessage ?? '',
                  })
                : row.announcementMessage)

        await db
            .update(settings)
            .set({
                ticketsEnabled,
                maintenanceMode,
                maintenanceMessage: maintenanceMessage || null,
                debugMode,
                announcementEnabled,
                announcementMessage: announcementMessage || null,
            })
            .where(eq(settings.id, row.id))

        await flushSettingsCache()
        logger.success('System settings updated')
    })
}
