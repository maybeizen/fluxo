'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import Button from '@/components/ui/button'
import UserTable from '@/components/admin/users/user-table'
import UserFiltersComponent, {
    UserFilters,
} from '@/components/admin/users/user-filters'
import Pagination from '@/components/admin/pagination'
import { fetchUsers, deleteUser } from '@/lib/admin/users'
import { User } from '@fluxo/types'

export default function AdminUsersPage() {
    const router = useRouter()
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [filters, setFilters] = useState<UserFilters>({
        search: '',
        role: '',
        verified: '',
    })

    const itemsPerPage = 10

    const loadUsers = useCallback(async () => {
        setIsLoading(true)
        const response = await fetchUsers({
            page: currentPage,
            limit: itemsPerPage,
            search: filters.search,
            role: filters.role,
            verified: filters.verified,
        })
        setUsers(response.users)
        setTotal(response.total)
        setTotalPages(response.totalPages)
        setIsLoading(false)
    }, [currentPage, filters])

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            setIsLoading(true)
            const response = await fetchUsers({
                page: currentPage,
                limit: itemsPerPage,
                search: filters.search,
                role: filters.role,
                verified: filters.verified,
            })
            if (!cancelled) {
                setUsers(response.users)
                setTotal(response.total)
                setTotalPages(response.totalPages)
                setIsLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [currentPage, filters])

    const handleFilterChange = (newFilters: UserFilters) => {
        setFilters(newFilters)
        setCurrentPage(1)
    }

    const handleEdit = (userId: string) => {
        router.push(`/admin/users/${userId}/edit`)
    }

    const handleDelete = async (userId: string) => {
        if (
            !confirm(
                'Are you sure you want to delete this user? This action cannot be undone.'
            )
        ) {
            return
        }

        const result = await deleteUser(userId)
        if (result.success) {
            loadUsers()
        } else {
            alert(result.message || 'Failed to delete user')
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleNewUser = () => {
        router.push('/admin/users/new')
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-white">
                                User Management
                            </h1>
                            <p className="text-zinc-400">
                                Manage all users and their permissions. Total:{' '}
                                {total} users
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleNewUser}
                                icon="fas fa-plus"
                            >
                                New User
                            </Button>
                        </div>
                    </div>

                    <UserFiltersComponent
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </div>

                <div className="overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
                    <UserTable
                        users={users}
                        currentUserId={currentUser?.uuid}
                        currentUserRole={currentUser?.role}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                {totalPages > 1 && (
                    <div className="mt-6 mb-8">
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
