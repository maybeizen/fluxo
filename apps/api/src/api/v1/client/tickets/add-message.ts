import { Request, Response } from 'express'
import { getDb, tickets, ticketMessages, users } from '@fluxo/db'
import { eq, and } from '@fluxo/db'
import { ZodError } from 'zod'
import { addMessageSchema } from '../../../../validators/client/tickets/add-message'
import { logger } from '../../../../utils/logger'
import { ticketCache } from '../../../../utils/cache'
import { emitNewMessage } from '../../../../utils/websocket'

export const addMessage = async (req: Request, res: Response) => {
    try {
        const ticketIdParam = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id
        const ticketId = parseInt(ticketIdParam, 10)
        if (isNaN(ticketId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID',
            })
        }

        const validated = await addMessageSchema.parseAsync({
            ticketId,
            content: req.body.content,
        })

        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId

        const db = getDb()
        const [ticket] = await db
            .select()
            .from(tickets)
            .where(
                and(
                    eq(tickets.id, validated.ticketId),
                    eq(tickets.userId, userId)
                )
            )
            .limit(1)

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found or access denied',
            })
        }

        const [newMessage] = await db
            .insert(ticketMessages)
            .values({
                ticketId: validated.ticketId,
                content: validated.content,
                authorId: userId,
            })
            .returning()

        await db
            .update(tickets)
            .set({
                updatedAt: new Date(),
                respondedToAt: new Date(),
            })
            .where(eq(tickets.id, validated.ticketId))

        const [author] = await db
            .select({
                id: users.id,
                email: users.email,
                username: users.username,
                slug: users.slug,
                headline: users.headline,
                about: users.about,
                avatarUrl: users.avatarUrl,
                role: users.role,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

        const messageWithAuthor = {
            ...newMessage,
            uuid: newMessage.id.toString(),
            ticketUuid: newMessage.ticketId.toString(),
            author: author
                ? {
                      id: author.id,
                      uuid: author.id.toString(),
                      email: author.email,
                      profile: {
                          username: author.username,
                          slug: author.slug,
                          headline: author.headline,
                          about: author.about,
                          avatarUrl: author.avatarUrl,
                      },
                      role: author.role,
                  }
                : null,
        }

        await ticketCache.delPattern(`client:${userId}:*`)
        await ticketCache.del(`client:${userId}:${validated.ticketId}`)

        await emitNewMessage(validated.ticketId.toString(), messageWithAuthor)

        res.status(201).json({
            success: true,
            message: 'Message added successfully',
            ticketMessage: messageWithAuthor,
        })
    } catch (error: unknown) {
        logger.error(`Error adding message - ${error}`)

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
