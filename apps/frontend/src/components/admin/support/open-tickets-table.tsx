'use client'

import React from 'react'
import { Ticket, TicketType, UserProfile } from '@fluxo/types'
import Button from '@/components/ui/button'
import Link from 'next/link'
import { useNotifications } from '@/context/notification-context'

interface TicketUser {
    uuid: string
    email: string
    profile?: UserProfile
}

interface TicketWithUser extends Ticket {
    user?: TicketUser
}

interface OpenTicketsTableProps {
    tickets: Ticket[]
}

export default function OpenTicketsTable({ tickets }: OpenTicketsTableProps) {
    const notifications = useNotifications()

    const getTypeIcon = (type: TicketType) => {
        switch (type) {
            case TicketType.GENERAL:
                return 'fas fa-question-circle'
            case TicketType.TECHNICAL:
                return 'fas fa-user-cog'
            case TicketType.BILLING:
                return 'fas fa-credit-card'
            case TicketType.LEGAL:
                return 'fas fa-gavel'
            default:
                return 'fas fa-ticket-alt'
        }
    }

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    if (tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                    <i className="fas fa-ticket-alt text-2xl text-zinc-600"></i>
                </div>
                <h3 className="mb-1 text-lg font-semibold text-white">
                    No Open Tickets
                </h3>
                <p className="text-sm text-zinc-400">
                    No open tickets match your current filters.
                </p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-zinc-800">
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400">
                            ID
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400">
                            Title
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400">
                            User
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400">
                            Type
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400">
                            Created
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-zinc-400">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map((ticket) => {
                        const ticketWithUser = ticket as TicketWithUser
                        const ticketUser = ticketWithUser.user

                        return (
                            <tr
                                key={ticket.uuid}
                                className="border-b border-zinc-900 transition-colors hover:bg-zinc-900/50"
                            >
                                <td className="px-3 py-2.5">
                                    <div
                                        className="cursor-pointer font-mono text-xs text-zinc-400 transition-colors hover:text-white"
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(
                                                    ticket.uuid
                                                )
                                                notifications.success(
                                                    'Ticket ID copied to clipboard'
                                                )
                                            } catch (error) {
                                                console.error(
                                                    'Failed to copy ID:',
                                                    error
                                                )
                                            }
                                        }}
                                        title="Click to copy"
                                    >
                                        {ticket.uuid}
                                    </div>
                                </td>
                                <td className="px-3 py-2.5">
                                    <div className="flex items-center gap-2">
                                        <i
                                            className={`${getTypeIcon(ticket.type)} text-primary-300 text-xs`}
                                        ></i>
                                        <span className="line-clamp-1 text-sm font-medium text-white">
                                            {ticket.title}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-3 py-2.5">
                                    <span className="text-sm text-zinc-400">
                                        {ticketUser?.profile?.username ||
                                            ticketUser?.email ||
                                            'Unknown User'}
                                    </span>
                                </td>
                                <td className="px-3 py-2.5">
                                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300 capitalize">
                                        {ticket.type}
                                    </span>
                                </td>
                                <td className="px-3 py-2.5">
                                    <span className="text-xs text-zinc-400">
                                        {formatDate(
                                            ticket.timestamps.createdAt
                                        )}
                                    </span>
                                </td>
                                <td className="px-3 py-2.5">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/support/${ticket.uuid}`}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="px-2"
                                            >
                                                <i className="fas fa-eye text-xs"></i>
                                            </Button>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
