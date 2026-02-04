import { Request, Response } from 'express'
import { uploadLogo } from '../../../../utils/multer-logo'
import { getDb, settings } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { settingsCache } from '../../../../utils/cache'
import { env } from '../../../../utils/env'

export const uploadLogoHandler = async (req: Request, res: Response) => {
    uploadLogo(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Failed to upload logo',
                })
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                })
            }

            const db = getDb()
            const [settingsRow] = await db.select().from(settings).limit(1)

            if (!settingsRow) {
                return res.status(404).json({
                    success: false,
                    message: 'Settings not found',
                })
            }

            const logoUrl = `${env.API_URL}/uploads/logos/${req.file.filename}`

            await db
                .update(settings)
                .set({ appLogoUrl: logoUrl })
                .where(eq(settings.id, settingsRow.id))

            await settingsCache.del('global')
            await settingsCache.del('global:minimal')
            await settingsCache.del('public:app-settings')

            res.status(200).json({
                success: true,
                message: 'Logo uploaded successfully',
                logoUrl,
            })
        } catch (error: unknown) {
            logger.error(`Error uploading logo - ${error}`)

            res.status(500).json({
                success: false,
                message: 'Internal server error',
            })
        }
    })
}
