import { Server as SocketIOServer, Socket } from 'socket.io'
import { logger } from './logger'

export function setupWebSocket(io: SocketIOServer) {
    io.on('connection', (socket: Socket) => {
        logger.info(`Client connected: ${socket.id}`, { source: 'WebSocket' })

        socket.on('ticket:subscribe', async (ticketId: string) => {
            socket.join(`ticket:${ticketId}`)
            logger.info(
                `Client ${socket.id} subscribed to ticket ${ticketId}`,
                {
                    source: 'WebSocket',
                }
            )
        })

        socket.on('ticket:unsubscribe', (ticketId: string) => {
            socket.leave(`ticket:${ticketId}`)
            logger.info(
                `Client ${socket.id} unsubscribed from ticket ${ticketId}`,
                {
                    source: 'WebSocket',
                }
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

export async function emitTicketUpdate(ticketId: string, update: any) {
    const io = (await import('../app')).io
    io.to(`ticket:${ticketId}`).emit('ticket:update', update)
}

export async function emitNewMessage(ticketId: string, message: any) {
    const io = (await import('../app')).io
    io.to(`ticket:${ticketId}`).emit('ticket:new-message', {
        ticketId,
        message,
    })
}
