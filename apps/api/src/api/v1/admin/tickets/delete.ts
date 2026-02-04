import { Request, Response } from 'express'
import { getDb, tickets } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { ZodError } from 'zod'
import { logger } from '../../../../utils/logger'
import { ticketCache } from '../../../../utils/cache'
import { TicketStatus } from '@fluxo/types'
import { z } from 'zod'

const deleteTicketSchema = z.object({
    params: z.object({
        id: z.coerce.number('Ticket ID is required'),
    }),
})

export const deleteTicket = async (req: Request, res: Response) => {
    try {
        const validated = deleteTicketSchema.parse({ params: req.params })
        const ticketId = validated.params.id

        const db = getDb()
        const [ticket] = await db
            .select()
            .from(tickets)
            .where(eq(tickets.id, ticketId))
            .limit(1)

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
            })
        }

        await db
            .update(tickets)
            .set({
                status: TicketStatus.DELETED,
                deletedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(tickets.id, ticketId))

        await ticketCache.delPattern('admin:*')
        await ticketCache.delPattern(`client:${ticket.userId}:*`)
        await ticketCache.del(`admin:${ticketId}`)
        await ticketCache.del(`client:${ticket.userId}:${ticketId}`)

        res.status(200).json({
            success: true,
            message: 'Ticket deleted successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error deleting ticket - ${error}`)

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
        })
    }
}
