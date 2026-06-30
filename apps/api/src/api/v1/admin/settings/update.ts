import { type Request, type Response } from 'express'
import { updateSettingsSchema } from '../../../../validators/admin/settings'
import { ZodError } from 'zod'
import { getDb, settings } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { encrypt, decrypt } from '../../../../utils/encryption'
import { settingsCache } from '../../../../utils/cache'
import { setEmailThemeColor } from '../../../../utils/email-templates'
import { invalidateStorageDriver } from '../../../../utils/storage'
import { resolveLogoUrl } from '../../../../utils/serializers/user'
import { applyDebugLogLevel } from '../../../../utils/log-level'

function formatSystemSettings(settingsRow: typeof settings.$inferSelect) {
    return {
        ticketsEnabled: settingsRow.ticketsEnabled ?? true,
        maintenanceMode: settingsRow.maintenanceMode ?? false,
        maintenanceMessage: settingsRow.maintenanceMessage ?? undefined,
        debugMode: settingsRow.debugMode ?? false,
        announcementEnabled: settingsRow.announcementEnabled ?? false,
        announcementMessage: settingsRow.announcementMessage ?? undefined,
    }
}

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const { settings: settingsRow, data } =
            await updateSettingsSchema.parseAsync(req.body)

        const db = getDb()
        const updateData: any = { updatedAt: new Date() }

        if (data.app) {
            if (data.app.name !== undefined) updateData.appName = data.app.name
            if (data.app.themeColor !== undefined)
                updateData.appThemeColor = data.app.themeColor
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

        if (data.storage) {
            const currentStorage = (settingsRow.storage as any) || {}
            const updatedStorage = {
                ...currentStorage,
                ...(data.storage.provider !== undefined && {
                    provider: data.storage.provider,
                }),
                s3: {
                    ...currentStorage.s3,
                    ...(data.storage.s3?.endpoint !== undefined && {
                        endpoint: data.storage.s3.endpoint,
                    }),
                    ...(data.storage.s3?.region !== undefined && {
                        region: data.storage.s3.region,
                    }),
                    ...(data.storage.s3?.bucket !== undefined && {
                        bucket: data.storage.s3.bucket,
                    }),
                    ...(data.storage.s3?.accessKeyId !== undefined && {
                        accessKeyId: encrypt(data.storage.s3.accessKeyId),
                    }),
                    ...(data.storage.s3?.secretAccessKey !== undefined && {
                        secretAccessKey: encrypt(
                            data.storage.s3.secretAccessKey
                        ),
                    }),
                    ...(data.storage.s3?.forcePathStyle !== undefined && {
                        forcePathStyle: data.storage.s3.forcePathStyle,
                    }),
                    ...(data.storage.s3?.publicUrlBase !== undefined && {
                        publicUrlBase: data.storage.s3.publicUrlBase,
                    }),
                },
            }
            updateData.storage = updatedStorage
        }

        if (data.system) {
            if (data.system.ticketsEnabled !== undefined)
                updateData.ticketsEnabled = data.system.ticketsEnabled
            if (data.system.maintenanceMode !== undefined)
                updateData.maintenanceMode = data.system.maintenanceMode
            if (data.system.maintenanceMessage !== undefined)
                updateData.maintenanceMessage = data.system.maintenanceMessage
            if (data.system.debugMode !== undefined)
                updateData.debugMode = data.system.debugMode
            if (data.system.announcementEnabled !== undefined)
                updateData.announcementEnabled = data.system.announcementEnabled
            if (data.system.announcementMessage !== undefined)
                updateData.announcementMessage = data.system.announcementMessage
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
        invalidateStorageDriver()

        if (updatedSettings.appThemeColor) {
            setEmailThemeColor(updatedSettings.appThemeColor)
        }

        if (data.system?.debugMode !== undefined) {
            applyDebugLogLevel(updatedSettings.debugMode ?? false)
        }

        const decryptedSettings = {
            id: updatedSettings.id,
            uuid: updatedSettings.id.toString(),
            app: {
                name: updatedSettings.appName,
                logoUrl: await resolveLogoUrl(updatedSettings),
                themeColor: updatedSettings.appThemeColor ?? undefined,
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
            storage: {
                provider: (updatedSettings.storage as any)?.provider ?? 'local',
                s3: {
                    endpoint: (updatedSettings.storage as any)?.s3?.endpoint,
                    region: (updatedSettings.storage as any)?.s3?.region,
                    bucket: (updatedSettings.storage as any)?.s3?.bucket,
                    accessKeyId: (updatedSettings.storage as any)?.s3
                        ?.accessKeyId
                        ? decrypt(
                              (updatedSettings.storage as any).s3.accessKeyId
                          )
                        : undefined,
                    secretAccessKey: (updatedSettings.storage as any)?.s3
                        ?.secretAccessKey
                        ? decrypt(
                              (updatedSettings.storage as any).s3
                                  .secretAccessKey
                          )
                        : undefined,
                    forcePathStyle: (updatedSettings.storage as any)?.s3
                        ?.forcePathStyle,
                    publicUrlBase: (updatedSettings.storage as any)?.s3
                        ?.publicUrlBase,
                },
            },
            system: formatSystemSettings(updatedSettings),
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
