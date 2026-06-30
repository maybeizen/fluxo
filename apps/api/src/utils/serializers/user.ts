import { resolveStorageUrl } from '../storage/resolve'

export type UserAvatarSource = {
    avatarKey?: string | null
    avatarUrl?: string | null
    username: string
    slug?: string | null
    headline?: string | null
    about?: string | null
}

export type UserProfileSource = UserAvatarSource & {
    id: number
    email?: string
    firstName?: string
    lastName?: string
    role?: string
    isVerified?: boolean
    isBanned?: boolean
    isTicketBanned?: boolean
    createdAt?: Date
    updatedAt?: Date
}

export type UserAuthorSource = UserAvatarSource & {
    id: number
    email?: string
    role?: string
}

export async function resolveUserAvatarUrl(
    user: Pick<UserAvatarSource, 'avatarKey' | 'avatarUrl'>,
    size: number | 'full' = 256
): Promise<string | null> {
    if (user.avatarKey) {
        return resolveStorageUrl(user.avatarKey, size)
    }
    return user.avatarUrl ?? null
}

export async function serializeProfile<T extends UserProfileSource>(
    user: T,
    avatarSize: number | 'full' = 256
): Promise<
    Omit<T, 'avatarKey' | 'avatarUrl'> & {
        uuid: string
        profile: {
            username: string
            slug: string | null | undefined
            headline: string | null | undefined
            about: string | null | undefined
            avatarUrl: string | null
        }
    }
> {
    const avatarUrl = await resolveUserAvatarUrl(user, avatarSize)
    const { avatarKey: _avatarKey, avatarUrl: _avatarUrl, ...rest } = user

    return {
        ...rest,
        uuid: user.id.toString(),
        profile: {
            username: user.username,
            slug: user.slug,
            headline: user.headline,
            about: user.about,
            avatarUrl,
        },
    }
}

export async function serializeAuthor<T extends UserAuthorSource>(
    user: T,
    avatarSize: number | 'full' = 256
): Promise<{
    id: number
    uuid: string
    email?: string
    profile: {
        username: string
        slug: string | null | undefined
        headline: string | null | undefined
        about: string | null | undefined
        avatarUrl: string | null
    }
    role?: string
}> {
    const avatarUrl = await resolveUserAvatarUrl(user, avatarSize)

    return {
        id: user.id,
        uuid: user.id.toString(),
        email: user.email,
        profile: {
            username: user.username,
            slug: user.slug,
            headline: user.headline,
            about: user.about,
            avatarUrl,
        },
        role: user.role,
    }
}

export async function serializeNewsAuthor<
    T extends UserAvatarSource & {
        id: number
        firstName?: string
        lastName?: string
    },
>(
    user: T,
    avatarSize: number | 'full' = 256
): Promise<{
    id: number
    uuid: string
    name: string
    username: string
    avatarUrl: string | null
}> {
    const avatarUrl = await resolveUserAvatarUrl(user, avatarSize)

    return {
        id: user.id,
        uuid: user.id.toString(),
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        username: user.username,
        avatarUrl,
    }
}

export async function resolveLogoUrl(settings: {
    appLogoKey?: string | null
    appLogoUrl?: string | null
}): Promise<string | null> {
    if (settings.appLogoKey) {
        return resolveStorageUrl(settings.appLogoKey, 64)
    }
    return settings.appLogoUrl ?? null
}

export async function serializeAdminUser<
    T extends UserProfileSource & {
        createdAt?: Date
        updatedAt?: Date
    },
>(user: T, avatarSize: number | 'full' = 256) {
    const serialized = await serializeProfile(user, avatarSize)
    return {
        ...serialized,
        timestamps: {
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
    }
}
