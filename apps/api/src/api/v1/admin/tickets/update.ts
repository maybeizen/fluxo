import { Request, Response } from 'express'
import { getDb, tickets, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { ZodError } from 'zod'
import { updateTicketSchema } from '../../../../validators/admin/tickets/update'
import { logger } from '../../../../utils/logger'
import { ticketCache } from '../../../../utils/cache'
import { TicketStatus } from '@fluxo/types'
import { emitTicketUpdate } from '../../../../utils/websocket'
import { sendEmail } from '../../../../utils/mailer'
import { ticketClosedTemplate } from '../../../../utils/email-templates'
import { env } from '../../../../utils/env'

export const updateTicket = async (req: Request, res: Response) => {
    try {
        const ticketId = parseInt(
            Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
            10
        )
        if (isNaN(ticketId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID',
            })
        }
        const validated = await updateTicketSchema.parseAsync(req.body)

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

        const previousStatus = ticket.status
        const wasClosed = previousStatus === TicketStatus.CLOSED

        const updateData: any = { updatedAt: new Date() }

        if (validated.title !== undefined) updateData.title = validated.title
        if (validated.content !== undefined)
            updateData.content = validated.content
        if (validated.type !== undefined) updateData.type = validated.type
        if (validated.assignedToId !== undefined)
            updateData.assignedToId = validated.assignedToId

        if (validated.status !== undefined) {
            updateData.status = validated.status
            if (validated.status === TicketStatus.CLOSED && !ticket.closedAt) {
                updateData.closedAt = new Date()
            }
            if (
                validated.status === TicketStatus.DELETED &&
                !ticket.deletedAt
            ) {
                updateData.deletedAt = new Date()
            }
        }

        await db.update(tickets).set(updateData).where(eq(tickets.id, ticketId))

        const [updatedTicket] = await db
            .select()
            .from(tickets)
            .where(eq(tickets.id, ticketId))
            .limit(1)

        await ticketCache.delPattern('admin:*')
        await ticketCache.delPattern(`client:${ticket.userId}:*`)
        await ticketCache.del(`admin:${ticketId}`)
        await ticketCache.del(`client:${ticket.userId}:${ticketId}`)

        await emitTicketUpdate(ticketId.toString(), {
            type: 'ticket:updated',
            ticket: updatedTicket,
        })

        if (
            !wasClosed &&
            updatedTicket.status === TicketStatus.CLOSED &&
            updatedTicket.closedAt
        ) {
            const [ticketOwner] = await db
                .select({
                    email: users.email,
                    username: users.username,
                })
                .from(users)
                .where(eq(users.id, ticket.userId))
                .limit(1)
            if (ticketOwner) {
                const ticketUrl = `${env.FRONTEND_URL}/client/support/${ticketId}`
                const newTicketUrl = `${env.FRONTEND_URL}/client/support/new`
                const closedDate = updatedTicket.closedAt.toLocaleDateString(
                    'en-US',
                    {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    }
                )
                const emailHtml = ticketClosedTemplate(
                    ticketOwner.username || 'User',
                    ticketId.toString(),
                    updatedTicket.title,
                    closedDate,
                    ticketUrl,
                    newTicketUrl
                )

                await sendEmail({
                    to: ticketOwner.email,
                    subject: `Support Ticket Closed - ${updatedTicket.title}`,
                    html: emailHtml,
                }).catch((error) => {
                    logger.error(
                        `Failed to send ticket closed email - ${error}`
                    )
                })
            }
        }

        const transformedTicket = {
            ...updatedTicket,
            uuid: updatedTicket.id.toString(),
            timestamps: {
                createdAt: updatedTicket.createdAt,
                updatedAt: updatedTicket.updatedAt,
                respondedToAt: updatedTicket.respondedToAt,
                closedAt: updatedTicket.closedAt,
                deletedAt: updatedTicket.deletedAt,
            },
        }

        res.status(200).json({
            success: true,
            message: 'Ticket updated successfully',
            ticket: transformedTicket,
        })
    } catch (error: unknown) {
        logger.error(`Error updating ticket - ${error}`)

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
