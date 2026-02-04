'use client'

import React from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import SelectMenu from '@/components/ui/input/select-menu'
import { NewsVisibility } from '@fluxo/types'

export interface NewsFilters {
    search: string
    visibility: string
    isFeatured: string
}

interface NewsFiltersProps {
    filters: NewsFilters
    onFilterChange: (filters: NewsFilters) => void
    className?: string
}

export default function NewsFiltersComponent({
    filters,
    onFilterChange,
    className = '',
}: NewsFiltersProps) {
    const handleSearchChange = (value: string) => {
        onFilterChange({ ...filters, search: value })
    }

    const handleVisibilityChange = (value: string) => {
        onFilterChange({ ...filters, visibility: value })
    }

    const handleFeaturedChange = (value: string) => {
        onFilterChange({ ...filters, isFeatured: value })
    }

    return (
        <div className={`grid grid-cols-1 gap-4 md:grid-cols-3 ${className}`}>
            <div>
                <InputLabel htmlFor="search">Search</InputLabel>
                <Input
                    id="search"
                    type="text"
                    placeholder="Search by title, summary, or content..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>

            <div>
                <InputLabel htmlFor="visibility">Visibility</InputLabel>
                <SelectMenu
                    id="visibility"
                    value={filters.visibility}
                    onChange={(e) => handleVisibilityChange(e.target.value)}
                    options={[
                        { value: '', label: 'All Visibility' },
                        { value: NewsVisibility.PUBLIC, label: 'Public' },
                        { value: NewsVisibility.DRAFT, label: 'Draft' },
                        { value: NewsVisibility.PRIVATE, label: 'Private' },
                        { value: NewsVisibility.ARCHIVED, label: 'Archived' },
                    ]}
                />
            </div>

            <div>
                <InputLabel htmlFor="featured">Featured Status</InputLabel>
                <SelectMenu
                    id="featured"
                    value={filters.isFeatured}
                    onChange={(e) => handleFeaturedChange(e.target.value)}
                    options={[
                        { value: '', label: 'All Posts' },
                        { value: 'true', label: 'Featured Only' },
                        { value: 'false', label: 'Non-Featured' },
                    ]}
                />
            </div>
        </div>
    )
}
