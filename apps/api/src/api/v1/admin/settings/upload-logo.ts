import { type Request, type Response } from 'express'
import {
    uploadLogo,
    validateUploadedFileMagic,
    normalizeExtension,
} from '../../../../utils/upload'
import { getDb, settings } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { settingsCache } from '../../../../utils/cache'
import { getStorageDriver } from '../../../../utils/storage'
import { v4 as uuidv4 } from 'uuid'

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

            if (
                !validateUploadedFileMagic(
                    req.file.buffer,
                    req.file.mimetype
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid file content',
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

            const driver = await getStorageDriver()
            const ext = normalizeExtension(req.file.mimetype)
            const filename = `logo-${uuidv4()}${ext}`
            const { url: logoUrl } = await driver.save(
                'logos',
                filename,
                req.file.buffer,
                req.file.mimetype
            )

            if (settingsRow.appLogoUrl) {
                await driver.remove(settingsRow.appLogoUrl)
            }

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
