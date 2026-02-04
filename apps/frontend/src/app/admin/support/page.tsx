'use client'

import React, { useState, useEffect } from 'react'
import { Ticket, TicketStatus, TicketType } from '@fluxo/types'
import { fetchTickets } from '@/lib/admin/tickets'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import SelectMenu from '@/components/ui/input/select-menu'
import TicketTabs, {
    TicketTabType,
} from '@/components/admin/support/ticket-tabs'
import OpenTicketsTable from '@/components/admin/support/open-tickets-table'
import ClosedTicketsTable from '@/components/admin/support/closed-tickets-table'

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [activeTab, setActiveTab] = useState<TicketTabType>('open')
    const [typeFilter, setTypeFilter] = useState<TicketType | ''>('')
    const [openCount, setOpenCount] = useState(0)
    const [closedCount, setClosedCount] = useState(0)

    const loadTickets = async () => {
        setIsLoading(true)
        try {
            const status =
                activeTab === 'open' ? TicketStatus.OPEN : TicketStatus.CLOSED
            const [ticketsResponse, openResponse, closedResponse] =
                await Promise.all([
                    fetchTickets({
                        page: currentPage,
                        limit: 20,
                        status,
                        type: (typeFilter as TicketType) || undefined,
                    }),
                    fetchTickets({
                        page: 1,
                        limit: 1,
                        status: TicketStatus.OPEN,
                    }),
                    fetchTickets({
                        page: 1,
                        limit: 1,
                        status: TicketStatus.CLOSED,
                    }),
                ])

            setTickets(ticketsResponse.tickets)
            setTotalPages(ticketsResponse.pagination.totalPages)
            setOpenCount(openResponse.pagination.total)
            setClosedCount(closedResponse.pagination.total)
        } catch (error) {
            console.error('Failed to load tickets:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setCurrentPage(1)
    }, [activeTab])

    useEffect(() => {
        loadTickets()
    }, [currentPage, activeTab, typeFilter])

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="mb-1 text-3xl font-bold text-white">
                                Support Dashboard
                            </h1>
                            <p className="text-sm text-zinc-400">
                                Manage all support tickets
                            </p>
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-0.5 text-xs text-zinc-400">
                                        Open Tickets
                                    </p>
                                    <p className="text-2xl font-bold text-green-400">
                                        {openCount}
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                                    <i className="fas fa-ticket-alt text-lg text-green-400"></i>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-0.5 text-xs text-zinc-400">
                                        Closed Tickets
                                    </p>
                                    <p className="text-2xl font-bold text-zinc-400">
                                        {closedCount}
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-500/20">
                                    <i className="fas fa-check-circle text-lg text-zinc-400"></i>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-0.5 text-xs text-zinc-400">
                                        Total Tickets
                                    </p>
                                    <p className="text-2xl font-bold text-white">
                                        {openCount + closedCount}
                                    </p>
                                </div>
                                <div className="bg-primary-400/20 flex h-10 w-10 items-center justify-center rounded-full">
                                    <i className="fas fa-headset text-primary-300 text-lg"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <TicketTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    openCount={openCount}
                    closedCount={closedCount}
                />

                <div className="mb-4">
                    <div className="max-w-xs min-w-[200px] flex-1">
                        <SelectMenu
                            id="type"
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value as TicketType | '')
                                setCurrentPage(1)
                            }}
                            options={[
                                { value: '', label: 'All Types' },
                                { value: TicketType.GENERAL, label: 'General' },
                                {
                                    value: TicketType.TECHNICAL,
                                    label: 'Account',
                                },
                                { value: TicketType.BILLING, label: 'Billing' },
                                { value: TicketType.LEGAL, label: 'Legal' },
                                { value: TicketType.OTHER, label: 'Other' },
                            ]}
                        />
                    </div>
                </div>

                <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner />
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                                <i className="fas fa-ticket-alt text-2xl text-zinc-600"></i>
                            </div>
                            <h3 className="mb-1 text-lg font-semibold text-white">
                                No Tickets Found
                            </h3>
                            <p className="text-sm text-zinc-400">
                                No tickets match your current filters.
                            </p>
                        </div>
                    ) : activeTab === 'open' ? (
                        <OpenTicketsTable tickets={tickets} />
                    ) : (
                        <ClosedTicketsTable tickets={tickets} />
                    )}

                    {!isLoading && tickets.length > 0 && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
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
            </div>
        </div>
    )
}
