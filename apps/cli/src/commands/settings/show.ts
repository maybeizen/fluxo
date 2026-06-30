import { createLogger } from '@fluxo/logger'
import { decrypt } from '@fluxo/crypto'
import { withDb } from '../../utils/db.js'
import { getOrCreateSettings, maskSecret } from '../../utils/settings.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

function secretStatus(value: string | null | undefined): string {
    if (!value) return '(not set)'
    try {
        if (process.env.ENCRYPTION_KEY) {
            const plain = decrypt(value)
            return maskSecret(plain)
        }
    } catch {
        // fall through
    }
    return '(encrypted)'
}

export const data: CommandData = {
    name: 'show',
    description: 'Show current settings with secrets masked',
    usage: 'fluxo settings show',
    group: 'Settings',
    examples: ['fluxo settings show'],
}

export const execute: CommandExecute = async () => {
    await withDb(async (db) => {
        const row = await getOrCreateSettings(db)
        const security = (row.security ?? {}) as {
            cloudflare?: {
                turnstileEnabled?: boolean
                turnstileSiteKey?: string
                turnstileSecretKey?: string
            }
        }

        console.log('App')
        console.log(`  Name:       ${row.appName ?? '(not set)'}`)
        console.log(`  Theme:      ${row.appThemeColor ?? '(not set)'}`)
        console.log(`  Logo URL:   ${row.appLogoUrl ?? '(not set)'}`)

        console.log('\nAuth')
        console.log(
            `  Disable email verification: ${row.authDisableEmailVerification ? 'yes' : 'no'}`
        )
        console.log(
            `  Disable registration:       ${row.authDisableRegistration ? 'yes' : 'no'}`
        )
        console.log(
            `  Disable login:                ${row.authDisableLogin ? 'yes' : 'no'}`
        )
        console.log(
            `  Disable password change:      ${row.authDisablePasswordChange ? 'yes' : 'no'}`
        )

        console.log('\nSystem')
        console.log(
            `  Tickets enabled:     ${row.ticketsEnabled ?? true ? 'yes' : 'no'}`
        )
        console.log(
            `  Maintenance mode:    ${row.maintenanceMode ? 'yes' : 'no'}`
        )
        console.log(
            `  Maintenance message: ${row.maintenanceMessage ?? '(not set)'}`
        )
        console.log(`  Debug mode:          ${row.debugMode ? 'yes' : 'no'}`)
        console.log(
            `  Announcement:        ${row.announcementEnabled ? 'yes' : 'no'}`
        )
        console.log(
            `  Announcement text:   ${row.announcementMessage ?? '(not set)'}`
        )

        console.log('\nSMTP')
        console.log(`  Host:     ${row.emailSmtpHost ?? '(not set)'}`)
        console.log(`  Port:     ${row.emailSmtpPort ?? '(not set)'}`)
        console.log(`  User:     ${row.emailSmtpUser ?? '(not set)'}`)
        console.log(`  Password: ${secretStatus(row.emailSmtpPass)}`)
        console.log(`  From:     ${row.emailFrom ?? '(not set)'}`)

        console.log('\nCloudflare Turnstile')
        console.log(
            `  Enabled:  ${security.cloudflare?.turnstileEnabled ? 'yes' : 'no'}`
        )
        console.log(
            `  Site key: ${security.cloudflare?.turnstileSiteKey ?? '(not set)'}`
        )
        console.log(
            `  Secret:   ${secretStatus(security.cloudflare?.turnstileSecretKey)}`
        )

        logger.success('Settings loaded')
    })
}
