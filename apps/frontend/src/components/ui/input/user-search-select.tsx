'use client'

import React, { useState, useEffect, useRef } from 'react'
import { User, UserRole } from '@fluxo/types'
import axios from 'axios'
import InputError from './input-error'
import Spinner from '../spinner'
import Image from 'next/image'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

interface UserSearchSelectProps {
    value: string
    onSelect: (userId: string, user: User) => void
    error?: string
    className?: string
    placeholder?: string
    required?: boolean
}

export default function UserSearchSelect({
    value,
    onSelect,
    error,
    className = '',
    placeholder = 'Search by username or email...',
    required = false,
}: UserSearchSelectProps) {
    const [search, setSearch] = useState('')
    const [users, setUsers] = useState<User[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const searchUsers = async () => {
            if (search.length < 2) {
                setUsers([])
                return
            }

            setIsLoading(true)
            try {
                const response = await axios.get(
                    `${API_URL}/admin/users?search=${search}&limit=10`,
                    {
                        withCredentials: true,
                    }
                )
                setUsers(response.data.users || [])
            } catch (error) {
                console.error('Error searching users:', error)
                setUsers([])
            } finally {
                setIsLoading(false)
            }
        }

        const debounce = setTimeout(searchUsers, 300)
        return () => clearTimeout(debounce)
    }, [search])

    const handleUserSelect = (user: User) => {
        setSelectedUser(user)
        setSearch('')
        setIsOpen(false)
        onSelect(user.uuid, user)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setIsOpen(true)
        if (e.target.value.length === 0) {
            setSelectedUser(null)
            onSelect('', {} as User)
        }
    }

    const displayText = selectedUser
        ? `${selectedUser.profile?.username || 'Unknown'} (${selectedUser.email})`
        : search

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <input
                type="text"
                value={displayText}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                required={required}
                className={`w-full rounded-md border bg-neutral-900/50 px-3 py-2 text-white placeholder-neutral-400 transition-colors duration-200 focus:ring-2 focus:outline-none ${
                    error
                        ? 'border-primary-400 focus:border-primary-400 focus:ring-primary-400'
                        : 'focus:border-primary-300 focus:ring-primary-300 border-zinc-800'
                } `}
            />

            <input type="hidden" value={value} required={required} />

            {isOpen && (search.length >= 2 || users.length > 0) && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-zinc-800 bg-zinc-900 shadow-lg">
                    {isLoading ? (
                        <div className="px-4 py-3 text-center text-sm text-zinc-400">
                            <Spinner />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="px-4 py-3 text-center text-sm text-zinc-400">
                            {search.length >= 2
                                ? 'No users found'
                                : 'Type to search...'}
                        </div>
                    ) : (
                        users.map((user) => (
                            <button
                                key={user.uuid}
                                type="button"
                                onClick={() => handleUserSelect(user)}
                                className="flex w-full items-center gap-3 border-b border-zinc-800 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-zinc-800"
                            >
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-sm font-bold text-white uppercase">
                                    {user.profile?.avatarUrl ? (
                                        <Image
                                            src={user.profile.avatarUrl}
                                            alt={user.profile.username}
                                            width={40}
                                            height={40}
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
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-medium text-white">
                                        {user.profile?.username || 'Unknown'}
                                    </div>
                                    <div className="truncate text-xs text-zinc-400">
                                        {user.email}
                                    </div>
                                    <div className="truncate font-mono text-xs text-zinc-500">
                                        ID: {user.uuid}
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <span
                                        className={`rounded border px-2 py-1 text-xs font-medium ${
                                            user.role === UserRole.ADMIN
                                                ? 'border-primary-400/20 bg-primary-400/10 text-primary-400'
                                                : user.role === UserRole.STAFF
                                                  ? 'border-purple-500/20 bg-purple-500/10 text-purple-500'
                                                  : user.role ===
                                                      UserRole.CLIENT
                                                    ? 'border-blue-500/20 bg-blue-500/10 text-blue-500'
                                                    : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-400'
                                        }`}
                                    >
                                        {user.role}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}

            <InputError message={error} />

            {selectedUser && (
                <div className="mt-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2">
                    <div className="text-xs text-zinc-400">
                        Selected User ID:
                    </div>
                    <div className="mt-1 font-mono text-sm text-white">
                        {selectedUser.uuid}
                    </div>
                </div>
            )}
        </div>
    )
}
