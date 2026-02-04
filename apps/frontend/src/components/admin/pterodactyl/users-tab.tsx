'use client'

import React, { useEffect, useState } from 'react'
import { fetchPterodactylUsers } from '@/lib/admin/pterodactyl'
import Spinner from '@/components/ui/spinner'

interface User {
    id?: number
    uuid?: string
    external_id?: string
    username?: string
    email?: string
    first_name?: string
    last_name?: string
    language?: string
    root_admin?: boolean
    '2fa'?: boolean
    created_at?: string
    updated_at?: string
}

interface UsersTabProps {
    refreshKey: number
}

export default function UsersTab({ refreshKey }: UsersTabProps) {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadUsers = async () => {
            setIsLoading(true)
            const data = await fetchPterodactylUsers()
            setUsers(data as User[])
            setIsLoading(false)
        }
        loadUsers()
    }, [refreshKey])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">Users</h2>
                {users.length === 0 ? (
                    <p className="text-zinc-400">No users found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        Username
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        Role
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                                        2FA
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr
                                        key={user.id || user.uuid || index}
                                        className="border-b border-zinc-900 hover:bg-zinc-900/50"
                                    >
                                        <td className="px-4 py-3 text-white">
                                            {user.username || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400">
                                            {user.email || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400">
                                            {user.first_name || user.last_name
                                                ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                                : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-medium ${
                                                    user.root_admin
                                                        ? 'bg-primary-400/20 text-primary-300'
                                                        : 'bg-blue-500/20 text-blue-400'
                                                }`}
                                            >
                                                {user.root_admin
                                                    ? 'Admin'
                                                    : 'User'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-medium ${
                                                    user['2fa']
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-zinc-500/20 text-zinc-400'
                                                }`}
                                            >
                                                {user['2fa']
                                                    ? 'Enabled'
                                                    : 'Disabled'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
