import { createLogger } from '@fluxo/logger'
import { settings, eq } from '@fluxo/db'
import { withDb } from '../../utils/db.js'
import { getOrCreateSettings } from '../../utils/settings.js'
import { promptText } from '../../utils/prompts.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'app',
    description: 'Configure app name, theme color, and logo URL',
    usage: 'fluxo settings app [--name <name>] [--theme-color <color>] [--logo-url <url>]',
    group: 'Settings',
    options: [
        { name: 'name', description: 'Application name' },
        { name: 'theme-color', description: 'Theme color (hex or CSS color)' },
        { name: 'logo-url', description: 'Logo URL' },
    ],
    examples: [
        'fluxo settings app --name Fluxo --theme-color "#6366f1"',
        'fluxo settings app --logo-url https://example.com/logo.png',
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
    const name =
        optString(options, 'name') ??
        (await promptText('App name', { defaultValue: 'Fluxo' }))
    const themeColor =
        optString(options, 'theme-color') ??
        (await promptText('Theme color', { defaultValue: '#6366f1' }))
    const logoUrl =
        optString(options, 'logo-url') ??
        (await promptText('Logo URL (optional)', { defaultValue: '' }))

    await withDb(async (db) => {
        const row = await getOrCreateSettings(db)

        await db
            .update(settings)
            .set({
                appName: name,
                appThemeColor: themeColor,
                appLogoUrl: logoUrl || null,
            })
            .where(eq(settings.id, row.id))

        logger.success('App settings updated')
    })
}
