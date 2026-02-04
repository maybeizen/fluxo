'use client'

import React, { useRef, useEffect } from 'react'
import { TicketMessage, UserProfile, UserRole } from '@fluxo/types'
import TicketMessageComponent from '@/components/client/tickets/ticket-message'

interface TicketMessageAuthor {
    uuid: string
    email: string
    profile?: UserProfile
    role?: UserRole
}

interface TicketMessagesProps {
    messages: (TicketMessage & { author?: TicketMessageAuthor })[]
    isOwnMessage: (message: TicketMessage) => boolean
}

export default function TicketMessages({
    messages,
    isOwnMessage,
}: TicketMessagesProps) {
    const messagesContainerRef = useRef<HTMLDivElement>(null)

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

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                scrollToBottom()
            }, 0)
        }
    }, [messages])

    return (
        <div className="mb-4 rounded-lg border border-zinc-900 bg-zinc-950 p-4">
            <h2 className="mb-3 px-1 text-lg font-semibold text-white">
                Conversation
            </h2>
            {messages.length === 0 ? (
                <div className="py-8 text-center text-zinc-400">
                    <i className="fas fa-comments mb-3 text-3xl text-zinc-600"></i>
                    <p className="text-sm">No messages yet.</p>
                </div>
            ) : (
                <div
                    ref={messagesContainerRef}
                    className="custom-scrollbar max-h-[500px] space-y-1 overflow-y-auto px-1"
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
    )
}
