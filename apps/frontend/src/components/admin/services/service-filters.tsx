'use client'

import React from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import SelectMenu from '@/components/ui/input/select-menu'
import { ServiceStatus } from '@fluxo/types'

export interface ServiceFilters {
    search: string
    status: string
}

interface ServiceFiltersProps {
    filters: ServiceFilters
    onFilterChange: (filters: ServiceFilters) => void
    className?: string
}

export default function ServiceFiltersComponent({
    filters,
    onFilterChange,
    className = '',
}: ServiceFiltersProps) {
    const handleSearchChange = (value: string) => {
        onFilterChange({ ...filters, search: value })
    }

    const handleStatusChange = (value: string) => {
        onFilterChange({ ...filters, status: value })
    }

    return (
        <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${className}`}>
            <div>
                <InputLabel htmlFor="search">Search</InputLabel>
                <Input
                    id="search"
                    type="text"
                    placeholder="Search by service name, product, or external ID..."
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
                        { value: ServiceStatus.ACTIVE, label: 'Active' },
                        { value: ServiceStatus.SUSPENDED, label: 'Suspended' },
                        { value: ServiceStatus.CANCELLED, label: 'Cancelled' },
                    ]}
                />
            </div>
        </div>
    )
}
