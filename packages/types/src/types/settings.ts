export interface AppSettings {
    name?: string
    baseUrl?: string
    environment?: 'development' | 'production'
    themeColor?: string
    activeThemeId?: string
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

export interface SecuritySettings {
    cloudflare?: {
        turnstileEnabled?: boolean
        turnstileSiteKey?: string
        turnstileSecretKey?: string
    }
}

export interface StorageS3Settings {
    endpoint?: string
    region?: string
    bucket?: string
    accessKeyId?: string
    secretAccessKey?: string
    forcePathStyle?: boolean
    publicUrlBase?: string
}

export interface StorageSettings {
    provider?: 'local' | 's3'
    s3?: StorageS3Settings
}

export interface SystemSettings {
    ticketsEnabled?: boolean
    maintenanceMode?: boolean
    maintenanceMessage?: string
    debugMode?: boolean
    announcementEnabled?: boolean
    announcementMessage?: string
}

export interface ApplicationSettings {
    app: AppSettings
    auth: AuthSettings
    discord: DiscordSettings
    email: EmailSettings
    security: SecuritySettings
    storage: StorageSettings
    system: SystemSettings
}

export interface PublicAppSettings {
    name?: string
    logoUrl?: string
    themeColor?: string
    ticketsEnabled?: boolean
    maintenanceMode?: boolean
    maintenanceMessage?: string
    announcementEnabled?: boolean
    announcementMessage?: string
}
