'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
    fetchUserById,
    updateUser,
    banUser,
    unbanUser,
    ticketBanUser,
    ticketUnbanUser,
} from '@/lib/admin/users'
import { User, UserRole } from '@fluxo/types'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import SelectMenu from '@/components/ui/input/select-menu'
import TextArea from '@/components/ui/input/text-area'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { useNotifications } from '@/context/notification-context'
import { useAuth } from '@/context/auth-context'

export default function EditUserPage() {
    const router = useRouter()
    const params = useParams()
    const notifications = useNotifications()
    const { user: currentUser } = useAuth()
    const userId = params.id as string

    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isBanning, setIsBanning] = useState(false)

    const [email, setEmail] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [role, setRole] = useState<UserRole>(UserRole.USER)
    const [isVerified, setIsVerified] = useState(false)
    const [username, setUsername] = useState('')
    const [headline, setHeadline] = useState('')
    const [about, setAbout] = useState('')

    useEffect(() => {
        const loadUser = async () => {
            setIsLoading(true)
            const userData = await fetchUserById(userId)
            if (userData) {
                setUser(userData)
                setEmail(userData.email)
                setFirstName(userData.firstName)
                setLastName(userData.lastName)
                setRole(userData.role)
                setIsVerified(userData.isVerified)
                setUsername(userData.profile?.username || '')
                setHeadline(userData.profile?.headline || '')
                setAbout(userData.profile?.about || '')
            } else {
                notifications.error('User not found')
                router.push('/admin/users')
            }
            setIsLoading(false)
        }
        loadUser()
    }, [userId, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const hasChanges =
            email !== user?.email ||
            firstName !== user?.firstName ||
            lastName !== user?.lastName ||
            role !== user?.role ||
            isVerified !== user?.isVerified ||
            username !== (user?.profile?.username || '') ||
            headline !== (user?.profile?.headline || '') ||
            about !== (user?.profile?.about || '')

        if (!hasChanges) {
            notifications.warning('No changes detected')
            router.push('/admin/users')
            return
        }

        setIsSaving(true)

        const updatedData = {
            email,
            firstName,
            lastName,
            role,
            isVerified,
            profile: {
                username,
                slug: user?.profile?.slug || '',
                headline: headline || '',
                about: about || '',
                avatarUrl: user?.profile?.avatarUrl || '',
            },
        }

        const result = await updateUser(userId, updatedData as Partial<User>)

        if (result.success) {
            notifications.success('User updated successfully')
            router.push('/admin/users')
        } else {
            notifications.error(result.message || 'Failed to update user')
        }

        setIsSaving(false)
    }

    const handleCancel = () => {
        router.push('/admin/users')
    }

    const handleBan = async () => {
        if (!user) return

        if (user.uuid === currentUser?.uuid) {
            notifications.error('You cannot ban yourself')
            return
        }

        if (user.role === UserRole.ADMIN) {
            notifications.error('Cannot ban admin users')
            return
        }

        setIsBanning(true)
        const result = await banUser(user.uuid, user.punishment?.referenceId)
        if (result.success) {
            notifications.success('User banned successfully')
            const updatedUser = await fetchUserById(userId)
            if (updatedUser) setUser(updatedUser)
        } else {
            notifications.error(result.message || 'Failed to ban user')
        }
        setIsBanning(false)
    }

    const handleUnban = async () => {
        if (!user) return
        setIsBanning(true)
        const result = await unbanUser(user.uuid)
        if (result.success) {
            notifications.success('User unbanned successfully')
            const updatedUser = await fetchUserById(userId)
            if (updatedUser) setUser(updatedUser)
        } else {
            notifications.error(result.message || 'Failed to unban user')
        }
        setIsBanning(false)
    }

    const handleTicketBan = async () => {
        if (!user) return

        if (user.uuid === currentUser?.uuid) {
            notifications.error('You cannot ban yourself')
            return
        }

        if (user.role === UserRole.ADMIN) {
            notifications.error('Cannot ban admin users')
            return
        }

        setIsBanning(true)
        const result = await ticketBanUser(
            user.uuid,
            user.punishment?.referenceId
        )
        if (result.success) {
            notifications.success('User ticket banned successfully')
            const updatedUser = await fetchUserById(userId)
            if (updatedUser) setUser(updatedUser)
        } else {
            notifications.error(result.message || 'Failed to ticket ban user')
        }
        setIsBanning(false)
    }

    const handleTicketUnban = async () => {
        if (!user) return
        setIsBanning(true)
        const result = await ticketUnbanUser(user.uuid)
        if (result.success) {
            notifications.success('User ticket unbanned successfully')
            const updatedUser = await fetchUserById(userId)
            if (updatedUser) setUser(updatedUser)
        } else {
            notifications.error(result.message || 'Failed to ticket unban user')
        }
        setIsBanning(false)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
                <div className="mx-auto flex max-w-4xl items-center justify-center py-20">
                    <Spinner size="xl" />
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">
                            Edit User
                        </h1>
                        <p className="text-zinc-400">
                            Update user information and permissions
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        icon="fas fa-arrow-left"
                    >
                        Back to Users
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Account Information
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="email">
                                    Email Address
                                </InputLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="username">
                                    Username
                                </InputLabel>
                                <Input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="firstName">
                                    First Name
                                </InputLabel>
                                <Input
                                    id="firstName"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="lastName">
                                    Last Name
                                </InputLabel>
                                <Input
                                    id="lastName"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="role">Role</InputLabel>
                                <SelectMenu
                                    id="role"
                                    value={role}
                                    onChange={(e) =>
                                        setRole(e.target.value as UserRole)
                                    }
                                    options={[
                                        { value: UserRole.USER, label: 'User' },
                                        {
                                            value: UserRole.CLIENT,
                                            label: 'Client',
                                        },
                                        {
                                            value: UserRole.STAFF,
                                            label: 'Staff',
                                        },
                                        ...(currentUser?.role === UserRole.ADMIN
                                            ? [
                                                  {
                                                      value: UserRole.ADMIN,
                                                      label: 'Admin',
                                                  },
                                              ]
                                            : []),
                                    ]}
                                />
                                {currentUser?.role === UserRole.STAFF && (
                                    <p className="mt-1 text-xs text-zinc-500">
                                        Staff members cannot assign admin role
                                    </p>
                                )}
                            </div>

                            <div>
                                <InputLabel htmlFor="verified">
                                    Verification Status
                                </InputLabel>
                                <SelectMenu
                                    id="verified"
                                    value={isVerified ? 'true' : 'false'}
                                    onChange={(e) =>
                                        setIsVerified(e.target.value === 'true')
                                    }
                                    options={[
                                        { value: 'true', label: 'Verified' },
                                        { value: 'false', label: 'Unverified' },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Profile Information
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <InputLabel htmlFor="headline">
                                    Headline
                                </InputLabel>
                                <Input
                                    id="headline"
                                    type="text"
                                    value={headline}
                                    onChange={(e) =>
                                        setHeadline(e.target.value)
                                    }
                                    placeholder="Short tagline..."
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="about">About</InputLabel>
                                <TextArea
                                    id="about"
                                    value={about}
                                    onChange={(e) => setAbout(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Punishment Actions
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                                <div>
                                    <p className="mb-2 text-sm text-zinc-400">
                                        Account Ban
                                    </p>
                                    {user.punishment?.isBanned === true ? (
                                        <Button
                                            variant="fail"
                                            onClick={handleUnban}
                                            loading={isBanning}
                                            icon="fas fa-unlock"
                                            className="w-full"
                                        >
                                            Unban User
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="fail"
                                            onClick={handleBan}
                                            loading={isBanning}
                                            icon="fas fa-ban"
                                            className="w-full"
                                            disabled={
                                                user.uuid ===
                                                    currentUser?.uuid ||
                                                user.role === UserRole.ADMIN
                                            }
                                        >
                                            Ban User
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="mb-2 text-sm text-zinc-400">
                                        Ticket Ban
                                    </p>
                                    {user.punishment?.isTicketBanned ===
                                    true ? (
                                        <Button
                                            variant="fail"
                                            onClick={handleTicketUnban}
                                            loading={isBanning}
                                            icon="fas fa-unlock"
                                            className="w-full"
                                        >
                                            Ticket Unban User
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="fail"
                                            onClick={handleTicketBan}
                                            loading={isBanning}
                                            icon="fas fa-ban"
                                            className="w-full"
                                            disabled={
                                                user.uuid ===
                                                    currentUser?.uuid ||
                                                user.role === UserRole.ADMIN
                                            }
                                        >
                                            Ticket Ban User
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {user.punishment?.referenceId && (
                            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                                <p className="mb-1 text-xs text-zinc-400">
                                    Reference ID:
                                </p>
                                <p className="font-mono text-sm break-all text-white">
                                    {user.punishment.referenceId}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={isSaving}
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
