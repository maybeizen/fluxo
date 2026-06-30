import { type Request, type Response } from 'express'
import {
    uploadAvatar,
    validateUploadedFileMagic,
    normalizeExtension,
} from '../../../../utils/upload'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { getStorageDriver } from '../../../../utils/storage'
import { userCache } from '../../../../utils/cache'

export const updateAvatar = async (req: Request, res: Response) => {
    uploadAvatar(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Failed to upload avatar',
                })
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                })
            }

            if (
                !validateUploadedFileMagic(req.file.buffer, req.file.mimetype)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid file content',
                })
            }

            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                })
            }

            const db = getDb()
            const [existingUser] = await db
                .select({
                    avatarUrl: users.avatarUrl,
                    username: users.username,
                })
                .from(users)
                .where(eq(users.id, req.userId))
                .limit(1)

            const driver = await getStorageDriver()
            const ext = normalizeExtension(req.file.mimetype)
            const filename = `${req.userId}-${Date.now()}${ext}`
            const { url: avatarUrl } = await driver.save(
                'avatars',
                filename,
                req.file.buffer,
                req.file.mimetype
            )

            if (existingUser?.avatarUrl) {
                await driver.remove(existingUser.avatarUrl)
            }

            await db
                .update(users)
                .set({ avatarUrl, updatedAt: new Date() })
                .where(eq(users.id, req.userId))

            await userCache.del(`id:${req.userId}`)
            await userCache.del(`auth:${req.userId}`)
            if (existingUser?.username) {
                await userCache.del(`username:${existingUser.username}`)
                await userCache.del(`profile:${existingUser.username}`)
            }

            const [user] = await db
                .select({
                    id: users.id,
                    email: users.email,
                    username: users.username,
                    slug: users.slug,
                    headline: users.headline,
                    about: users.about,
                    avatarUrl: users.avatarUrl,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    role: users.role,
                })
                .from(users)
                .where(eq(users.id, req.userId))
                .limit(1)

            res.status(200).json({
                success: true,
                message: 'Avatar updated successfully',
                avatarUrl: user?.avatarUrl,
                user: user
                    ? {
                          ...user,
                          uuid: user.id.toString(),
                          profile: {
                              username: user.username,
                              slug: user.slug,
                              headline: user.headline,
                              about: user.about,
                              avatarUrl: user.avatarUrl,
                          },
                      }
                    : null,
            })
        } catch (error: unknown) {
            logger.error(`Error updating avatar - ${error}`)

            res.status(500).json({
                success: false,
                message: 'Internal server error',
            })
        }
    })
}
