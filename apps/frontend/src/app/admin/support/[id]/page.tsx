'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TicketStatus, TicketMessage, TicketType } from '@fluxo/types'
import { fetchTicketById, updateTicket, addMessage } from '@/lib/admin/tickets'
import { TicketWithMessages } from '@/lib/client/tickets'
import { useAuth } from '@/context/auth-context'
import { useNotifications } from '@/context/notification-context'
import { useTicketWebSocket } from '@/hooks/use-ticket-websocket'
import TicketReplyBox from '@/components/client/tickets/ticket-reply-box'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import TicketHeader from '@/components/admin/support/ticket-header'
import TicketContent from '@/components/admin/support/ticket-content'
import TicketMessages from '@/components/admin/support/ticket-messages'
import { UserRole, UserProfile } from '@fluxo/types'

interface TicketMessageAuthor {
    uuid: string
    email: string
    profile?: UserProfile
    role?: UserRole
}

export default function AdminTicketDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const notifications = useNotifications()
    const ticketId = params.id as string

    const [ticket, setTicket] = useState<TicketWithMessages | null>(null)
    const [messages, setMessages] = useState<
        (TicketMessage & { author?: TicketMessageAuthor })[]
    >([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [status, setStatus] = useState<TicketStatus>(TicketStatus.OPEN)
    const [type, setType] = useState<TicketType>(TicketType.GENERAL)

    const loadTicket = async () => {
        setIsLoading(true)
        try {
            const data = await fetchTicketById(ticketId)
            setTicket(data)
            setMessages(data.messages || [])
            setStatus(data.status)
            setType(data.type)
        } catch (error) {
            console.error('Failed to load ticket:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (ticketId) {
            loadTicket()
        }
    }, [ticketId])

    useTicketWebSocket({
        ticketId,
        enabled: !!ticketId,
        onNewMessage: (message) => {
            setMessages((prev) => {
                const exists = prev.some((m) => m.uuid === message.uuid)
                if (exists) return prev
                return [...prev, message]
            })
        },
        onTicketUpdate: (update) => {
            if (update.ticket) {
                setTicket((prev: TicketWithMessages | null) =>
                    prev ? { ...prev, ...update.ticket } : null
                )
                if (update.ticket.status) setStatus(update.ticket.status)
            }
        },
    })

    const handleReply = async (content: string) => {
        if (!ticketId) return
        try {
            const response = await addMessage(ticketId, content)
            setMessages((prev) => {
                const exists = prev.some(
                    (m) => m.uuid === response.ticketMessage.uuid
                )
                if (exists) return prev
                return [
                    ...prev,
                    {
                        ...response.ticketMessage,
                        author: user
                            ? {
                                  uuid: user.uuid,
                                  email: user.email,
                                  profile: user.profile,
                                  role: user.role,
                              }
                            : undefined,
                    },
                ]
            })
        } catch (error) {
            throw error
        }
    }

    const handleStatusUpdate = async () => {
        if (!ticketId || !ticket) return
        setIsUpdating(true)
        try {
            const updated = await updateTicket(ticketId, { status, type })
            setTicket((prev: TicketWithMessages | null) =>
                prev ? { ...prev, ...updated } : null
            )
            notifications.success('Ticket updated successfully')
        } catch (error: unknown) {
            const message =
                error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data
                          ?.message
                    : undefined
            notifications.error(message || 'Failed to update ticket')
        } finally {
            setIsUpdating(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <Spinner />
            </div>
        )
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-black p-4 lg:p-8">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-8 text-center">
                        <h2 className="mb-2 text-xl font-semibold text-white">
                            Ticket Not Found
                        </h2>
                        <p className="mb-4 text-zinc-400">
                            The ticket you&apos;re looking for doesn&apos;t
                            exist.
                        </p>
                        <Button
                            variant="secondary"
                            onClick={() => router.push('/admin/support')}
                        >
                            Back to Support
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const isOwnMessage = (message: TicketMessage) => {
        return message.authorId === user?.uuid
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-4">
                    <Button
                        variant="secondary"
                        icon="fas fa-arrow-left"
                        onClick={() => router.push('/admin/support')}
                        size="sm"
                    >
                        Back to Support
                    </Button>
                </div>

                <TicketHeader
                    ticket={ticket}
                    status={status}
                    type={type}
                    isUpdating={isUpdating}
                    onStatusChange={setStatus}
                    onTypeChange={setType}
                    onUpdate={handleStatusUpdate}
                />

                <TicketContent content={ticket.content} />

                <TicketMessages
                    messages={messages}
                    isOwnMessage={isOwnMessage}
                />

                {status === TicketStatus.OPEN && (
                    <TicketReplyBox
                        ticketId={ticketId}
                        onReply={handleReply}
                        isAdmin={true}
                    />
                )}

                {status === TicketStatus.CLOSED && (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-center text-sm text-zinc-400">
                        <i className="fas fa-lock mr-2"></i>
                        This ticket is closed.
                    </div>
                )}
            </div>
        </div>
    )
}
