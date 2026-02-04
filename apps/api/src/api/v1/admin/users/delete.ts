import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { deleteUserSchema } from '../../../../validators/admin/users/delete'
import { logger } from '../../../../utils/logger'
import { userCache } from '../../../../utils/cache'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { UserRole } from '@fluxo/types'

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { user } = await deleteUserSchema.parseAsync(req.params)

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
            return res.status(403).json({
                success: false,
                message: 'Staff members cannot delete users.',
            })
        }

        if (req.userId && user.id === req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You cannot delete your own account',
            })
        }

        await db.delete(users).where(eq(users.id, user.id))

        await userCache.delPattern('list:*')
        await userCache.del(`id:${user.id}`)
        await userCache.del(`email:${user.email}`)
        if (user.username) {
            await userCache.del(`username:${user.username}`)
        }
        await userCache.del(`auth:${user.id}`)

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error deleting user - ${error}`)

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
        })
    }
}
