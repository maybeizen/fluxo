'use client'

import React from 'react'
import { TicketStatus, TicketType } from '@fluxo/types'
import { TicketWithMessages } from '@/lib/client/tickets'
import Button from '@/components/ui/button'
import InputLabel from '@/components/ui/input/input-label'
import SelectMenu from '@/components/ui/input/select-menu'

interface TicketHeaderProps {
    ticket: TicketWithMessages
    status: TicketStatus
    type: TicketType
    isUpdating: boolean
    onStatusChange: (status: TicketStatus) => void
    onTypeChange: (type: TicketType) => void
    onUpdate: () => void
}

export default function TicketHeader({
    ticket,
    status,
    type,
    isUpdating,
    onStatusChange,
    onTypeChange,
    onUpdate,
}: TicketHeaderProps) {
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
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })
    }

    return (
        <div className="mb-4 rounded-lg border border-zinc-900 bg-zinc-950 p-4">
            <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h1 className="truncate text-xl font-bold text-white">
                            {ticket.title}
                        </h1>
                        <span
                            className={`flex-shrink-0 rounded border px-2 py-0.5 text-xs font-medium ${getStatusColor(status)}`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    </div>
                    <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                        <span>
                            Created {formatDate(ticket.timestamps.createdAt)}
                        </span>
                        {ticket.timestamps.updatedAt !==
                            ticket.timestamps.createdAt && (
                            <span>
                                Updated{' '}
                                {formatDate(ticket.timestamps.updatedAt)}
                            </span>
                        )}
                        {ticket.user && (
                            <span>
                                by{' '}
                                <span className="text-white">
                                    {ticket.user.profile?.username ||
                                        ticket.user.email}
                                </span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-zinc-800 pt-3 md:grid-cols-3">
                <div>
                    <InputLabel htmlFor="status" className="mb-1 text-xs">
                        Status
                    </InputLabel>
                    <SelectMenu
                        id="status"
                        value={status}
                        onChange={(e) =>
                            onStatusChange(e.target.value as TicketStatus)
                        }
                        options={[
                            { value: TicketStatus.OPEN, label: 'Open' },
                            { value: TicketStatus.CLOSED, label: 'Closed' },
                        ]}
                    />
                </div>
                <div>
                    <InputLabel htmlFor="type" className="mb-1 text-xs">
                        Type
                    </InputLabel>
                    <SelectMenu
                        id="type"
                        value={type}
                        onChange={(e) =>
                            onTypeChange(e.target.value as TicketType)
                        }
                        options={[
                            { value: TicketType.GENERAL, label: 'General' },
                            { value: TicketType.TECHNICAL, label: 'Account' },
                            { value: TicketType.BILLING, label: 'Billing' },
                            { value: TicketType.LEGAL, label: 'Legal' },
                            { value: TicketType.OTHER, label: 'Other' },
                        ]}
                    />
                </div>
                <div className="flex items-end">
                    <Button
                        variant="primary"
                        onClick={onUpdate}
                        loading={isUpdating}
                        size="sm"
                        fullWidth
                    >
                        Update Ticket
                    </Button>
                </div>
            </div>
        </div>
    )
}
