import { type Request, type Response } from 'express'
import {
    uploadAvatar,
    validateUploadedFileMagic,
} from '../../../../utils/upload'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { getStorageDriver } from '../../../../utils/storage'
import { userCache } from '../../../../utils/cache'
import { processImage } from '../../../../utils/image'
import { serializeProfile } from '../../../../utils/serializers/user'

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
                    avatarKey: users.avatarKey,
                    avatarUrl: users.avatarUrl,
                    username: users.username,
                })
                .from(users)
                .where(eq(users.id, req.userId))
                .limit(1)

            const driver = await getStorageDriver()
            const baseKey = `avatars/${req.userId}-${Date.now()}`
            const variants = await processImage(req.file.buffer, {
                sizes: [64, 256, 'full'],
                cap: 1024,
            })

            await driver.saveVariants(
                baseKey,
                variants.map((variant) => ({
                    size: variant.size,
                    buffer: variant.buffer,
                }))
            )

            const oldKey = existingUser?.avatarKey ?? existingUser?.avatarUrl
            if (oldKey) {
                await driver.remove(oldKey)
            }

            await db
                .update(users)
                .set({
                    avatarKey: baseKey,
                    avatarUrl: null,
                    updatedAt: new Date(),
                })
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
                    avatarKey: users.avatarKey,
                    avatarUrl: users.avatarUrl,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    role: users.role,
                })
                .from(users)
                .where(eq(users.id, req.userId))
                .limit(1)

            const serialized = user ? await serializeProfile(user) : null
            const avatarUrl = serialized?.profile.avatarUrl ?? null

            res.status(200).json({
                success: true,
                message: 'Avatar updated successfully',
                avatarUrl,
                user: serialized,
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
