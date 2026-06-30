'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import Button from '@/components/ui/button'
import UserTable from '@/components/admin/users/user-table'
import UserFiltersComponent, {
    type UserFilters,
} from '@/components/admin/users/user-filters'
import Pagination from '@/components/admin/pagination'
import PageShell from '@/components/ui/page-shell'
import PanelCard from '@/components/ui/panel-card'
import { ConfirmModal } from '@/components/ui/modal'
import { usePaginatedList } from '@/hooks/use-paginated-list'
import { fetchUsers, deleteUser } from '@/lib/admin/users'
import { useNotifications } from '@/context/notification-context'

const emptyFilters: UserFilters = { search: '', role: '', verified: '' }

export default function AdminUsersPage() {
    const router = useRouter()
    const notifications = useNotifications()
    const { user: currentUser } = useAuth()
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const {
        items: users,
        isLoading,
        currentPage,
        totalPages,
        total,
        filters,
        setFilters,
        setCurrentPage,
        refetch,
    } = usePaginatedList(
        ({ page, limit, filters: f }) =>
            fetchUsers({
                page,
                limit,
                search: f.search,
                role: f.role,
                verified: f.verified,
            }).then((response) => ({
                items: response.users,
                total: response.total,
                totalPages: response.totalPages,
                page: response.page,
            })),
        { initialFilters: emptyFilters }
    )

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return
        setIsDeleting(true)
        const result = await deleteUser(deleteTarget)
        setIsDeleting(false)
        if (result.success) {
            notifications.success('User deleted')
            setDeleteTarget(null)
            await refetch()
        } else {
            notifications.error(result.message || 'Failed to delete user')
        }
    }

    return (
        <>
            <PageShell
                title="User Management"
                description={`Manage all users and their permissions. Total: ${total} users`}
                actions={
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => router.push('/admin/users/new')}
                        icon="fas fa-plus"
                    >
                        New User
                    </Button>
                }
                filters={
                    <UserFiltersComponent
                        filters={filters}
                        onFilterChange={setFilters}
                    />
                }
            >
                <PanelCard overflow>
                    <UserTable
                        users={users}
                        currentUserId={currentUser?.uuid}
                        currentUserRole={currentUser?.role}
                        isLoading={isLoading}
                        onEdit={(id) => router.push(`/admin/users/${id}/edit`)}
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
                title="Delete user"
                description="Are you sure you want to delete this user? This action cannot be undone."
                confirmLabel="Delete"
                loading={isDeleting}
            />
        </>
    )
}
