import { Request, Response } from 'express'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { ZodError } from 'zod'
import { z } from 'zod'
import { logger } from '../../../../utils/logger'
import { userCache } from '../../../../utils/cache'
import { UserRole } from '@fluxo/types'

const ticketBanUserSchema = z.object({
    params: z.object({
        id: z.coerce.number('User ID is required'),
    }),
    body: z.object({
        referenceId: z.string().optional(),
    }),
})

export const ticketBanUser = async (req: Request, res: Response) => {
    try {
        const validated = await ticketBanUserSchema.parseAsync({
            params: req.params,
            body: req.body,
        })

        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const currentUserId = req.userId

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

        if (user.id === currentUserId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot ban yourself',
            })
        }

        if (user.role === UserRole.ADMIN) {
            return res.status(400).json({
                success: false,
                message: 'Cannot ban admin users',
            })
        }

        const updateData: any = {
            isTicketBanned: true,
            updatedAt: new Date(),
        }
        if (validated.body.referenceId) {
            updateData.punishmentReferenceId = validated.body.referenceId
        }

        await db.update(users).set(updateData).where(eq(users.id, user.id))

        await userCache.del(`user:${user.id}:punishment`)
        await userCache.del(`auth:${user.id}`)
        await userCache.del(`id:${user.id}`)
        await userCache.del(`email:${user.email}`)

        res.status(200).json({
            success: true,
            message: 'User ticket banned successfully',
            user: {
                id: user.id,
                uuid: user.id.toString(),
                punishment: {
                    isBanned: user.isBanned,
                    isTicketBanned: true,
                    referenceId:
                        validated.body.referenceId ||
                        user.punishmentReferenceId,
                },
            },
        })
    } catch (error: unknown) {
        logger.error(`Error ticket banning user - ${error}`)

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
