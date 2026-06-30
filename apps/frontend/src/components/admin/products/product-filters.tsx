'use client'

import React from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import Checkbox from '@/components/ui/input/checkbox'

export interface ProductFilters {
    search: string
    includeHidden: boolean
}

interface ProductFiltersProps {
    filters: ProductFilters
    onFilterChange: (filters: ProductFilters) => void
    className?: string
}

export default function ProductFiltersComponent({
    filters,
    onFilterChange,
    className = '',
}: ProductFiltersProps) {
    const handleSearchChange = (value: string) => {
        onFilterChange({ ...filters, search: value })
    }

    const handleIncludeHiddenChange = (checked: boolean) => {
        onFilterChange({ ...filters, includeHidden: checked })
    }

    return (
        <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${className}`}>
            <div>
                <InputLabel htmlFor="search">Search</InputLabel>
                <Input
                    id="search"
                    type="text"
                    placeholder="Search by product name..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>

            <div className="flex items-end pb-2">
                <Checkbox
                    id="includeHidden"
                    label="Include Hidden Products"
                    checked={filters.includeHidden}
                    onChange={(e) =>
                        handleIncludeHiddenChange(e.target.checked)
                    }
                />
            </div>
        </div>
    )
}
