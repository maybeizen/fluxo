'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Invoice, InvoiceStatus } from '@fluxo/types'
import { fetchMyInvoices, downloadInvoicePDF } from '@/lib/client/invoices'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import SelectMenu from '@/components/ui/input/select-menu'
import { useNotifications } from '@/context/notification-context'
import Pagination from '@/components/admin/pagination'
import LoadingState from '@/components/ui/loading-state'
import EmptyState from '@/components/ui/empty-state'
import { InvoiceStatusBadge } from '@/utils/status-badges'
import FormattedDate from '@/components/ui/formatted-date'
import FormattedPrice from '@/components/ui/formatted-price'
import PageHeader from '@/components/client/page-header'
import Card from '@/components/ui/card'

export default function ClientInvoicesPage() {
    const router = useRouter()
    const notifications = useNotifications()
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [statusFilter, setStatusFilter] = useState<string>('')

    const itemsPerPage = 10

    useEffect(() => {
        let cancelled = false

        const loadInvoices = async () => {
            setIsLoading(true)
            try {
                const response = await fetchMyInvoices({
                    page: currentPage,
                    limit: itemsPerPage,
                    status: statusFilter as InvoiceStatus | undefined,
                })

                if (!cancelled) {
                    setInvoices(response.invoices)
                    setTotal(response.total)
                    setTotalPages(response.totalPages)
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('Failed to load invoices:', error)
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        loadInvoices()

        return () => {
            cancelled = true
        }
    }, [currentPage, statusFilter])

    const handleView = (invoiceId: string) => {
        router.push(`/client/invoices/${invoiceId}`)
    }

    const handleDownloadPDF = async (invoiceId: string) => {
        try {
            await downloadInvoicePDF(invoiceId)
            notifications.success('Invoice PDF downloaded')
        } catch (error) {
            console.error('Failed to download PDF:', error)
            notifications.error('Failed to download invoice PDF')
        }
    }

    return (
        <div className="min-h-screen bg-black p-4 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <PageHeader
                    title="Your Invoices"
                    description="View and manage your invoices"
                />

                <div className="mb-6 flex flex-wrap gap-4">
                    <div className="min-w-[200px] flex-1">
                        <SelectMenu
                            id="status"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                            options={[
                                { value: '', label: 'All Statuses' },
                                {
                                    value: InvoiceStatus.PENDING,
                                    label: 'Pending',
                                },
                                { value: InvoiceStatus.PAID, label: 'Paid' },
                                {
                                    value: InvoiceStatus.EXPIRED,
                                    label: 'Expired',
                                },
                            ]}
                        />
                    </div>
                </div>

                <Card padding="lg">
                    {isLoading ? (
                        <LoadingState size="lg" />
                    ) : invoices.length === 0 ? (
                        <EmptyState
                            icon="fas fa-file-invoice-dollar"
                            title="No Invoices Found"
                            description={
                                statusFilter
                                    ? 'No invoices match your current filter. Try selecting a different status.'
                                    : "You don't have any invoices yet."
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-800">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                            Invoice ID
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                            Items
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                            Due Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                            Created
                                        </th>
                                        <th className="w-40 px-4 py-3 text-right text-sm font-medium text-zinc-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((invoice) => (
                                        <tr
                                            key={invoice.uuid}
                                            className="border-b border-zinc-900 transition-colors hover:bg-zinc-900/50"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-mono text-xs text-zinc-400">
                                                    {invoice.uuid.substring(
                                                        0,
                                                        8
                                                    )}
                                                    ...
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-zinc-400">
                                                    {invoice.items.length} item
                                                    {invoice.items.length !== 1
                                                        ? 's'
                                                        : ''}
                                                </div>
                                                <div className="mt-1 w-full truncate text-xs text-zinc-500">
                                                    {invoice.items[0]?.name ||
                                                        'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <FormattedPrice
                                                    value={invoice.amount}
                                                    currency={invoice.currency}
                                                    variant="amount"
                                                    className="text-sm font-medium text-white"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <InvoiceStatusBadge
                                                    status={invoice.status}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <FormattedDate
                                                    date={
                                                        invoice.timestamps
                                                            .expiresAt
                                                    }
                                                    variant="short"
                                                    className="text-sm text-zinc-400"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <FormattedDate
                                                    date={
                                                        invoice.timestamps
                                                            .createdAt
                                                    }
                                                    variant="short"
                                                    className="text-sm text-zinc-400"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleView(
                                                                invoice.uuid
                                                            )
                                                        }
                                                        className="px-3"
                                                        title="View"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDownloadPDF(
                                                                invoice.uuid
                                                            )
                                                        }
                                                        className="px-3"
                                                        title="Download PDF"
                                                    >
                                                        <i className="fas fa-download"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
