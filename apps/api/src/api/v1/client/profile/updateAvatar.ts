import { Request, Response } from 'express'
import { upload } from '../../../../utils/multer'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { env } from '../../../../utils/env'

export const updateAvatar = async (req: Request, res: Response) => {
    upload(req, res, async (err) => {
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

            const avatarUrl = `${env.API_URL}/uploads/avatars/${req.file.filename}`

            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                })
            }

            const db = getDb()
            await db
                .update(users)
                .set({ avatarUrl, updatedAt: new Date() })
                .where(eq(users.id, req.userId))

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
