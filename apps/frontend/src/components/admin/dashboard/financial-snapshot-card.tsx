'use client'

import React from 'react'
import Spinner from '@/components/ui/spinner'

interface FinancialSnapshotCardProps {
    totalRevenue: number
    monthToDate: number
    lastFourWeeks: number
    pendingInvoices: number
    isLoading: boolean
}

export default function FinancialSnapshotCard({
    totalRevenue,
    monthToDate,
    lastFourWeeks,
    pendingInvoices,
    isLoading,
}: FinancialSnapshotCardProps) {
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
                    Financial Snapshot
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                    Revenue and invoice statistics
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
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                                <i className="fas fa-dollar-sign text-lg text-emerald-500"></i>
                            </div>
                            <span className="text-sm font-medium text-zinc-400">
                                Total Revenue
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {formatCurrency(totalRevenue)}
                        </p>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                                <i className="fas fa-calendar-day text-lg text-cyan-500"></i>
                            </div>
                            <span className="text-sm font-medium text-zinc-400">
                                Month-to-Date
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {formatCurrency(monthToDate)}
                        </p>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                                <i className="fas fa-chart-line text-lg text-purple-500"></i>
                            </div>
                            <span className="text-sm font-medium text-zinc-400">
                                Last 4 Weeks
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {formatCurrency(lastFourWeeks)}
                        </p>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                                <i className="fas fa-clock text-lg text-amber-500"></i>
                            </div>
                            <span className="text-sm font-medium text-zinc-400">
                                Pending Invoices
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {pendingInvoices}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
