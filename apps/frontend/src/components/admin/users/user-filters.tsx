'use client'

import React from 'react'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import SelectMenu from '@/components/ui/input/select-menu'
import { UserRole } from '@fluxo/types'

export interface UserFilters {
    search: string
    role: string
    verified: string
}

interface UserFiltersProps {
    filters: UserFilters
    onFilterChange: (filters: UserFilters) => void
    className?: string
}

export default function UserFiltersComponent({
    filters,
    onFilterChange,
    className = '',
}: UserFiltersProps) {
    const handleSearchChange = (value: string) => {
        onFilterChange({ ...filters, search: value })
    }

    const handleRoleChange = (value: string) => {
        onFilterChange({ ...filters, role: value })
    }

    const handleVerifiedChange = (value: string) => {
        onFilterChange({ ...filters, verified: value })
    }

    return (
        <div className={`grid grid-cols-1 gap-4 md:grid-cols-3 ${className}`}>
            <div>
                <InputLabel htmlFor="search">Search</InputLabel>
                <Input
                    id="search"
                    type="text"
                    placeholder="Search by name, email, or username..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>

            <div>
                <InputLabel htmlFor="role">Role</InputLabel>
                <SelectMenu
                    id="role"
                    value={filters.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    options={[
                        { value: '', label: 'All Roles' },
                        { value: UserRole.ADMIN, label: 'Admin' },
                        { value: UserRole.STAFF, label: 'Staff' },
                        { value: UserRole.CLIENT, label: 'Client' },
                        { value: UserRole.USER, label: 'User' },
                    ]}
                />
            </div>

            <div>
                <InputLabel htmlFor="verified">Verification Status</InputLabel>
                <SelectMenu
                    id="verified"
                    value={filters.verified}
                    onChange={(e) => handleVerifiedChange(e.target.value)}
                    options={[
                        { value: '', label: 'All Statuses' },
                        { value: 'true', label: 'Verified' },
                        { value: 'false', label: 'Unverified' },
                    ]}
                />
            </div>
        </div>
    )
}
