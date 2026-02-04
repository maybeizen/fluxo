import { z } from 'zod'
import { getDb, tickets } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { TicketStatus } from '@fluxo/types'

export const addMessageSchema = z
    .object({
        ticketId: z.coerce.number('Ticket ID is required'),
        content: z
            .string('Content is required')
            .min(1, 'Content must not be empty')
            .max(5000, 'Content must be less than 5000 characters long'),
    })
    .superRefine(async (data, ctx) => {
        const db = getDb()
        const [ticket] = await db
            .select()
            .from(tickets)
            .where(eq(tickets.id, data.ticketId))
            .limit(1)
        if (!ticket) {
            return ctx.addIssue({
                code: 'custom',
                path: ['ticketId'],
                message: 'Ticket not found',
            })
        }

        if (ticket.status === TicketStatus.CLOSED) {
            ctx.addIssue({
                code: 'custom',
                path: ['ticketId'],
                message: 'Ticket is closed',
            })
        }
    })
