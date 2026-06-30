'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import CouponTable from '@/components/admin/coupons/coupon-table'
import CouponFiltersComponent, {
    type CouponFilters,
} from '@/components/admin/coupons/coupon-filters'
import Pagination from '@/components/admin/pagination'
import PageShell from '@/components/ui/page-shell'
import PanelCard from '@/components/ui/panel-card'
import { ConfirmModal } from '@/components/ui/modal'
import { usePaginatedList } from '@/hooks/use-paginated-list'
import { fetchCoupons, deleteCoupon } from '@/lib/admin/coupons'
import { useNotifications } from '@/context/notification-context'

export default function AdminCouponsPage() {
    const router = useRouter()
    const notifications = useNotifications()
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const {
        items: coupons,
        isLoading,
        currentPage,
        totalPages,
        total,
        filters,
        setFilters,
        setCurrentPage,
        refetch,
    } = usePaginatedList(
        async ({ page, limit, filters: f }) => {
            const response = await fetchCoupons({
                page,
                limit,
                search: f.search,
            })
            return {
                items: response.coupons,
                total: response.total,
                totalPages: response.totalPages,
                page: response.page,
            }
        },
        { initialFilters: { search: '' } as CouponFilters }
    )

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return
        setIsDeleting(true)
        const result = await deleteCoupon(deleteTarget)
        setIsDeleting(false)
        if (result.success) {
            notifications.success('Coupon deleted')
            setDeleteTarget(null)
            await refetch()
        } else {
            notifications.error(result.message || 'Failed to delete coupon')
        }
    }

    return (
        <>
            <PageShell
                title="Coupon Management"
                description={`Create and manage discount coupons. Total: ${total} coupons`}
                actions={
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => router.push('/admin/coupons/new')}
                        icon="fas fa-plus"
                    >
                        New Coupon
                    </Button>
                }
                filters={
                    <CouponFiltersComponent
                        filters={filters}
                        onFilterChange={setFilters}
                    />
                }
            >
                <PanelCard overflow>
                    <CouponTable
                        coupons={coupons}
                        isLoading={isLoading}
                        onEdit={(id) =>
                            router.push(`/admin/coupons/${id}/edit`)
                        }
                        onDelete={(id) => setDeleteTarget(id)}
                    />
                </PanelCard>

                {totalPages > 1 && (
                    <div className="mt-6 mb-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </PageShell>

            <ConfirmModal
                open={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete coupon"
                description="Are you sure you want to permanently delete this coupon? This action cannot be undone."
                confirmLabel="Delete"
                loading={isDeleting}
            />
        </>
    )
}
