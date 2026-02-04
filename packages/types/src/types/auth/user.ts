export enum UserRole {
    ADMIN = 'admin',
    STAFF = 'staff',
    USER = 'user',
    CLIENT = 'client',
}

export interface UserTimestamps {
    createdAt: Date
    updatedAt: Date
}

export interface UserPasswordReset {
    token: string
    expiresAt: Date
}

export interface UserEmailVerification {
    token: string
    expiresAt: Date
}

export interface UserProfile {
    username: string
    slug: string
    headline?: string
    about?: string
    avatarUrl?: string
}

export interface UserPunishment {
    isBanned: boolean
    isTicketBanned: boolean
    referenceId?: string
}

export interface User {
    uuid: string
    email: string
    password: string
    firstName: string
    lastName: string
    role: UserRole
    isVerified: boolean
    pterodactylId?: string
    punishment: UserPunishment
    discord?: UserDiscord
    profile: UserProfile
    passwordReset?: UserPasswordReset
    emailVerification?: UserEmailVerification
    timestamps: UserTimestamps
}

export interface UserDiscord {
    discordId?: string
    discordUsername?: string
    discordAvatarHash?: string
    discordAccessToken?: string
    discordRefreshToken?: string
    discordTokenExpiresAt?: Date
}
