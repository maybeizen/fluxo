import { z } from 'zod'
import { getDb, settings } from '@fluxo/db'

const appSettingsSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    baseUrl: z.url().optional(),
    environment: z.enum(['local', 'production']).optional(),
    logoUrl: z.url().optional(),
})

const authSettingsSchema = z.object({
    disableEmailVerification: z.boolean().optional(),
    disableRegistration: z.boolean().optional(),
    disableLogin: z.boolean().optional(),
    disablePasswordChange: z.boolean().optional(),
})

const discordSettingsSchema = z.object({
    clientId: z.string().min(1).optional(),
    clientSecret: z.string().min(1).optional(),
    redirectUri: z.url().optional(),
})

const emailSettingsSchema = z.object({
    smtpHost: z.string().min(1).optional(),
    smtpPort: z.number().int().min(1).max(65535).optional(),
    smtpUser: z.string().min(1).optional(),
    smtpPass: z.string().min(1).optional(),
    emailFrom: z.email().optional(),
})

const gatewaysSettingsSchema = z.object({
    stripe: z
        .object({
            secretKey: z.string().min(1).optional(),
            publishableKey: z.string().min(1).optional(),
        })
        .optional(),
})

const securitySettingsSchema = z.object({
    cloudflare: z
        .object({
            turnstileEnabled: z.boolean().optional(),
            turnstileSiteKey: z.string().min(1).optional(),
            turnstileSecretKey: z.string().min(1).optional(),
        })
        .optional(),
})

const pterodactylSettingsSchema = z.object({
    baseUrl: z.url().optional(),
    apiKey: z.string().min(1).optional(),
})

export const updateSettingsSchema = z
    .object({
        app: appSettingsSchema.optional(),
        auth: authSettingsSchema.optional(),
        discord: discordSettingsSchema.optional(),
        email: emailSettingsSchema.optional(),
        gateways: gatewaysSettingsSchema.optional(),
        security: securitySettingsSchema.optional(),
        pterodactyl: pterodactylSettingsSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one settings field must be provided',
    })
    .transform(async (data) => {
        const db = getDb()
        const [settingsRow] = await db.select().from(settings).limit(1)

        if (!settingsRow) {
            throw new Error('Settings not found')
        }

        return { settings: settingsRow, data }
    })
