'use client'

import React from 'react'
import { Invoice, InvoiceStatus, PaymentProvider } from '@fluxo/types'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { useNotifications } from '@/context/notification-context'
import { downloadInvoicePDF } from '@/lib/admin/invoices'
import { InvoiceStatusBadge, PaymentProviderBadge } from '@/utils/status-badges'
import FormattedDate from '@/components/ui/formatted-date'
import FormattedPrice from '@/components/ui/formatted-price'

export interface InvoiceOwner {
    uuid: string
    username: string | null
    email: string
    name: string | null
}

export interface InvoiceWithOwner extends Invoice {
    owner: InvoiceOwner | null
}

interface InvoiceTableProps {
    invoices: InvoiceWithOwner[]
    isLoading?: boolean
    onEdit?: (invoiceId: string) => void
    onDelete?: (invoiceId: string) => void
    onView?: (invoiceId: string) => void
    className?: string
}

export default function InvoiceTable({
    invoices,
    isLoading = false,
    onEdit,
    onDelete,
    onView,
    className = '',
}: InvoiceTableProps) {
    const notifications = useNotifications()

    const handleCopyId = async (invoiceId: string) => {
        try {
            await navigator.clipboard.writeText(invoiceId)
            notifications.success('Invoice ID copied to clipboard')
        } catch (error) {
            console.error('Failed to copy ID:', error)
            notifications.error('Failed to copy ID')
        }
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
            </div>
        )
    }

    if (invoices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                    <i className="fas fa-file-invoice text-2xl text-zinc-600"></i>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                    No Invoices Found
                </h3>
                <p className="max-w-md text-sm text-zinc-400">
                    No invoices match your current filters. Try adjusting your
                    search criteria.
                </p>
            </div>
        )
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-zinc-800">
                        <th className="w-24 px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            User
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
                    {invoices.map((invoice, index) => (
                        <tr
                            key={invoice.uuid || `invoice-${index}`}
                            className="border-b border-zinc-900 transition-colors hover:bg-zinc-900/50"
                        >
                            <td className="px-4 py-3">
                                <div
                                    className="group flex w-fit cursor-pointer items-center gap-2 transition-colors hover:text-white"
                                    onClick={() => handleCopyId(invoice.uuid)}
                                    title="Click to copy ID"
                                >
                                    <span className="font-mono text-xs text-zinc-400 group-hover:text-white">
                                        {invoice.uuid}
                                    </span>
                                    <i className="fas fa-copy flex-shrink-0 text-xs text-zinc-600 group-hover:text-zinc-400"></i>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex flex-col">
                                    <div className="text-sm font-medium text-white">
                                        {invoice.owner?.username ||
                                            invoice.owner?.name ||
                                            'Unknown User'}
                                    </div>
                                    {invoice.owner?.email && (
                                        <div className="max-w-[150px] truncate text-xs text-zinc-500">
                                            {invoice.owner.email}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="text-sm text-zinc-400">
                                    {invoice.items.length} item
                                    {invoice.items.length !== 1 ? 's' : ''}
                                </div>
                                <div className="mt-1 max-w-[200px] truncate text-xs text-zinc-500">
                                    {invoice.items[0]?.name || 'N/A'}
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
                                <InvoiceStatusBadge status={invoice.status} />
                            </td>
                            <td className="px-4 py-3">
                                <FormattedDate
                                    date={invoice.timestamps.expiresAt}
                                    variant="short"
                                    className="text-sm text-zinc-400"
                                />
                            </td>
                            <td className="px-4 py-3">
                                <FormattedDate
                                    date={invoice.timestamps.createdAt}
                                    variant="short"
                                    className="text-sm text-zinc-400"
                                />
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                    {onView && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onView(invoice.uuid)}
                                            className="px-3"
                                            title="View"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleDownloadPDF(invoice.uuid)
                                        }
                                        className="px-3"
                                        title="Download PDF"
                                    >
                                        <i className="fas fa-download"></i>
                                    </Button>
                                    {onEdit && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(invoice.uuid)}
                                            className="px-3"
                                            title="Edit"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button
                                            variant="fail"
                                            size="sm"
                                            onClick={() =>
                                                onDelete(invoice.uuid)
                                            }
                                            className="px-3"
                                            title="Delete"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
