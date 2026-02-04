'use client'

import React from 'react'
import { Invoice } from '@fluxo/types'
import LoadingState from '@/components/ui/loading-state'
import EmptyState from '@/components/ui/empty-state'
import InvoiceRow from './invoice-row'

interface InvoicesTabProps {
    invoices: Invoice[]
    isLoading: boolean
}

export default function InvoicesTab({ invoices, isLoading }: InvoicesTabProps) {
    if (isLoading) {
        return <LoadingState size="md" />
    }

    if (invoices.length === 0) {
        return (
            <EmptyState
                icon="fas fa-file-invoice-dollar"
                title="No Invoices"
                description="You don't have any invoices yet. Invoices will appear here once you start using our services."
                iconSize="sm"
            />
        )
    }

    return (
        <div className="overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
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
                            <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((invoice) => (
                            <InvoiceRow key={invoice.uuid} invoice={invoice} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
