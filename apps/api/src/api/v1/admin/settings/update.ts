import { Request, Response } from 'express'
import { updateSettingsSchema } from '../../../../validators/admin/settings'
import { ZodError } from 'zod'
import { getDb, settings } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { encrypt, decrypt } from '../../../../utils/encryption'
import { settingsCache } from '../../../../utils/cache'

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const { settings: settingsRow, data } =
            await updateSettingsSchema.parseAsync(req.body)

        const db = getDb()
        const updateData: any = { updatedAt: new Date() }

        if (data.app) {
            if (data.app.name !== undefined) updateData.appName = data.app.name
            if (data.app.logoUrl !== undefined)
                updateData.appLogoUrl = data.app.logoUrl
        }

        if (data.auth) {
            if (data.auth.disableEmailVerification !== undefined)
                updateData.authDisableEmailVerification =
                    data.auth.disableEmailVerification
            if (data.auth.disableRegistration !== undefined)
                updateData.authDisableRegistration =
                    data.auth.disableRegistration
            if (data.auth.disableLogin !== undefined)
                updateData.authDisableLogin = data.auth.disableLogin
            if (data.auth.disablePasswordChange !== undefined)
                updateData.authDisablePasswordChange =
                    data.auth.disablePasswordChange
        }

        if (data.discord) {
            if (data.discord.clientId !== undefined)
                updateData.discordClientId = data.discord.clientId
            if (data.discord.clientSecret !== undefined)
                updateData.discordClientSecret = encrypt(
                    data.discord.clientSecret
                )
            if (data.discord.redirectUri !== undefined)
                updateData.discordRedirectUri = data.discord.redirectUri
        }

        if (data.email) {
            if (data.email.smtpHost !== undefined)
                updateData.emailSmtpHost = data.email.smtpHost
            if (data.email.smtpPort !== undefined)
                updateData.emailSmtpPort = data.email.smtpPort
            if (data.email.smtpUser !== undefined)
                updateData.emailSmtpUser = data.email.smtpUser
            if (data.email.smtpPass !== undefined)
                updateData.emailSmtpPass = encrypt(data.email.smtpPass)
            if (data.email.emailFrom !== undefined)
                updateData.emailFrom = data.email.emailFrom
        }

        if (data.gateways?.stripe) {
            const currentGateways = (settingsRow.gateways as any) || {}
            const updatedGateways = {
                ...currentGateways,
                stripe: {
                    ...currentGateways.stripe,
                    ...(data.gateways.stripe.secretKey !== undefined && {
                        secretKey: encrypt(data.gateways.stripe.secretKey),
                    }),
                    ...(data.gateways.stripe.publishableKey !== undefined && {
                        publishableKey: data.gateways.stripe.publishableKey,
                    }),
                },
            }
            updateData.gateways = updatedGateways
        }

        if (data.security?.cloudflare) {
            const currentSecurity = (settingsRow.security as any) || {}
            const updatedSecurity = {
                ...currentSecurity,
                cloudflare: {
                    ...currentSecurity.cloudflare,
                    ...(data.security.cloudflare.turnstileEnabled !==
                        undefined && {
                        turnstileEnabled:
                            data.security.cloudflare.turnstileEnabled,
                    }),
                    ...(data.security.cloudflare.turnstileSiteKey !==
                        undefined && {
                        turnstileSiteKey:
                            data.security.cloudflare.turnstileSiteKey,
                    }),
                    ...(data.security.cloudflare.turnstileSecretKey !==
                        undefined && {
                        turnstileSecretKey: encrypt(
                            data.security.cloudflare.turnstileSecretKey
                        ),
                    }),
                },
            }
            updateData.security = updatedSecurity
        }

        await db
            .update(settings)
            .set(updateData)
            .where(eq(settings.id, settingsRow.id))

        const [updatedSettings] = await db
            .select()
            .from(settings)
            .where(eq(settings.id, settingsRow.id))
            .limit(1)

        await settingsCache.del('global')
        await settingsCache.del('global:minimal')
        await settingsCache.del('public:app-settings')

        const decryptedSettings = {
            id: updatedSettings.id,
            uuid: updatedSettings.id.toString(),
            app: {
                name: updatedSettings.appName,
                logoUrl: updatedSettings.appLogoUrl,
            },
            auth: {
                disableEmailVerification:
                    updatedSettings.authDisableEmailVerification ?? false,
                disableRegistration:
                    updatedSettings.authDisableRegistration ?? false,
                disableLogin: updatedSettings.authDisableLogin ?? false,
                disablePasswordChange:
                    updatedSettings.authDisablePasswordChange ?? false,
            },
            discord: {
                clientId: updatedSettings.discordClientId,
                clientSecret: updatedSettings.discordClientSecret
                    ? decrypt(updatedSettings.discordClientSecret)
                    : undefined,
                redirectUri: updatedSettings.discordRedirectUri,
            },
            email: {
                smtpHost: updatedSettings.emailSmtpHost,
                smtpPort: updatedSettings.emailSmtpPort,
                smtpUser: updatedSettings.emailSmtpUser,
                smtpPass: updatedSettings.emailSmtpPass
                    ? decrypt(updatedSettings.emailSmtpPass)
                    : undefined,
                emailFrom: updatedSettings.emailFrom,
            },
            gateways: {
                stripe: {
                    secretKey: (updatedSettings.gateways as any)?.stripe
                        ?.secretKey
                        ? decrypt(
                              (updatedSettings.gateways as any).stripe.secretKey
                          )
                        : undefined,
                    publishableKey: (updatedSettings.gateways as any)?.stripe
                        ?.publishableKey,
                },
            },
            security: {
                cloudflare: {
                    turnstileEnabled:
                        (updatedSettings.security as any)?.cloudflare
                            ?.turnstileEnabled ?? false,
                    turnstileSiteKey: (updatedSettings.security as any)
                        ?.cloudflare?.turnstileSiteKey,
                    turnstileSecretKey: (updatedSettings.security as any)
                        ?.cloudflare?.turnstileSecretKey
                        ? decrypt(
                              (updatedSettings.security as any).cloudflare
                                  .turnstileSecretKey
                          )
                        : undefined,
                },
            },
        }

        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            settings: decryptedSettings,
        })
    } catch (error: unknown) {
        logger.error(`Error updating settings: ${error}`)

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
        }

        if (error instanceof Error && error.message === 'Settings not found') {
            return res.status(404).json({
                success: false,
                message: 'Settings not found',
            })
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
