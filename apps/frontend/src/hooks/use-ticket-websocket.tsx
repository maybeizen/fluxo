'use client'

import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import {
    type TicketMessage,
    type Ticket,
    type UserRole,
    type UserProfile,
} from '@fluxo/types'

import { API_BASE_URL } from '@/lib/api-client'

const getSocketUrl = () => API_BASE_URL.replace('/api/v1', '')

interface TicketMessageAuthor {
    uuid: string
    email: string
    profile?: UserProfile
    role?: UserRole
}

interface TicketUpdate {
    type: string
    ticket: Partial<Ticket>
}

interface UseTicketWebSocketProps {
    ticketId: string | null
    onNewMessage?: (
        message: TicketMessage & { author?: TicketMessageAuthor }
    ) => void
    onTicketUpdate?: (update: TicketUpdate) => void
    enabled?: boolean
}

export function useTicketWebSocket({
    ticketId,
    onNewMessage,
    onTicketUpdate,
    enabled = true,
}: UseTicketWebSocketProps) {
    const socketRef = useRef<Socket | null>(null)
    const onNewMessageRef = useRef(onNewMessage)
    const onTicketUpdateRef = useRef(onTicketUpdate)

    useEffect(() => {
        onNewMessageRef.current = onNewMessage
        onTicketUpdateRef.current = onTicketUpdate
    }, [onNewMessage, onTicketUpdate])

    useEffect(() => {
        if (!enabled || !ticketId) {
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
            }
            return
        }

        const socket = io(getSocketUrl(), {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        })

        socket.on('connect', () => {
            socket.emit('ticket:subscribe', ticketId)
        })

        socket.on(
            'ticket:new-message',
            (data: {
                ticketId: string
                message: TicketMessage & { author?: TicketMessageAuthor }
            }) => {
                if (data.ticketId === ticketId && onNewMessageRef.current) {
                    onNewMessageRef.current(data.message)
                }
            }
        )

        socket.on('ticket:update', (update: TicketUpdate) => {
            if (update.ticket?.uuid === ticketId && onTicketUpdateRef.current) {
                onTicketUpdateRef.current(update)
            }
        })

        socketRef.current = socket

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('ticket:unsubscribe', ticketId)
                socketRef.current.disconnect()
                socketRef.current = null
            }
        }
    }, [ticketId, enabled])
}
