'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import InvoiceTable, {
    InvoiceWithOwner,
} from '@/components/admin/invoices/invoice-table'
import InvoiceFiltersComponent, {
    InvoiceFilters,
} from '@/components/admin/invoices/invoice-filters'
import Pagination from '@/components/admin/pagination'
import { fetchInvoices, deleteInvoice } from '@/lib/admin/invoices'
import { InvoiceStatus } from '@fluxo/types'
import { useNotifications } from '@/context/notification-context'

export default function AdminInvoicesPage() {
    const router = useRouter()
    const notifications = useNotifications()
    const [invoices, setInvoices] = useState<InvoiceWithOwner[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [filters, setFilters] = useState<InvoiceFilters>({
        search: '',
        status: '',
        userId: '',
    })

    const itemsPerPage = 10

    useEffect(() => {
        let cancelled = false

        const loadInvoices = async () => {
            setIsLoading(true)
            try {
                const response = await fetchInvoices({
                    page: currentPage,
                    limit: itemsPerPage,
                    search: filters.search,
                    status: filters.status as InvoiceStatus | undefined,
                    userId: filters.userId || undefined,
                })

                if (!cancelled) {
                    setInvoices(response.invoices)
                    setTotal(response.total)
                    setTotalPages(response.totalPages)
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('Failed to load invoices:', error)
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        loadInvoices()

        return () => {
            cancelled = true
        }
    }, [currentPage, filters])

    const handleFilterChange = (newFilters: InvoiceFilters) => {
        setFilters(newFilters)
        setCurrentPage(1)
    }

    const handleEdit = (invoiceId: string) => {
        router.push(`/admin/invoices/${invoiceId}/edit`)
    }

    const handleView = (invoiceId: string) => {
        router.push(`/admin/invoices/${invoiceId}`)
    }

    const handleDelete = async (invoiceId: string) => {
        if (
            !confirm(
                'Are you sure you want to delete this invoice? This action cannot be undone.'
            )
        ) {
            return
        }

        const result = await deleteInvoice(invoiceId)
        if (result.success) {
            notifications.success('Invoice deleted successfully')
            setCurrentPage(1)
        } else {
            notifications.error(result.message || 'Failed to delete invoice')
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleNewInvoice = () => {
        router.push('/admin/invoices/new')
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-white">
                                Invoice Management
                            </h1>
                            <p className="text-zinc-400">
                                Manage all invoices and payments. Total: {total}{' '}
                                invoices
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleNewInvoice}
                                icon="fas fa-plus"
                            >
                                New Invoice
                            </Button>
                        </div>
                    </div>

                    <InvoiceFiltersComponent
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </div>

                <div className="overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
                    <InvoiceTable
                        invoices={invoices}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
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
