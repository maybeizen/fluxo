'use client'

import React from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'

export interface ConfigurableOptionFilters {
    search: string
    pluginId: string
}

interface ConfigurableOptionFiltersProps {
    filters: ConfigurableOptionFilters
    onFilterChange: (filters: ConfigurableOptionFilters) => void
    pluginOptions: { value: string; label: string }[]
    className?: string
}

export default function ConfigurableOptionFiltersComponent({
    filters,
    onFilterChange,
    pluginOptions,
    className = '',
}: ConfigurableOptionFiltersProps) {
    const handleSearchChange = (value: string) => {
        onFilterChange({ ...filters, search: value })
    }

    const handlePluginChange = (value: string) => {
        onFilterChange({ ...filters, pluginId: value })
    }

    return (
        <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${className}`}>
            <div>
                <InputLabel htmlFor="search">Search</InputLabel>
                <Input
                    id="search"
                    type="text"
                    placeholder="Search by field key or label..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>
            <div>
                <InputLabel htmlFor="pluginId">Plugin</InputLabel>
                <select
                    id="pluginId"
                    value={filters.pluginId}
                    onChange={(e) => handlePluginChange(e.target.value)}
                    className="focus:border-primary-300 focus:ring-primary-300/20 mt-1 block w-full rounded-md border border-zinc-800 bg-neutral-900/50 px-3 py-2 text-sm text-white placeholder-zinc-400 focus:ring-2 focus:outline-none"
                >
                    <option value="">All plugins</option>
                    {pluginOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}
