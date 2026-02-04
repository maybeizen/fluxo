export interface AppSettings {
    name?: string
    baseUrl?: string
    environment?: 'development' | 'production'
    themeColor?: string
    logoUrl?: string
}

export interface AuthSettings {
    disableEmailVerification?: boolean
    disableRegistration?: boolean
    disableLogin?: boolean
    disablePasswordChange?: boolean
}

export interface DiscordSettings {
    clientId?: string
    clientSecret?: string
    redirectUri?: string
}

export interface EmailSettings {
    smtpHost?: string
    smtpPort?: number
    smtpUser?: string
    smtpPass?: string
    emailFrom?: string
}

export interface GatewaysSettings {
    stripe?: {
        secretKey?: string
        publishableKey?: string
    }
}

export interface SecuritySettings {
    cloudflare?: {
        turnstileEnabled?: boolean
        turnstileSiteKey?: string
        turnstileSecretKey?: string
    }
}

export interface PterodactylSettings {
    baseUrl?: string
    apiKey?: string
}

export interface ApplicationSettings {
    app: AppSettings
    auth: AuthSettings
    discord: DiscordSettings
    email: EmailSettings
    gateways: GatewaysSettings
    security: SecuritySettings
    pterodactyl: PterodactylSettings
}
