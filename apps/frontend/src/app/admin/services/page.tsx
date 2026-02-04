'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import ServiceTable, {
    ServiceWithOwner,
} from '@/components/admin/services/service-table'
import ServiceFiltersComponent, {
    ServiceFilters,
} from '@/components/admin/services/service-filters'
import Pagination from '@/components/admin/pagination'
import { fetchServices, deleteService } from '@/lib/admin/services'
import { ServiceStatus } from '@fluxo/types'

export default function AdminServicesPage() {
    const router = useRouter()
    const [services, setServices] = useState<ServiceWithOwner[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [filters, setFilters] = useState<ServiceFilters>({
        search: '',
        status: '',
    })

    const itemsPerPage = 10

    const loadServices = useCallback(async () => {
        setIsLoading(true)
        const response = await fetchServices({
            page: currentPage,
            limit: itemsPerPage,
            search: filters.search,
            status: filters.status as ServiceStatus | undefined,
        })
        setServices(response.services)
        setTotal(response.pagination.total)
        setTotalPages(response.pagination.totalPages)
        setIsLoading(false)
    }, [currentPage, filters])

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            setIsLoading(true)
            const response = await fetchServices({
                page: currentPage,
                limit: itemsPerPage,
                search: filters.search,
                status: filters.status as ServiceStatus | undefined,
            })
            if (!cancelled) {
                setServices(response.services)
                setTotal(response.pagination.total)
                setTotalPages(response.pagination.totalPages)
                setIsLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [currentPage, filters])

    const handleFilterChange = (newFilters: ServiceFilters) => {
        setFilters(newFilters)
        setCurrentPage(1)
    }

    const handleEdit = (serviceId: string) => {
        router.push(`/admin/services/${serviceId}/edit`)
    }

    const handleDelete = async (serviceId: string) => {
        if (
            !confirm(
                'Are you sure you want to delete this service? This action cannot be undone.'
            )
        ) {
            return
        }

        const result = await deleteService(serviceId)
        if (result.success) {
            loadServices()
        } else {
            alert(result.message || 'Failed to delete service')
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleNewService = () => {
        router.push('/admin/services/new')
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-white">
                                Service Management
                            </h1>
                            <p className="text-zinc-400">
                                Manage all services and subscriptions. Total:{' '}
                                {total} services
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleNewService}
                                icon="fas fa-plus"
                            >
                                New Service
                            </Button>
                        </div>
                    </div>

                    <ServiceFiltersComponent
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </div>

                <div className="overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
                    <ServiceTable
                        services={services}
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
