'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import CouponTable from '@/components/admin/coupons/coupon-table'
import CouponFiltersComponent, {
    CouponFilters,
} from '@/components/admin/coupons/coupon-filters'
import Pagination from '@/components/admin/pagination'
import { fetchCoupons, deleteCoupon } from '@/lib/admin/coupons'
import { Coupon } from '@fluxo/types'
import { useNotifications } from '@/context/notification-context'

export default function AdminCouponsPage() {
    const router = useRouter()
    const notifications = useNotifications()
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [filters, setFilters] = useState<CouponFilters>({
        search: '',
    })

    const itemsPerPage = 10

    const loadCoupons = useCallback(async () => {
        setIsLoading(true)
        const response = await fetchCoupons({
            page: currentPage,
            limit: itemsPerPage,
            search: filters.search,
        })
        setCoupons(response.coupons)
        setTotal(response.total)
        setTotalPages(response.totalPages)
        setIsLoading(false)
    }, [currentPage, filters])

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            setIsLoading(true)
            const response = await fetchCoupons({
                page: currentPage,
                limit: itemsPerPage,
                search: filters.search,
            })
            if (!cancelled) {
                setCoupons(response.coupons)
                setTotal(response.total)
                setTotalPages(response.totalPages)
                setIsLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [currentPage, filters])

    const handleFilterChange = (newFilters: CouponFilters) => {
        setFilters(newFilters)
        setCurrentPage(1)
    }

    const handleEdit = (couponId: string) => {
        router.push(`/admin/coupons/${couponId}/edit`)
    }

    const handleDelete = async (couponId: string) => {
        if (
            !confirm(
                'Are you sure you want to permanently delete this coupon? This action cannot be undone.'
            )
        ) {
            return
        }

        const result = await deleteCoupon(couponId)
        if (result.success) {
            notifications.success('Coupon deleted successfully')
            loadCoupons()
        } else {
            notifications.error(result.message || 'Failed to delete coupon')
        }
    }

    const handleViewStats = () => {
        notifications.info('Stats view coming soon')
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleNewCoupon = () => {
        router.push('/admin/coupons/new')
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-white">
                                Coupon Management
                            </h1>
                            <p className="text-zinc-400">
                                Manage discount coupons and promotional codes.
                                Total: {total} coupons
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleNewCoupon}
                                icon="fas fa-plus"
                            >
                                New Coupon
                            </Button>
                        </div>
                    </div>

                    <CouponFiltersComponent
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </div>

                <div className="overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
                    <CouponTable
                        coupons={coupons}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onViewStats={handleViewStats}
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
