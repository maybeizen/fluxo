'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Invoice } from '@fluxo/types'
import { fetchInvoiceById, downloadInvoicePDF } from '@/lib/admin/invoices'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { useNotifications } from '@/context/notification-context'

export default function ViewInvoicePage() {
    const router = useRouter()
    const params = useParams()
    const notifications = useNotifications()
    const invoiceId = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [invoice, setInvoice] = useState<Invoice | null>(null)

    useEffect(() => {
        const loadInvoice = async () => {
            try {
                const data = await fetchInvoiceById(invoiceId)
                if (!data) {
                    notifications.error('Invoice not found')
                    router.push('/admin/invoices')
                    return
                }
                setInvoice(data)
            } catch (error) {
                console.error('Error loading invoice:', error)
                notifications.error('Failed to load invoice')
                router.push('/admin/invoices')
            } finally {
                setIsLoading(false)
            }
        }

        loadInvoice()
    }, [invoiceId])

    const handleDownloadPDF = async () => {
        try {
            await downloadInvoicePDF(invoiceId)
            notifications.success('Invoice PDF downloaded')
        } catch (error) {
            console.error('Failed to download PDF:', error)
            notifications.error('Failed to download invoice PDF')
        }
    }

    const formatAmount = (amount: number, currency: string = 'usd') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount / 100)
    }

    const formatDate = (date?: Date | string | null) => {
        if (!date) return 'N/A'
        const d = new Date(date)
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
                <div className="mx-auto flex max-w-4xl items-center justify-center py-20">
                    <Spinner size="xl" />
                </div>
            </div>
        )
    }

    if (!invoice) {
        return null
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">
                            Invoice Details
                        </h1>
                        <p className="text-zinc-400">
                            View invoice information
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/admin/invoices')}
                            icon="fas fa-arrow-left"
                        >
                            Back
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() =>
                                router.push(`/admin/invoices/${invoiceId}/edit`)
                            }
                            icon="fas fa-edit"
                        >
                            Edit
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleDownloadPDF}
                            icon="fas fa-download"
                        >
                            Download PDF
                        </Button>
                    </div>
                </div>

                <div className="space-y-6 rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                    <div>
                        <h2 className="mb-4 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Invoice Information
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="mb-1 text-sm text-zinc-400">
                                    Invoice ID
                                </p>
                                <p className="font-mono text-sm text-white">
                                    {invoice.uuid}
                                </p>
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-zinc-400">
                                    User ID
                                </p>
                                <p className="font-mono text-sm text-white">
                                    {invoice.userId}
                                </p>
                            </div>
                            {invoice.serviceId && (
                                <div>
                                    <p className="mb-1 text-sm text-zinc-400">
                                        Service ID
                                    </p>
                                    <p className="font-mono text-sm text-white">
                                        {invoice.serviceId}
                                    </p>
                                </div>
                            )}
                            {invoice.transactionId && (
                                <div>
                                    <p className="mb-1 text-sm text-zinc-400">
                                        Transaction ID
                                    </p>
                                    <p className="font-mono text-sm text-white">
                                        {invoice.transactionId}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="mb-1 text-sm text-zinc-400">
                                    Status
                                </p>
                                <p className="text-sm text-white capitalize">
                                    {invoice.status}
                                </p>
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-zinc-400">
                                    Payment Provider
                                </p>
                                <p className="text-sm text-white capitalize">
                                    {invoice.paymentProvider}
                                </p>
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-zinc-400">
                                    Created At
                                </p>
                                <p className="text-sm text-white">
                                    {formatDate(invoice.timestamps.createdAt)}
                                </p>
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-zinc-400">
                                    Expires At
                                </p>
                                <p className="text-sm text-white">
                                    {formatDate(invoice.timestamps.expiresAt)}
                                </p>
                            </div>
                            {invoice.timestamps.paidAt && (
                                <div>
                                    <p className="mb-1 text-sm text-zinc-400">
                                        Paid At
                                    </p>
                                    <p className="text-sm text-white">
                                        {formatDate(invoice.timestamps.paidAt)}
                                    </p>
                                </div>
                            )}
                            {invoice.timestamps.expiredAt && (
                                <div>
                                    <p className="mb-1 text-sm text-zinc-400">
                                        Expired At
                                    </p>
                                    <p className="text-sm text-white">
                                        {formatDate(
                                            invoice.timestamps.expiredAt
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-4 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Invoice Items
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-800">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                            Item
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">
                                            Quantity
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">
                                            Unit Price
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="border-b border-zinc-900"
                                        >
                                            <td className="px-4 py-3 text-white">
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-3 text-right text-zinc-400">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-right text-zinc-400">
                                                {formatAmount(
                                                    item.unitPrice,
                                                    invoice.currency
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-white">
                                                {formatAmount(
                                                    item.total,
                                                    invoice.currency
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-4 py-4 text-right text-lg font-semibold text-white"
                                        >
                                            Total:
                                        </td>
                                        <td className="px-4 py-4 text-right text-xl font-bold text-white">
                                            {formatAmount(
                                                invoice.amount,
                                                invoice.currency
                                            )}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
