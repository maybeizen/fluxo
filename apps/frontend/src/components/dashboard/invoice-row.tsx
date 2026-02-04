'use client'

import React from 'react'
import { Invoice } from '@fluxo/types'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import { InvoiceStatusBadge } from '@/utils/status-badges'
import FormattedDate from '@/components/ui/formatted-date'
import FormattedPrice from '@/components/ui/formatted-price'
import { downloadInvoicePDF } from '@/lib/client/invoices'
import { useNotifications } from '@/context/notification-context'

interface InvoiceRowProps {
    invoice: Invoice
}

export default function InvoiceRow({ invoice }: InvoiceRowProps) {
    const router = useRouter()
    const notifications = useNotifications()

    const handleView = () => {
        router.push(`/client/invoices/${invoice.uuid}`)
    }

    const handleDownloadPDF = async () => {
        try {
            await downloadInvoicePDF(invoice.uuid)
            notifications.success('Invoice PDF downloaded')
        } catch (error) {
            console.error('Failed to download PDF:', error)
            notifications.error('Failed to download invoice PDF')
        }
    }

    return (
        <tr className="border-b border-zinc-900 transition-colors hover:bg-zinc-900/50">
            <td className="px-4 py-3">
                <div className="font-mono text-xs text-zinc-400">
                    {invoice.uuid.substring(0, 8)}...
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
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleView}
                        className="px-3"
                        title="View"
                    >
                        <i className="fas fa-eye"></i>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownloadPDF}
                        className="px-3"
                        title="Download PDF"
                    >
                        <i className="fas fa-download"></i>
                    </Button>
                </div>
            </td>
        </tr>
    )
}
