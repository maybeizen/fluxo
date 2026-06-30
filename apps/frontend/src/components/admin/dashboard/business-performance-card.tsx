'use client'

import React from 'react'
import Spinner from '@/components/ui/spinner'

interface BusinessPerformanceCardProps {
    totalPaidInvoices: number
    averageCost: number
    renewalRate: number
    isLoading: boolean
}

export default function BusinessPerformanceCard({
    totalPaidInvoices,
    averageCost,
    renewalRate,
    isLoading,
}: BusinessPerformanceCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount)
    }

    return (
        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
            <div className="mb-6 border-b border-zinc-900 pb-4">
                <h2 className="text-xl font-semibold text-white">
                    Business Performance
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                    Key performance indicators
                </p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                                <i className="fas fa-file-invoice-dollar text-lg text-green-500"></i>
                            </div>
                            <span className="text-sm font-medium text-zinc-400">
                                Total Paid Invoices
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {totalPaidInvoices}
                        </p>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                                <i className="fas fa-money-bill-wave text-lg text-blue-500"></i>
                            </div>
                            <span className="text-sm font-medium text-zinc-400">
                                Average Cost
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {formatCurrency(averageCost)}
                        </p>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                                <i className="fas fa-repeat text-lg text-purple-500"></i>
                            </div>
                            <span className="text-sm font-medium text-zinc-400">
                                Renewal Rate
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {renewalRate}%
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
