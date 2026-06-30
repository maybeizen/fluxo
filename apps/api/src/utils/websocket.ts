import { type Server as SocketIOServer, type Socket } from 'socket.io'
import type { Handler, Request, Response, NextFunction } from 'express'
import { getDb, tickets, users, eq } from '@fluxo/db'
import { UserRole } from '@fluxo/types'
import { logger } from './logger'

type SessionMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => void

function wrapMiddleware(middleware: Handler) {
    return (socket: Socket, next: (err?: Error) => void) => {
        middleware(
            socket.request as Request,
            {} as Response,
            next as NextFunction
        )
    }
}

export function setupWebSocket(
    io: SocketIOServer,
    sessionMiddleware: SessionMiddleware,
    normalizeUserId: SessionMiddleware
) {
    io.use(wrapMiddleware(sessionMiddleware))
    io.use(wrapMiddleware(normalizeUserId))

    io.on('connection', (socket: Socket) => {
        logger.info(`Client connected: ${socket.id}`, { source: 'WebSocket' })

        socket.on('ticket:subscribe', async (ticketId: string) => {
            try {
                const req = socket.request as Request
                const userId = req.userId

                if (!userId) {
                    socket.emit('error', {
                        message: 'Authentication required',
                    })
                    return
                }

                const id = parseInt(ticketId, 10)
                if (isNaN(id)) {
                    socket.emit('error', { message: 'Invalid ticket ID' })
                    return
                }

                const db = getDb()
                const [ticket] = await db
                    .select({
                        userId: tickets.userId,
                        assignedToId: tickets.assignedToId,
                    })
                    .from(tickets)
                    .where(eq(tickets.id, id))
                    .limit(1)

                if (!ticket) {
                    socket.emit('error', { message: 'Ticket not found' })
                    return
                }

                const [user] = await db
                    .select({ role: users.role })
                    .from(users)
                    .where(eq(users.id, userId))
                    .limit(1)

                const isStaff =
                    user?.role === UserRole.ADMIN ||
                    user?.role === UserRole.STAFF
                const isOwner = ticket.userId === userId
                const isAssignee = ticket.assignedToId === userId

                if (!isOwner && !isStaff && !isAssignee) {
                    socket.emit('error', {
                        message: 'Not authorized to subscribe to this ticket',
                    })
                    return
                }

                socket.join(`ticket:${ticketId}`)
                logger.info(
                    `Client ${socket.id} subscribed to ticket ${ticketId}`,
                    { source: 'WebSocket' }
                )
            } catch (err) {
                logger.error(`WebSocket ticket:subscribe error - ${err}`)
                socket.emit('error', { message: 'Subscription failed' })
            }
        })

        socket.on('ticket:unsubscribe', (ticketId: string) => {
            socket.leave(`ticket:${ticketId}`)
            logger.info(
                `Client ${socket.id} unsubscribed from ticket ${ticketId}`,
                { source: 'WebSocket' }
            )
        })

        socket.on('disconnect', () => {
            logger.info(`Client disconnected: ${socket.id}`, {
                source: 'WebSocket',
            })
        })
    })

    logger.info('WebSocket server initialized', { source: 'WebSocket' })
}

export async function emitTicketUpdate(ticketId: string, update: unknown) {
    const io = (await import('../app')).io
    io.to(`ticket:${ticketId}`).emit('ticket:update', update)
}

export async function emitNewMessage(ticketId: string, message: unknown) {
    const io = (await import('../app')).io
    io.to(`ticket:${ticketId}`).emit('ticket:new-message', {
        ticketId,
        message,
    })
}
