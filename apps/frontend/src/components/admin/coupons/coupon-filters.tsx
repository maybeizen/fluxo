'use client'

import React from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'

export interface CouponFilters {
    search: string
}

interface CouponFiltersProps {
    filters: CouponFilters
    onFilterChange: (filters: CouponFilters) => void
    className?: string
}

export default function CouponFiltersComponent({
    filters,
    onFilterChange,
    className = '',
}: CouponFiltersProps) {
    const handleSearchChange = (value: string) => {
        onFilterChange({ ...filters, search: value })
    }

    return (
        <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${className}`}>
            <div>
                <InputLabel htmlFor="search">Search</InputLabel>
                <Input
                    id="search"
                    type="text"
                    placeholder="Search by coupon code..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>
        </div>
    )
}
