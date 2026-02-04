import { Request, Response } from 'express'
import { getDb, tickets, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { ZodError } from 'zod'
import { createTicketSchema } from '../../../../validators/client/tickets/create'
import { logger } from '../../../../utils/logger'
import { ticketCache } from '../../../../utils/cache'
import { TicketStatus } from '@fluxo/types'
import { emitTicketUpdate } from '../../../../utils/websocket'
import { sendEmail } from '../../../../utils/mailer'
import { ticketCreatedTemplate } from '../../../../utils/email-templates'
import { env } from '../../../../utils/env'

export const createTicket = async (req: Request, res: Response) => {
    try {
        const validated = await createTicketSchema.parseAsync(req.body)
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId

        const db = getDb()
        const [user] = await db
            .select({
                email: users.email,
                username: users.username,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            })
        }

        const [newTicket] = await db
            .insert(tickets)
            .values({
                userId,
                title: validated.title,
                content: validated.content,
                type: validated.type as
                    | 'general'
                    | 'account'
                    | 'billing'
                    | 'legal'
                    | 'other',
                status: TicketStatus.OPEN,
            })
            .returning()

        await ticketCache.delPattern(`client:${userId}:*`)

        await emitTicketUpdate(newTicket.id.toString(), {
            type: 'ticket:created',
            ticket: newTicket,
        })

        const ticketUrl = `${env.FRONTEND_URL}/client/support/${newTicket.id}`
        const trimmedContent = newTicket.content.trim()
        const emailHtml = ticketCreatedTemplate(
            user.username || 'User',
            newTicket.id.toString(),
            newTicket.title,
            trimmedContent,
            newTicket.type,
            ticketUrl
        )

        await sendEmail({
            to: user.email,
            subject: `Support Ticket Created - ${newTicket.title}`,
            html: emailHtml,
        }).catch((error) => {
            logger.error(`Failed to send ticket created email - ${error}`)
        })

        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            ticket: {
                ...newTicket,
                uuid: newTicket.id.toString(),
            },
        })
    } catch (error: unknown) {
        logger.error(`Error creating ticket - ${error}`)

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
