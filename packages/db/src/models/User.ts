import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import {
    UserRole,
    type User,
    type UserPasswordReset,
    type UserEmailVerification,
    type UserProfile,
    type UserDiscord,
    type UserTimestamps,
    type UserPunishment,
} from '@fluxo/types'

const UserPasswordResetSchema = new Schema<UserPasswordReset>({
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
})

const UserEmailVerificationSchema = new Schema<UserEmailVerification>({
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
})

const UserProfileSchema = new Schema<UserProfile>({
    username: { type: String, required: true, unique: true },
    slug: { type: String, required: false, unique: true },
    headline: { type: String, required: false, default: '' },
    about: { type: String, required: false, default: '' },
    avatarUrl: { type: String, required: false, default: '' },
})

const UserDiscordSchema = new Schema<UserDiscord>({
    discordId: { type: String, required: false },
    discordUsername: { type: String, required: false },
    discordAvatarHash: { type: String, required: false },
    discordAccessToken: { type: String, required: false },
    discordRefreshToken: { type: String, required: false },
    discordTokenExpiresAt: { type: Date, required: false },
})

const UserTimestampsSchema = new Schema<UserTimestamps>({
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: false, default: Date.now },
})

const UserPunishmentSchema = new Schema<UserPunishment>({
    isBanned: { type: Boolean, required: true, default: false },
    isTicketBanned: { type: Boolean, required: true, default: false },
    referenceId: { type: String, required: false },
})

const userSchema = new Schema<User>(
    {
        uuid: {
            type: String,
            required: true,
            unique: true,
            default: () => uuidv4(),
        },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        firstName: { type: String, required: true, default: '' },
        lastName: { type: String, required: true, default: '' },
        role: {
            type: String,
            required: true,
            enum: Object.values(UserRole),
            default: UserRole.USER,
        },
        isVerified: { type: Boolean, required: true, default: false },
        punishment: {
            type: UserPunishmentSchema,
            required: true,
            default: () => ({ isBanned: false, isTicketBanned: false }),
        },
        discord: { type: UserDiscordSchema, required: false },
        profile: { type: UserProfileSchema, required: true },
        passwordReset: { type: UserPasswordResetSchema, required: false },
        emailVerification: {
            type: UserEmailVerificationSchema,
            required: false,
        },
        timestamps: {
            type: UserTimestampsSchema,
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: 'timestamps.createdAt',
            updatedAt: 'timestamps.updatedAt',
        },
    }
)

userSchema.pre('save', function (next) {
    if (!this.uuid) {
        this.uuid = uuidv4()
    }
    next()
})

UserProfileSchema.pre('save', function (next) {
    if (!this.slug) {
        const baseSlug = this.username.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const suffix = Math.floor(Math.random() * 10000)
        this.slug = `${baseSlug}-${suffix}`
    }
    next()
})

userSchema.index({ uuid: 1 })
userSchema.index({ email: 1 })
userSchema.index({ 'profile.slug': 1 })

export const UserModel = model<User & { uuid: string }>('User', userSchema)
