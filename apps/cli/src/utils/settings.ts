import { settings } from '@fluxo/db'
import type { getDb } from '@fluxo/db'

type Db = ReturnType<typeof getDb>
export type SettingsRow = typeof settings.$inferSelect

const defaultSettingsValues = {
    appName: null,
    appLogoUrl: null,
    authDisableEmailVerification: false,
    authDisableRegistration: false,
    authDisableLogin: false,
    authDisablePasswordChange: false,
    discordClientId: null,
    discordClientSecret: null,
    discordRedirectUri: null,
    emailSmtpHost: null,
    emailSmtpPort: null,
    emailSmtpUser: null,
    emailSmtpPass: null,
    emailFrom: null,
    gateways: {},
    security: {},
    pterodactylBaseUrl: null,
    pterodactylApiKey: null,
} as const

export async function getOrCreateSettings(db: Db): Promise<SettingsRow> {
    const [existing] = await db.select().from(settings).limit(1)
    if (existing) return existing

    const [created] = await db
        .insert(settings)
        .values({ ...defaultSettingsValues })
        .returning()

    if (!created) {
        throw new Error('Failed to create settings row')
    }
    return created
}

export function maskSecret(value: string | null | undefined): string {
    if (!value) return '(not set)'
    if (value.length <= 4) return '****'
    return `${value.slice(0, 2)}${'*'.repeat(Math.min(value.length - 4, 12))}${value.slice(-2)}`
}

export function requireEncryptionKey(): void {
    if (!process.env.ENCRYPTION_KEY) {
        throw new Error(
            'ENCRYPTION_KEY is not set. Required for writing encrypted secrets.'
        )
    }
}
