import { Request, Response } from 'express'
import { updateProfileSchema } from '../../../../validators/profile/updateProfile'
import { getDb, users, userEmailVerification } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { ZodError } from 'zod'
import { logger } from '../../../../utils/logger'
import { sendEmail } from '../../../../utils/mailer'
import { emailVerificationTemplate } from '../../../../utils/email-templates'
import { env } from '../../../../utils/env'
import { v4 as uuidv4 } from 'uuid'
import { emailRateLimiter } from '../../../../middleware/rateLimiters'
import { userCache } from '../../../../utils/cache'

export const updateProfile = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const updates = await updateProfileSchema.parseAsync(req.body)
        const db = getDb()

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, req.userId))
            .limit(1)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            })
        }

        const oldUsername = user.username
        const oldEmail = user.email
        const emailChanged = updates.email && updates.email !== user.email

        if (emailChanged && updates.email) {
            await new Promise<void>((resolve, reject) => {
                emailRateLimiter(req, res, (err?: any) => {
                    if (err) reject(err)
                    else resolve()
                })
            }).catch(() => {
                return
            })

            if (res.headersSent) {
                return
            }
            const verificationToken = uuidv4()
            const verificationExpiry = new Date(
                Date.now() + 24 * 60 * 60 * 1000
            )

            await db
                .delete(userEmailVerification)
                .where(eq(userEmailVerification.userId, user.id))

            await db
                .update(users)
                .set({
                    email: updates.email,
                    isVerified: false,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, user.id))

            await db.insert(userEmailVerification).values({
                userId: user.id,
                token: verificationToken,
                expiresAt: verificationExpiry,
            })

            const otherUpdates: any = { updatedAt: new Date() }
            if (updates.firstName !== undefined)
                otherUpdates.firstName = updates.firstName
            if (updates.lastName !== undefined)
                otherUpdates.lastName = updates.lastName
            if (updates.username !== undefined) {
                otherUpdates.username = updates.username

                const baseSlug = updates.username
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                const suffix = Math.floor(Math.random() * 10000)
                otherUpdates.slug = `${baseSlug}-${suffix}`
            }
            if (updates.headline !== undefined)
                otherUpdates.headline = updates.headline
            if (updates.about !== undefined) otherUpdates.about = updates.about
            if (updates.avatarUrl !== undefined)
                otherUpdates.avatarUrl = updates.avatarUrl

            if (Object.keys(otherUpdates).length > 1) {
                await db
                    .update(users)
                    .set(otherUpdates)
                    .where(eq(users.id, user.id))
            }

            const verificationLink = `${env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`

            await sendEmail({
                to: updates.email,
                subject: `Verify Your New Email - ${env.APP_NAME}`,
                html: emailVerificationTemplate(
                    updates.username || user.username,
                    verificationLink
                ),
            })

            const [updatedUser] = await db
                .select({
                    id: users.id,
                    email: users.email,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    role: users.role,
                    isVerified: users.isVerified,
                    username: users.username,
                    slug: users.slug,
                    headline: users.headline,
                    about: users.about,
                    avatarUrl: users.avatarUrl,
                    createdAt: users.createdAt,
                    updatedAt: users.updatedAt,
                })
                .from(users)
                .where(eq(users.id, user.id))
                .limit(1)

            const profile = {
                ...updatedUser,
                uuid: updatedUser.id.toString(),
                profile: {
                    username: updatedUser.username,
                    slug: updatedUser.slug,
                    headline: updatedUser.headline,
                    about: updatedUser.about,
                    avatarUrl: updatedUser.avatarUrl,
                },
            }

            await userCache.delPattern('list:*')
            await userCache.del(`id:${user.id}`)
            await userCache.del(`email:${oldEmail}`)
            await userCache.del(`email:${updates.email}`)
            if (oldUsername) {
                await userCache.del(`username:${oldUsername}`)
                await userCache.del(`profile:${oldUsername}`)
            }
            await userCache.del(`auth:${user.id}`)

            return res.status(200).json({
                success: true,
                message:
                    'Email updated. Please check your new email to verify your account.',
                profile,
                emailChanged: true,
            })
        }

        const updateData: any = { updatedAt: new Date() }
        if (updates.firstName !== undefined)
            updateData.firstName = updates.firstName
        if (updates.lastName !== undefined)
            updateData.lastName = updates.lastName
        if (updates.username !== undefined) {
            updateData.username = updates.username

            const baseSlug = updates.username
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
            const suffix = Math.floor(Math.random() * 10000)
            updateData.slug = `${baseSlug}-${suffix}`
        }
        if (updates.headline !== undefined)
            updateData.headline = updates.headline
        if (updates.about !== undefined) updateData.about = updates.about
        if (updates.avatarUrl !== undefined)
            updateData.avatarUrl = updates.avatarUrl

        await db.update(users).set(updateData).where(eq(users.id, user.id))

        const [updatedUser] = await db
            .select({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                role: users.role,
                isVerified: users.isVerified,
                username: users.username,
                slug: users.slug,
                headline: users.headline,
                about: users.about,
                avatarUrl: users.avatarUrl,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1)

        const profile = {
            ...updatedUser,
            uuid: updatedUser.id.toString(),
            profile: {
                username: updatedUser.username,
                slug: updatedUser.slug,
                headline: updatedUser.headline,
                about: updatedUser.about,
                avatarUrl: updatedUser.avatarUrl,
            },
        }

        const newUsername = updatedUser.username
        await userCache.delPattern('list:*')
        await userCache.del(`id:${user.id}`)
        await userCache.del(`email:${oldEmail}`)
        if (oldUsername) {
            await userCache.del(`username:${oldUsername}`)
            await userCache.del(`profile:${oldUsername}`)
        }
        if (newUsername && newUsername !== oldUsername) {
            await userCache.del(`username:${newUsername}`)
            await userCache.del(`profile:${newUsername}`)
        }
        await userCache.del(`auth:${user.id}`)

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile,
        })
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
        }

        logger.error(`Error updating profile - ${error}`)

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
