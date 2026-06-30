'use client'

import React from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import SelectMenu from '@/components/ui/input/select-menu'
import { InvoiceStatus } from '@fluxo/types'

export interface InvoiceFilters {
    search: string
    status: string
    userId: string
}

interface InvoiceFiltersProps {
    filters: InvoiceFilters
    onFilterChange: (filters: InvoiceFilters) => void
    className?: string
}

export default function InvoiceFiltersComponent({
    filters,
    onFilterChange,
    className = '',
}: InvoiceFiltersProps) {
    const handleSearchChange = (value: string) => {
        onFilterChange({ ...filters, search: value })
    }

    const handleStatusChange = (value: string) => {
        onFilterChange({ ...filters, status: value })
    }

    const handleUserIdChange = (value: string) => {
        onFilterChange({ ...filters, userId: value })
    }

    return (
        <div className={`grid grid-cols-1 gap-4 md:grid-cols-3 ${className}`}>
            <div>
                <InputLabel htmlFor="search">Search</InputLabel>
                <Input
                    id="search"
                    type="text"
                    placeholder="Search by invoice ID, transaction ID, or item name..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>

            <div>
                <InputLabel htmlFor="status">Status</InputLabel>
                <SelectMenu
                    id="status"
                    value={filters.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    options={[
                        { value: '', label: 'All Statuses' },
                        { value: InvoiceStatus.PENDING, label: 'Pending' },
                        { value: InvoiceStatus.PAID, label: 'Paid' },
                        { value: InvoiceStatus.EXPIRED, label: 'Expired' },
                    ]}
                />
            </div>

            <div>
                <InputLabel htmlFor="userId">User ID</InputLabel>
                <Input
                    id="userId"
                    type="text"
                    placeholder="Filter by user ID..."
                    value={filters.userId}
                    onChange={(e) => handleUserIdChange(e.target.value)}
                />
            </div>
        </div>
    )
}
