import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import {
    type ApplicationSettings,
    type AppSettings,
    type AuthSettings,
    type DiscordSettings,
    type EmailSettings,
    type GatewaysSettings,
    type PterodactylSettings,
    type SecuritySettings,
} from '@fluxo/types'

const AppSettingsSchema = new Schema<AppSettings>({
    name: { type: String, required: false },
    baseUrl: { type: String, required: false },
    environment: {
        type: String,
        required: false,
        enum: ['development', 'production'],
    },
    themeColor: { type: String, required: false },
    logoUrl: { type: String, required: false },
})

const AuthSettingsSchema = new Schema<AuthSettings>({
    disableEmailVerification: {
        type: Boolean,
        required: false,
        default: false,
    },
    disableRegistration: { type: Boolean, required: false, default: false },
    disableLogin: { type: Boolean, required: false, default: false },
    disablePasswordChange: { type: Boolean, required: false, default: false },
})

const DiscordSettingsSchema = new Schema<DiscordSettings>({
    clientId: { type: String, required: false },
    clientSecret: { type: String, required: false },
    redirectUri: { type: String, required: false },
})

const EmailSettingsSchema = new Schema<EmailSettings>({
    smtpHost: { type: String, required: false },
    smtpPort: { type: Number, required: false },
    smtpUser: { type: String, required: false },
    smtpPass: { type: String, required: false },
    emailFrom: { type: String, required: false },
})

const GatewaysSettingsSchema = new Schema<GatewaysSettings>({
    stripe: {
        type: {
            secretKey: { type: String, required: false },
            publishableKey: { type: String, required: false },
        },
        required: false,
    },
})

const SecuritySettingsSchema = new Schema<SecuritySettings>({
    cloudflare: {
        type: {
            turnstileEnabled: {
                type: Boolean,
                required: false,
                default: false,
            },
            turnstileSiteKey: { type: String, required: false },
            turnstileSecretKey: { type: String, required: false },
        },
        required: false,
    },
})

const PterodactylSettingsSchema = new Schema<PterodactylSettings>({
    baseUrl: { type: String, required: false },
    apiKey: { type: String, required: false },
})

const settingsSchema = new Schema<ApplicationSettings & { uuid: string }>(
    {
        uuid: {
            type: String,
            required: true,
            unique: true,
            default: () => uuidv4(),
        },
        app: { type: AppSettingsSchema, required: true, default: () => ({}) },
        auth: { type: AuthSettingsSchema, required: true, default: () => ({}) },
        discord: {
            type: DiscordSettingsSchema,
            required: true,
            default: () => ({}),
        },
        email: {
            type: EmailSettingsSchema,
            required: true,
            default: () => ({}),
        },
        gateways: {
            type: GatewaysSettingsSchema,
            required: true,
            default: () => ({}),
        },
        security: {
            type: SecuritySettingsSchema,
            required: true,
            default: () => ({}),
        },
        pterodactyl: {
            type: PterodactylSettingsSchema,
            required: true,
            default: () => ({}),
        },
    },
    {
        timestamps: true,
    }
)

settingsSchema.pre('save', function (next) {
    if (!this.uuid) {
        this.uuid = uuidv4()
    }
    next()
})

settingsSchema.index({ uuid: 1 })

export const SettingsModel = model<ApplicationSettings & { uuid: string }>(
    'Settings',
    settingsSchema
)
