import { z } from 'zod'
import { TicketType } from '@fluxo/types'

export const createTicketSchema = z.object({
    title: z
        .string('Title is required')
        .min(3, 'Title must be at least 3 characters long')
        .max(200, 'Title must be less than 200 characters long'),
    content: z
        .string('Content is required')
        .min(10, 'Content must be at least 10 characters long')
        .max(5000, 'Content must be less than 5000 characters long'),
    type: z
        .enum(Object.values(TicketType) as [string, ...string[]])
        .optional()
        .default(TicketType.GENERAL),
})
