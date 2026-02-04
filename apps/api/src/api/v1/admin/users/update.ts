import { Request, Response } from 'express'
import { updateUserSchema } from '../../../../validators/admin/users/update'
import { ZodError } from 'zod'
import { logger } from '../../../../utils/logger'
import { userCache } from '../../../../utils/cache'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { UserRole } from '@fluxo/types'

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { user, updates } = await updateUserSchema.parseAsync({
            id: req.params.id,
            updates: req.body.updates,
        })

        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthenticated.',
            })
        }

        const db = getDb()
        const [currentUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, req.userId))
            .limit(1)

        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Unauthenticated.',
            })
        }

        if (currentUser.role === UserRole.STAFF) {
            if (updates.role === UserRole.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Staff members cannot assign admin role.',
                })
            }
            if (
                user.id === req.session.userId &&
                updates.role &&
                updates.role === UserRole.ADMIN
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'You cannot make yourself admin.',
                })
            }
        }

        if (
            req.userId &&
            user.id === req.userId &&
            updates.role &&
            user.role === 'admin' &&
            updates.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'You cannot remove admin role from yourself',
            })
        }

        const oldUsername = user.username
        const oldEmail = user.email
        const emailChanged = updates.email && updates.email !== user.email

        const updateData: any = { updatedAt: new Date() }
        if (updates.username !== undefined) {
            updateData.username = updates.username

            const baseSlug = updates.username
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
            const suffix = Math.floor(Math.random() * 10000)
            updateData.slug = `${baseSlug}-${suffix}`
        }
        if (updates.email !== undefined) updateData.email = updates.email
        if (updates.firstName !== undefined)
            updateData.firstName = updates.firstName
        if (updates.lastName !== undefined)
            updateData.lastName = updates.lastName
        if (updates.role !== undefined) updateData.role = updates.role
        if (updates.isVerified !== undefined)
            updateData.isVerified = updates.isVerified

        await db.update(users).set(updateData).where(eq(users.id, user.id))

        const [updatedUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1)

        await userCache.delPattern('list:*')
        await userCache.del(`id:${user.id}`)
        await userCache.del(`email:${oldEmail}`)
        if (emailChanged && updatedUser?.email) {
            await userCache.del(`email:${updatedUser.email}`)
        }
        if (oldUsername) {
            await userCache.del(`username:${oldUsername}`)
        }
        if (updates.username && updates.username !== oldUsername) {
            await userCache.del(`username:${updates.username}`)
        }
        await userCache.del(`auth:${user.id}`)

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: updatedUser?.id,
                uuid: updatedUser?.id.toString(),
                email: updatedUser?.email,
                firstName: updatedUser?.firstName,
                lastName: updatedUser?.lastName,
                username: updatedUser?.username,
                role: updatedUser?.role,
                isVerified: updatedUser?.isVerified,
            },
        })
    } catch (error: unknown) {
        logger.error(`Error updating user - ${error}`)

        if (error instanceof ZodError) {
            const noUpdatesError = error.issues.find(
                (issue) =>
                    issue.path.includes('updates') &&
                    issue.message === 'No updates provided'
            )

            if (noUpdatesError) {
                return res.status(400).json({
                    success: false,
                    message:
                        'No changes detected. Please modify at least one field.',
                })
            }

            return res.status(400).json({
                success: false,
                errors: error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
