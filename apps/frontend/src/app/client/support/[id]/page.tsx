'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TicketStatus, TicketMessage } from '@fluxo/types'
import {
    fetchTicketById,
    addMessage,
    TicketWithMessages,
} from '@/lib/client/tickets'
import { useAuth } from '@/context/auth-context'
import { useTicketWebSocket } from '@/hooks/use-ticket-websocket'
import TicketMessageComponent from '@/components/client/tickets/ticket-message'
import TicketReplyBox from '@/components/client/tickets/ticket-reply-box'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import dynamic from 'next/dynamic'
import remarkGfm from 'remark-gfm'
import { UserRole, UserProfile } from '@fluxo/types'

const ReactMarkdown = dynamic(() => import('react-markdown'), {
    ssr: false,
})

interface TicketMessageAuthor {
    uuid: string
    email: string
    profile?: UserProfile
    role?: UserRole
}

export default function TicketDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const ticketId = params.id as string

    const [ticket, setTicket] = useState<TicketWithMessages | null>(null)
    const [messages, setMessages] = useState<
        (TicketMessage & { author?: TicketMessageAuthor })[]
    >([])
    const [isLoading, setIsLoading] = useState(true)
    const messagesContainerRef = useRef<HTMLDivElement>(null)

    const loadTicket = async () => {
        setIsLoading(true)
        try {
            const data = await fetchTicketById(ticketId)
            setTicket(data)
            setMessages(data.messages || [])
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

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current
            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight
            })
            setTimeout(() => {
                container.scrollTop = container.scrollHeight
            }, 50)
        }
    }

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
                setTicket((prev) =>
                    prev ? { ...prev, ...update.ticket } : null
                )
            }
        },
    })

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                scrollToBottom()
            }, 0)
        }
    }, [messages])

    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            setTimeout(() => {
                scrollToBottom()
            }, 100)
        }
    }, [isLoading])

    const handleReply = async (content: string) => {
        if (!ticketId) return
        try {
            const newMessage = await addMessage(ticketId, { content })
            setMessages((prev) => {
                const exists = prev.some((m) => m.uuid === newMessage.uuid)
                if (exists) return prev
                return [
                    ...prev,
                    {
                        ...newMessage,
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
            setTimeout(() => {
                scrollToBottom()
            }, 100)
        } catch (error) {
            throw error
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
                            onClick={() => router.push('/client/support')}
                        >
                            Back to Tickets
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const getStatusColor = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.OPEN:
                return 'bg-green-500/20 text-green-400 border-green-500/50'
            case TicketStatus.CLOSED:
                return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50'
            default:
                return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50'
        }
    }

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })
    }

    const isOwnMessage = (message: TicketMessage) => {
        return message.authorId === user?.uuid
    }

    const isTicketBanned = user?.punishment?.isTicketBanned || false

    return (
        <div className="min-h-screen bg-black p-4 lg:p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6">
                    <Button
                        variant="secondary"
                        icon="fas fa-arrow-left"
                        onClick={() => router.push('/client/support')}
                    >
                        Back to Tickets
                    </Button>
                </div>

                {isTicketBanned && (
                    <div className="border-primary-800/50 bg-primary-900/50 mb-6 rounded-lg border p-8">
                        <div className="flex items-start gap-6">
                            <div className="bg-primary-400/20 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full">
                                <i className="fas fa-ban text-primary-400 text-2xl"></i>
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-3 text-xl font-semibold text-white">
                                    Ticket Ban Notice
                                </h3>
                                <p className="mb-3 text-lg text-zinc-300">
                                    You are currently banned from creating or
                                    replying to support tickets.
                                </p>
                                {user?.punishment?.referenceId && (
                                    <div className="mb-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                                        <p className="mb-1 text-sm text-zinc-400">
                                            Reference ID:
                                        </p>
                                        <p className="font-mono text-sm break-all text-white">
                                            {user.punishment.referenceId}
                                        </p>
                                    </div>
                                )}
                                <p className="text-zinc-400">
                                    You can still view your existing tickets,
                                    but you cannot create new tickets or reply
                                    to existing ones. If you believe this is an
                                    error, please contact support directly.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-6 rounded-lg border border-zinc-900 bg-zinc-950 p-6 lg:p-8">
                    <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-white">
                                    {ticket.title}
                                </h1>
                                <span
                                    className={`rounded-md border px-3 py-1 text-sm font-medium ${getStatusColor(
                                        ticket.status
                                    )}`}
                                >
                                    {ticket.status.charAt(0).toUpperCase() +
                                        ticket.status.slice(1)}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-zinc-400">
                                <span>
                                    Created{' '}
                                    {formatDate(ticket.timestamps.createdAt)}
                                </span>
                                {ticket.timestamps.updatedAt !==
                                    ticket.timestamps.createdAt && (
                                    <span>
                                        Updated{' '}
                                        {formatDate(
                                            ticket.timestamps.updatedAt
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-invert mb-6 max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {ticket.content}
                        </ReactMarkdown>
                    </div>
                </div>

                <div className="mb-6 rounded-lg border border-zinc-900 bg-zinc-950 p-4 lg:p-6">
                    <h2 className="mb-4 px-2 text-xl font-semibold text-white">
                        Conversation
                    </h2>
                    {messages.length === 0 ? (
                        <div className="py-12 text-center text-zinc-400">
                            <i className="fas fa-comments mb-4 text-4xl text-zinc-600"></i>
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        <div
                            ref={messagesContainerRef}
                            className="custom-scrollbar max-h-[600px] space-y-1 overflow-y-auto px-2"
                        >
                            {messages.map((message) => (
                                <TicketMessageComponent
                                    key={message.uuid}
                                    message={message}
                                    isOwnMessage={isOwnMessage(message)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {ticket.status === TicketStatus.OPEN && !isTicketBanned && (
                    <TicketReplyBox ticketId={ticketId} onReply={handleReply} />
                )}

                {ticket.status === TicketStatus.OPEN && isTicketBanned && (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center text-zinc-400">
                        <i className="fas fa-ban mr-2"></i>
                        You are banned from replying to tickets.
                    </div>
                )}

                {ticket.status === TicketStatus.CLOSED && (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center text-zinc-400">
                        <i className="fas fa-lock mr-2"></i>
                        This ticket is closed. Please create a new ticket if you
                        need further assistance.
                    </div>
                )}
            </div>
        </div>
    )
}
