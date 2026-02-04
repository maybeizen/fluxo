'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Ticket, TicketStatus, TicketType } from '@fluxo/types'
import { fetchTickets } from '@/lib/client/tickets'
import { useAuth } from '@/context/auth-context'
import TicketCard from '@/components/client/tickets/ticket-card'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import SelectMenu from '@/components/ui/input/select-menu'
import PageHeader from '@/components/client/page-header'
import Card from '@/components/ui/card'
import EmptyState from '@/components/ui/empty-state'

export default function SupportPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('')
    const [typeFilter, setTypeFilter] = useState<TicketType | ''>('')

    const isTicketBanned = user?.punishment?.isTicketBanned || false

    const loadTickets = async () => {
        setIsLoading(true)
        try {
            const response = await fetchTickets({
                page: currentPage,
                limit: 10,
                status: statusFilter || undefined,
                type: (typeFilter as TicketType) || undefined,
            })
            setTickets(response.tickets)
            setTotalPages(response.pagination.totalPages)
        } catch (error) {
            console.error('Failed to load tickets:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadTickets()
    }, [currentPage, statusFilter, typeFilter])

    const openTickets = tickets.filter((t) => t.status === TicketStatus.OPEN)
    const closedTickets = tickets.filter(
        (t) => t.status === TicketStatus.CLOSED
    )

    return (
        <div className="min-h-screen bg-black p-4 lg:p-8">
            <div className="mx-auto max-w-7xl">
                {isTicketBanned && (
                    <div className="border-primary-800/50 bg-primary-900/50 mb-6 rounded-lg border p-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-primary-400/20 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
                                <i className="fas fa-ban text-primary-400 text-xl"></i>
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-2 text-lg font-semibold text-white">
                                    Ticket Ban Notice
                                </h3>
                                <p className="mb-2 text-zinc-300">
                                    You are currently banned from creating or
                                    replying to support tickets.
                                </p>
                                {user?.punishment?.referenceId && (
                                    <p className="text-sm text-zinc-400">
                                        Reference ID:{' '}
                                        <span className="font-mono">
                                            {user.punishment.referenceId}
                                        </span>
                                    </p>
                                )}
                                <p className="mt-2 text-sm text-zinc-400">
                                    If you believe this is an error, please
                                    contact support directly.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <PageHeader
                    title="Support Tickets"
                    description="View and manage your support tickets"
                    action={
                        <Button
                            variant="primary"
                            icon="fas fa-plus"
                            iconPosition="left"
                            onClick={() => router.push('/client/support/new')}
                            disabled={isTicketBanned}
                        >
                            New Ticket
                        </Button>
                    }
                />

                <div className="mb-6 flex flex-wrap gap-4">
                    <div className="min-w-[200px] flex-1">
                        <SelectMenu
                            id="status"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(
                                    e.target.value as TicketStatus | ''
                                )
                                setCurrentPage(1)
                            }}
                            options={[
                                { value: '', label: 'All Statuses' },
                                { value: TicketStatus.OPEN, label: 'Open' },
                                { value: TicketStatus.CLOSED, label: 'Closed' },
                            ]}
                        />
                    </div>
                    <div className="min-w-[200px] flex-1">
                        <SelectMenu
                            id="type"
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value as TicketType | '')
                                setCurrentPage(1)
                            }}
                            options={[
                                { value: '', label: 'All Types' },
                                { value: 'general', label: 'General' },
                                { value: 'account', label: 'Account' },
                                { value: 'billing', label: 'Billing' },
                                { value: 'legal', label: 'Legal' },
                                { value: 'other', label: 'Other' },
                            ]}
                        />
                    </div>
                </div>

                <Card padding="lg">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Spinner size="lg" />
                        </div>
                    ) : tickets.length === 0 ? (
                        <EmptyState
                            icon="fas fa-ticket-alt"
                            title="No Tickets Found"
                            description="You don't have any tickets yet. Create a new ticket to get started!"
                            action={
                                !isTicketBanned
                                    ? {
                                          label: 'Create Your First Ticket',
                                          icon: 'fas fa-plus',
                                          onClick: () =>
                                              router.push(
                                                  '/client/support/new'
                                              ),
                                      }
                                    : undefined
                            }
                        />
                    ) : (
                        <div className="space-y-6">
                            {openTickets.length > 0 && (
                                <div>
                                    <h2 className="mb-4 text-lg font-semibold text-white">
                                        Open Tickets
                                    </h2>
                                    <div className="grid grid-cols-1 gap-4">
                                        {openTickets.map((ticket) => (
                                            <TicketCard
                                                key={ticket.uuid}
                                                ticket={ticket}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {closedTickets.length > 0 && (
                                <div>
                                    <h2 className="mb-4 text-lg font-semibold text-white">
                                        Closed Tickets
                                    </h2>
                                    <div className="grid grid-cols-1 gap-4">
                                        {closedTickets.map((ticket) => (
                                            <TicketCard
                                                key={ticket.uuid}
                                                ticket={ticket}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-4">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() =>
                                            setCurrentPage((p) =>
                                                Math.max(1, p - 1)
                                            )
                                        }
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-zinc-400">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() =>
                                            setCurrentPage((p) =>
                                                Math.min(totalPages, p + 1)
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
