import { type Request, type Response } from 'express'
import { getDb, settings } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { decrypt } from '../../../../utils/encryption'
import { settingsCache } from '../../../../utils/cache'
import { resolveLogoUrl } from '../../../../utils/serializers/user'

export const getSettings = async (req: Request, res: Response) => {
    try {
        const cacheKey = 'global'
        const cached = await settingsCache.get(cacheKey)

        if (cached) {
            return res.status(200).json({
                success: true,
                settings: cached,
            })
        }

        const db = getDb()
        let [settingsRow] = await db.select().from(settings).limit(1)

        if (!settingsRow) {
            const [newSettings] = await db
                .insert(settings)
                .values({
                    appName: null,
                    appLogoUrl: null,
                    authDisableEmailVerification: false,
                    authDisableRegistration: false,
                    authDisableLogin: false,
                    authDisablePasswordChange: false,
                    discordClientId: null,
                    discordClientSecret: null,
                    discordRedirectUri: null,
                    emailSmtpHost: null,
                    emailSmtpPort: null,
                    emailSmtpUser: null,
                    emailSmtpPass: null,
                    emailFrom: null,
                    gateways: {},
                    security: {},
                    storage: {},
                    pterodactylBaseUrl: null,
                    pterodactylApiKey: null,
                })
                .returning()
            settingsRow = newSettings
        }

        const decryptedSettings = {
            id: settingsRow.id,
            uuid: settingsRow.id.toString(),
            app: {
                name: settingsRow.appName,
                logoUrl: await resolveLogoUrl(settingsRow),
                themeColor: settingsRow.appThemeColor ?? undefined,
            },
            auth: {
                disableEmailVerification:
                    settingsRow.authDisableEmailVerification ?? false,
                disableRegistration:
                    settingsRow.authDisableRegistration ?? false,
                disableLogin: settingsRow.authDisableLogin ?? false,
                disablePasswordChange:
                    settingsRow.authDisablePasswordChange ?? false,
            },
            discord: {
                clientId: settingsRow.discordClientId,
                clientSecret: settingsRow.discordClientSecret
                    ? decrypt(settingsRow.discordClientSecret)
                    : undefined,
                redirectUri: settingsRow.discordRedirectUri,
            },
            email: {
                smtpHost: settingsRow.emailSmtpHost,
                smtpPort: settingsRow.emailSmtpPort,
                smtpUser: settingsRow.emailSmtpUser,
                smtpPass: settingsRow.emailSmtpPass
                    ? decrypt(settingsRow.emailSmtpPass)
                    : undefined,
                emailFrom: settingsRow.emailFrom,
            },
            gateways: {
                stripe: {
                    secretKey: (settingsRow.gateways as any)?.stripe?.secretKey
                        ? decrypt(
                              (settingsRow.gateways as any).stripe.secretKey
                          )
                        : undefined,
                    publishableKey: (settingsRow.gateways as any)?.stripe
                        ?.publishableKey,
                },
            },
            security: {
                cloudflare: {
                    turnstileEnabled:
                        (settingsRow.security as any)?.cloudflare
                            ?.turnstileEnabled ?? false,
                    turnstileSiteKey: (settingsRow.security as any)?.cloudflare
                        ?.turnstileSiteKey,
                    turnstileSecretKey: (settingsRow.security as any)
                        ?.cloudflare?.turnstileSecretKey
                        ? decrypt(
                              (settingsRow.security as any).cloudflare
                                  .turnstileSecretKey
                          )
                        : undefined,
                },
            },
            storage: {
                provider: (settingsRow.storage as any)?.provider ?? 'local',
                s3: {
                    endpoint: (settingsRow.storage as any)?.s3?.endpoint,
                    region: (settingsRow.storage as any)?.s3?.region,
                    bucket: (settingsRow.storage as any)?.s3?.bucket,
                    accessKeyId: (settingsRow.storage as any)?.s3?.accessKeyId
                        ? decrypt((settingsRow.storage as any).s3.accessKeyId)
                        : undefined,
                    secretAccessKey: (settingsRow.storage as any)?.s3
                        ?.secretAccessKey
                        ? decrypt(
                              (settingsRow.storage as any).s3.secretAccessKey
                          )
                        : undefined,
                    forcePathStyle: (settingsRow.storage as any)?.s3
                        ?.forcePathStyle,
                    publicUrlBase: (settingsRow.storage as any)?.s3
                        ?.publicUrlBase,
                },
            },
        }

        await settingsCache.set(cacheKey, decryptedSettings, 600)

        res.status(200).json({
            success: true,
            settings: decryptedSettings,
        })
    } catch (error: unknown) {
        logger.error(`Error fetching settings: ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
