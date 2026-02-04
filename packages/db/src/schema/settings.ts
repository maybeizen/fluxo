import {
    pgTable,
    serial,
    varchar,
    integer,
    boolean,
    text,
    jsonb,
} from 'drizzle-orm/pg-core'
import { appEnvironmentEnum } from './enums'

export const settings = pgTable('settings', {
    id: serial('id').primaryKey(),

    appName: varchar('app_name', { length: 255 }),
    appBaseUrl: varchar('app_base_url', { length: 500 }),
    appEnvironment: appEnvironmentEnum('app_environment'),
    appThemeColor: varchar('app_theme_color', { length: 50 }),
    appLogoUrl: varchar('app_logo_url', { length: 500 }),

    authDisableEmailVerification: boolean(
        'auth_disable_email_verification'
    ).default(false),
    authDisableRegistration: boolean('auth_disable_registration').default(
        false
    ),
    authDisableLogin: boolean('auth_disable_login').default(false),
    authDisablePasswordChange: boolean('auth_disable_password_change').default(
        false
    ),

    discordClientId: varchar('discord_client_id', { length: 255 }),
    discordClientSecret: text('discord_client_secret'),
    discordRedirectUri: varchar('discord_redirect_uri', { length: 500 }),

    emailSmtpHost: varchar('email_smtp_host', { length: 255 }),
    emailSmtpPort: integer('email_smtp_port'),
    emailSmtpUser: varchar('email_smtp_user', { length: 255 }),
    emailSmtpPass: text('email_smtp_pass'),
    emailFrom: varchar('email_from', { length: 255 }),

    gateways: jsonb('gateways').$type<{
        stripe?: {
            secretKey?: string
            publishableKey?: string
        }
    }>(),

    security: jsonb('security').$type<{
        cloudflare?: {
            turnstileEnabled?: boolean
            turnstileSiteKey?: string
            turnstileSecretKey?: string
        }
    }>(),

    pterodactylBaseUrl: varchar('pterodactyl_base_url', { length: 500 }),
    pterodactylApiKey: text('pterodactyl_api_key'),
})
