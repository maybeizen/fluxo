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
    appActiveThemeId: varchar('app_active_theme_id', { length: 64 }).default(
        'default'
    ),
    appLogoUrl: varchar('app_logo_url', { length: 500 }),
    appLogoKey: varchar('app_logo_key', { length: 300 }),

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

    security: jsonb('security').$type<{
        cloudflare?: {
            turnstileEnabled?: boolean
            turnstileSiteKey?: string
            turnstileSecretKey?: string
        }
    }>(),

    storage: jsonb('storage').$type<{
        provider?: 'local' | 's3'
        s3?: {
            endpoint?: string
            region?: string
            bucket?: string
            accessKeyId?: string
            secretAccessKey?: string
            forcePathStyle?: boolean
            publicUrlBase?: string
        }
    }>(),

    ticketsEnabled: boolean('tickets_enabled').default(true),
    maintenanceMode: boolean('maintenance_mode').default(false),
    maintenanceMessage: text('maintenance_message'),
    debugMode: boolean('debug_mode').default(false),
    announcementEnabled: boolean('announcement_enabled').default(false),
    announcementMessage: text('announcement_message'),
})
