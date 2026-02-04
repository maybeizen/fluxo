import { Request, Response } from 'express'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { ZodError } from 'zod'
import { z } from 'zod'
import { logger } from '../../../../utils/logger'
import { userCache } from '../../../../utils/cache'

const ticketUnbanUserSchema = z.object({
    params: z.object({
        id: z.coerce.number('User ID is required'),
    }),
})

export const ticketUnbanUser = async (req: Request, res: Response) => {
    try {
        const validated = await ticketUnbanUserSchema.parseAsync({
            params: req.params,
        })

        const db = getDb()
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, validated.params.id))
            .limit(1)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            })
        }

        const updateData: any = {
            isTicketBanned: false,
            updatedAt: new Date(),
        }
        if (!user.isBanned) {
            updateData.punishmentReferenceId = null
        }

        await db.update(users).set(updateData).where(eq(users.id, user.id))

        await userCache.del(`user:${user.id}:punishment`)
        await userCache.del(`auth:${user.id}`)
        await userCache.del(`id:${user.id}`)
        await userCache.del(`email:${user.email}`)

        res.status(200).json({
            success: true,
            message: 'User ticket unbanned successfully',
            user: {
                id: user.id,
                uuid: user.id.toString(),
                punishment: {
                    isBanned: user.isBanned,
                    isTicketBanned: false,
                    referenceId: user.isBanned
                        ? user.punishmentReferenceId
                        : null,
                },
            },
        })
    } catch (error: unknown) {
        logger.error(`Error ticket unbanning user - ${error}`)

        if (error instanceof ZodError) {
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
