'use client'

import React from 'react'
import Spinner from '@/components/ui/spinner'
import EmptyState from '@/components/ui/empty-state'

export interface DataTableColumn<T> {
    key: string
    header: string
    headerClassName?: string
    cellClassName?: string
    render: (item: T, index: number) => React.ReactNode
}

interface DataTableProps<T> {
    columns: DataTableColumn<T>[]
    data: T[]
    isLoading?: boolean
    empty?: {
        icon?: string
        title: string
        description?: string
    }
    getRowKey: (item: T, index: number) => string
    className?: string
}

export default function DataTable<T>({
    columns,
    data,
    isLoading = false,
    empty,
    getRowKey,
    className = '',
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
            </div>
        )
    }

    if (data.length === 0 && empty) {
        return (
            <EmptyState
                icon={empty.icon ?? 'fas fa-inbox'}
                title={empty.title}
                description={empty.description ?? ''}
            />
        )
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full">
                <thead>
                    <tr className="border-border border-b">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`text-muted px-4 py-3 text-left text-sm font-medium ${col.headerClassName ?? ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr
                            key={getRowKey(item, index)}
                            className="border-border/60 hover:bg-surface/80 border-b transition-colors"
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className={`px-4 py-3 ${col.cellClassName ?? ''}`}
                                >
                                    {col.render(item, index)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
