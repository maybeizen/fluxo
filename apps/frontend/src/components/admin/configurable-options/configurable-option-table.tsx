'use client'

import React from 'react'
import type { ConfigurableOption } from '@fluxo/types'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'

interface ConfigurableOptionTableProps {
    options: ConfigurableOption[]
    isLoading?: boolean
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
    className?: string
}

export default function ConfigurableOptionTable({
    options,
    isLoading = false,
    onEdit,
    onDelete,
    className = '',
}: ConfigurableOptionTableProps) {
    const scopeSummary = (opt: ConfigurableOption) => {
        const scopes = opt.scopes ?? []
        if (scopes.length === 0) return 'None'
        const withProduct = scopes.filter((s) => s.productId != null).length
        const global = scopes.filter((s) => s.productId == null).length
        const parts = []
        if (global) parts.push('All products')
        if (withProduct) parts.push(`${withProduct} product(s)`)
        return parts.join(', ') || 'None'
    }

    const pricingSummary = (opt: ConfigurableOption) => {
        const p = opt.pricing
        if (!p) return '—'
        const amount = (p.amount / 100).toFixed(2)
        return `$${amount} (${p.pricingType})${p.useValueAsMultiplier ? ' × value' : ''}`
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
            </div>
        )
    }

    if (options.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                    <i className="fas fa-sliders text-2xl text-zinc-600"></i>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                    No configurable options
                </h3>
                <p className="max-w-md text-sm text-zinc-400">
                    No options match your filters. Create one to let customers
                    customize products.
                </p>
            </div>
        )
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-zinc-800">
                        <th className="w-16 px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Plugin
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Field
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Label
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Scopes
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Pricing
                        </th>
                        <th className="w-32 px-4 py-3 text-right text-sm font-medium text-zinc-400">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {options.map((opt) => (
                        <tr
                            key={opt.id}
                            className="border-b border-zinc-900 transition-colors hover:bg-zinc-900/50"
                        >
                            <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                                {opt.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-300">
                                {opt.pluginId}
                            </td>
                            <td className="px-4 py-3 font-mono text-sm text-white">
                                {opt.fieldKey}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-400">
                                {opt.label ?? opt.fieldKey}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-400">
                                {scopeSummary(opt)}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-400">
                                {pricingSummary(opt)}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                    {onEdit && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                onEdit(String(opt.id))
                                            }
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
                                                onDelete(String(opt.id))
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
