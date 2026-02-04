'use client'

import React from 'react'
import { User, UserRole } from '@fluxo/types'
import Button from '@/components/ui/button'
import Link from 'next/link'
import Spinner from '@/components/ui/spinner'
import { useNotifications } from '@/context/notification-context'

interface UserTableProps {
    users: User[]
    currentUserId?: string
    currentUserRole?: UserRole
    isLoading?: boolean
    onEdit?: (userId: string) => void
    onDelete?: (userId: string) => void
    className?: string
}

export default function UserTable({
    users,
    currentUserId,
    currentUserRole,
    isLoading = false,
    onEdit,
    onDelete,
    className = '',
}: UserTableProps) {
    const notifications = useNotifications()

    const handleCopyId = async (userId: string) => {
        try {
            await navigator.clipboard.writeText(userId)
            notifications.success('User ID copied to clipboard')
        } catch (error) {
            console.error('Failed to copy ID:', error)
            notifications.error('Failed to copy ID')
        }
    }
    const getRoleBadge = (role: UserRole) => {
        const colors = {
            [UserRole.ADMIN]:
                'bg-primary-400/10 text-primary-400 border-primary-400/20',
            [UserRole.STAFF]:
                'bg-purple-500/10 text-purple-500 border-purple-500/20',
            [UserRole.CLIENT]:
                'bg-blue-500/10 text-blue-500 border-blue-500/20',
            [UserRole.USER]: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        }

        return (
            <span
                className={`rounded border px-2 py-1 text-xs font-medium ${colors[role]}`}
            >
                {role}
            </span>
        )
    }

    const getVerifiedBadge = (isVerified: boolean) => {
        if (isVerified) {
            return (
                <span className="text-green-500">
                    <i className="fas fa-check-circle"></i>
                </span>
            )
        }
        return (
            <span className="text-zinc-600">
                <i className="fas fa-circle-xmark"></i>
            </span>
        )
    }

    const formatDate = (date: Date | string) => {
        const d = new Date(date)
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
            </div>
        )
    }

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                    <i className="fas fa-users text-2xl text-zinc-600"></i>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                    No Users Found
                </h3>
                <p className="max-w-md text-sm text-zinc-400">
                    No users match your current filters. Try adjusting your
                    search criteria.
                </p>
            </div>
        )
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-zinc-800">
                        <th className="w-24 px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            User
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Email
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Role
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">
                            Verified
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Joined
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr
                            key={user.uuid || `user-${index}`}
                            className="border-b border-zinc-900 transition-colors hover:bg-zinc-900/50"
                        >
                            <td className="px-4 py-3">
                                <div
                                    className="group flex w-fit cursor-pointer items-center gap-2 transition-colors hover:text-white"
                                    onClick={() => handleCopyId(user.uuid)}
                                    title="Click to copy ID"
                                >
                                    <span className="font-mono text-xs text-zinc-400 group-hover:text-white">
                                        {user.uuid}
                                    </span>
                                    <i className="fas fa-copy flex-shrink-0 text-xs text-zinc-600 group-hover:text-zinc-400"></i>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-sm font-bold text-white uppercase">
                                        {user.profile?.avatarUrl ? (
                                            <img
                                                src={user.profile.avatarUrl}
                                                alt={user.profile.username}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span>
                                                {user.profile?.username?.slice(
                                                    0,
                                                    2
                                                ) || 'U'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <Link
                                            href={`/admin/users/${user.uuid}`}
                                            className="hover:text-primary-400 truncate text-sm font-medium text-white transition-colors"
                                        >
                                            {user.profile?.username ||
                                                'Unknown'}
                                        </Link>
                                        <span className="truncate text-xs text-zinc-500">
                                            {user.firstName} {user.lastName}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-400">
                                {user.email}
                            </td>
                            <td className="px-4 py-3">
                                {getRoleBadge(user.role)}
                            </td>
                            <td className="px-4 py-3 text-center">
                                {getVerifiedBadge(user.isVerified)}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-400">
                                {formatDate(user.timestamps.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                    {onEdit && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(user.uuid)}
                                            className="px-3"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Button>
                                    )}
                                    {onDelete &&
                                        currentUserRole === UserRole.ADMIN && (
                                            <Button
                                                variant="fail"
                                                size="sm"
                                                onClick={() =>
                                                    onDelete(user.uuid)
                                                }
                                                disabled={
                                                    user.uuid === currentUserId
                                                }
                                                className="px-3"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </Button>
                                        )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
