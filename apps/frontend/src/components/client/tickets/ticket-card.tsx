'use client'

import React from 'react'
import { Ticket } from '@fluxo/types'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import { TicketStatusBadge } from '@/utils/status-badges'
import FormattedDate from '@/components/ui/formatted-date'

interface TicketCardProps {
    ticket: Ticket
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'general':
            return 'fas fa-question-circle'
        case 'account':
            return 'fas fa-user-cog'
        case 'billing':
            return 'fas fa-credit-card'
        case 'legal':
            return 'fas fa-gavel'
        default:
            return 'fas fa-ticket-alt'
    }
}

export default function TicketCard({ ticket }: TicketCardProps) {
    const router = useRouter()

    return (
        <div
            className="cursor-pointer rounded-lg border border-zinc-900 bg-zinc-950 p-6 transition-colors hover:border-zinc-800"
            onClick={() => router.push(`/client/support/${ticket.uuid}`)}
        >
            <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                        <i
                            className={`${getTypeIcon(ticket.type)} text-primary-400`}
                        ></i>
                        <h3 className="text-lg font-semibold text-white">
                            {ticket.title}
                        </h3>
                    </div>
                    <p className="line-clamp-2 text-sm text-zinc-400">
                        {ticket.content}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <TicketStatusBadge status={ticket.status} size="sm" />
                    <FormattedDate
                        date={ticket.timestamps.createdAt}
                        variant="datetime"
                        className="text-xs text-zinc-500"
                    />
                </div>
                <Button variant="ghost" size="sm" icon="fas fa-arrow-right">
                    View
                </Button>
            </div>
        </div>
    )
}
