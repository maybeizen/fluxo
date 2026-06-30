'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import ConfigurableOptionTable from '@/components/admin/configurable-options/configurable-option-table'
import ConfigurableOptionFiltersComponent, {
    type ConfigurableOptionFilters,
} from '@/components/admin/configurable-options/configurable-option-filters'
import Pagination from '@/components/admin/pagination'
import {
    fetchConfigurableOptions,
    deleteConfigurableOption,
} from '@/lib/admin/configurable-options'
import { fetchAdminPlugins } from '@/lib/admin/plugins'
import type { ConfigurableOption } from '@fluxo/types'
import { useNotifications } from '@/context/notification-context'

export default function AdminConfigurableOptionsPage() {
    const router = useRouter()
    const notifications = useNotifications()
    const [options, setOptions] = useState<ConfigurableOption[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [filters, setFilters] = useState<ConfigurableOptionFilters>({
        search: '',
        pluginId: '',
    })
    const [pluginOptions, setPluginOptions] = useState<
        { value: string; label: string }[]
    >([])

    const itemsPerPage = 10

    useEffect(() => {
        let cancelled = false
        fetchAdminPlugins()
            .then((plugins) => {
                if (cancelled) return
                const service = plugins.filter((p) => p.type === 'service')
                setPluginOptions(
                    service.map((p) => ({ value: p.id, label: p.name }))
                )
            })
            .catch(() => {})
        return () => {
            cancelled = true
        }
    }, [])

    const loadOptions = useCallback(async () => {
        setIsLoading(true)
        const response = await fetchConfigurableOptions({
            page: currentPage,
            limit: itemsPerPage,
            search: filters.search || undefined,
            pluginId: filters.pluginId || undefined,
        })
        setOptions(response.configurableOptions)
        setTotal(response.total)
        setTotalPages(response.totalPages)
        setIsLoading(false)
    }, [currentPage, filters])

    useEffect(() => {
        loadOptions()
    }, [loadOptions])

    const handleFilterChange = (newFilters: ConfigurableOptionFilters) => {
        setFilters(newFilters)
        setCurrentPage(1)
    }

    const handleEdit = (id: string) => {
        router.push(`/admin/configurable-options/${id}/edit`)
    }

    const handleDelete = async (id: string) => {
        if (
            !confirm(
                'Are you sure you want to delete this configurable option? This will remove all scopes, pricing, and user selections.'
            )
        ) {
            return
        }
        const result = await deleteConfigurableOption(id)
        if (result.success) {
            notifications.success('Configurable option deleted')
            loadOptions()
        } else {
            notifications.error(result.message || 'Failed to delete')
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleNew = () => {
        router.push('/admin/configurable-options/new')
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-white">
                                Configurable options
                            </h1>
                            <p className="text-zinc-400">
                                Manage product add-ons and options. Total:{' '}
                                {total}
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleNew}
                            icon="fas fa-plus"
                        >
                            New option
                        </Button>
                    </div>

                    <ConfigurableOptionFiltersComponent
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        pluginOptions={pluginOptions}
                    />
                </div>

                <div className="overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
                    <ConfigurableOptionTable
                        options={options}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                {totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
