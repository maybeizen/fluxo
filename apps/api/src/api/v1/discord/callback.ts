import { type Request, type Response } from 'express'
import { getDb, users, userDiscord } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { env } from '../../../utils/env'
import { logger } from '../../../utils/logger'
import { ZodError } from 'zod'
import { discordCallbackSchema } from '../../../validators/discord/callback'
import { encrypt } from '../../../utils/encryption'
import axios from 'axios'

interface DiscordTokenResponse {
    access_token: string
    token_type: string
    expires_in: number
    refresh_token: string
    scope: string
}

interface DiscordUser {
    id: string
    username: string
    discriminator: string
    avatar: string | null
    global_name: string | null
}

export const handleDiscordCallback = async (req: Request, res: Response) => {
    try {
        const { code, state } = await discordCallbackSchema.parseAsync(
            req.query
        )

        const sessionUserId = req.session?.userId
        const userId = parseInt(state, 10)
        if (
            isNaN(userId) ||
            !sessionUserId ||
            parseInt(sessionUserId, 10) !== userId
        ) {
            return res.redirect(
                `${env.FRONTEND_URL}/client/profile?error=invalid_state`
            )
        }

        const db = getDb()
        const [user] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

        if (!user) {
            return res.redirect(
                `${env.FRONTEND_URL}/client/profile?error=user_not_found`
            )
        }

        const tokenParams = new URLSearchParams({
            client_id: env.DISCORD_CLIENT_ID,
            client_secret: env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: env.DISCORD_REDIRECT_URI,
        })

        const tokenResponse = await axios.post<DiscordTokenResponse>(
            'https://discord.com/api/oauth2/token',
            tokenParams.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        )

        const { access_token, refresh_token, expires_in } = tokenResponse.data

        const userResponse = await axios.get<DiscordUser>(
            'https://discord.com/api/users/@me',
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        )

        const discordUser = userResponse.data
        const expiresAt = new Date(Date.now() + expires_in * 1000)

        const discordData = {
            discordId: discordUser.id,
            discordUsername: discordUser.username,
            discordAvatarHash: discordUser.avatar || '',
            discordAccessToken: encrypt(access_token),
            discordRefreshToken: encrypt(refresh_token),
            discordTokenExpiresAt: expiresAt,
        }

        const [existing] = await db
            .select({ id: userDiscord.id })
            .from(userDiscord)
            .where(eq(userDiscord.userId, user.id))
            .limit(1)

        if (existing) {
            await db
                .update(userDiscord)
                .set(discordData)
                .where(eq(userDiscord.userId, user.id))
        } else {
            await db.insert(userDiscord).values({
                userId: user.id,
                ...discordData,
            })
        }

        const returnUrl = (req.query.returnUrl as string) || '/client'
        res.redirect(`${env.FRONTEND_URL}${returnUrl}?discord=connected`)
    } catch (error: unknown) {
        logger.error(`Error handling Discord callback - ${error}`)

        const returnUrl = (req.query.returnUrl as string) || '/client'

        if (error instanceof ZodError) {
            return res.redirect(
                `${env.FRONTEND_URL}${returnUrl}?error=invalid_callback`
            )
        }

        res.redirect(`${env.FRONTEND_URL}${returnUrl}?error=connection_failed`)
    }
}
