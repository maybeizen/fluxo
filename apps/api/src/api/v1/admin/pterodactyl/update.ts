import { Request, Response } from 'express'
import { z } from 'zod'
import { getDb, settings } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { encrypt, decrypt } from '../../../../utils/encryption'
import { settingsCache } from '../../../../utils/cache'

const updatePterodactylSettingsSchema = z.object({
    baseUrl: z.url().optional(),
    apiKey: z.string().min(1).optional(),
})

export const updatePterodactylSettings = async (
    req: Request,
    res: Response
) => {
    try {
        const validated = await updatePterodactylSettingsSchema.parseAsync(
            req.body
        )
        const db = getDb()
        const [settingsRow] = await db.select().from(settings).limit(1)

        if (!settingsRow) {
            return res.status(404).json({
                success: false,
                message: 'Settings not found',
            })
        }

        const updateData: any = { updatedAt: new Date() }
        if (validated.baseUrl !== undefined) {
            updateData.pterodactylBaseUrl = validated.baseUrl
        }
        if (validated.apiKey !== undefined) {
            updateData.pterodactylApiKey = encrypt(validated.apiKey)
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

        const decryptedSettings = {
            baseUrl: updatedSettings.pterodactylBaseUrl,
            apiKey: updatedSettings.pterodactylApiKey
                ? decrypt(updatedSettings.pterodactylApiKey)
                : undefined,
        }

        res.status(200).json({
            success: true,
            message: 'Pterodactyl settings updated successfully',
            settings: decryptedSettings,
        })
    } catch (error: unknown) {
        logger.error(`Error updating Pterodactyl settings: ${error}`)

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
