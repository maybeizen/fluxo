import { z } from 'zod'
import { TicketStatus, TicketType } from '@fluxo/types'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'

export const updateTicketSchema = z
    .object({
        title: z
            .string()
            .min(3, 'Title must be at least 3 characters long')
            .max(200, 'Title must be less than 200 characters long')
            .optional(),
        content: z
            .string()
            .min(10, 'Content must be at least 10 characters long')
            .max(5000, 'Content must be less than 5000 characters long')
            .optional(),
        status: z
            .enum(Object.values(TicketStatus) as [string, ...string[]])
            .optional(),
        type: z
            .enum(Object.values(TicketType) as [string, ...string[]])
            .optional(),
        assignedToId: z.coerce.number().optional(),
    })
    .superRefine(async (data, ctx) => {
        if (data.assignedToId) {
            const db = getDb()
            const [user] = await db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.id, data.assignedToId))
                .limit(1)
            if (!user) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['assignedToId'],
                    message: 'User not found',
                })
            }
        }
    })
