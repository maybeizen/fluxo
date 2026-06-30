'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUser } from '@/lib/admin/users'
import { UserRole } from '@fluxo/types'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import SelectMenu from '@/components/ui/input/select-menu'
import Checkbox from '@/components/ui/input/checkbox'
import Button from '@/components/ui/button'
import { useNotifications } from '@/context/notification-context'
import { useAuth } from '@/context/auth-context'

export default function NewUserPage() {
    const router = useRouter()
    const notifications = useNotifications()
    const { user: currentUser } = useAuth()

    const [isSaving, setIsSaving] = useState(false)

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [role, setRole] = useState<UserRole>(UserRole.USER)
    const [isVerified, setIsVerified] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!username.trim() || !email.trim() || !password.trim()) {
            notifications.error('Please fill in all required fields')
            return
        }

        if (password.length < 8) {
            notifications.error('Password must be at least 8 characters long')
            return
        }

        setIsSaving(true)

        const userData = {
            username: username.trim(),
            email: email.trim(),
            password: password.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            role,
            isVerified,
        }

        const result = await createUser(userData)

        if (result.success) {
            notifications.success('User created successfully')
            router.push('/admin/users')
        } else {
            notifications.error(result.message || 'Failed to create user')
        }

        setIsSaving(false)
    }

    const handleCancel = () => {
        router.push('/admin/users')
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-white">
                            Create User
                        </h1>
                        <p className="text-zinc-400">
                            Add a new user to the system
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
                                <InputLabel htmlFor="username" required>
                                    Username
                                </InputLabel>
                                <Input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    placeholder="johndoe"
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" required>
                                    Email Address
                                </InputLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="password" required>
                                    Password
                                </InputLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Minimum 8 characters"
                                    required
                                    minLength={8}
                                />
                                <p className="mt-1 text-xs text-zinc-500">
                                    Password must be at least 8 characters long
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Personal Information
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                    placeholder="John"
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
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                        <h2 className="mb-6 border-b border-zinc-900 pb-4 text-xl font-semibold text-white">
                            Permissions & Status
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <InputLabel htmlFor="role" required>
                                    Role
                                </InputLabel>
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
                                <p className="mt-1 text-xs text-zinc-500">
                                    {currentUser?.role === UserRole.ADMIN
                                        ? 'Admins have full access to the admin panel and all features'
                                        : 'Staff members cannot create admin users'}
                                </p>
                            </div>

                            <div>
                                <Checkbox
                                    checked={isVerified}
                                    onChange={(e) =>
                                        setIsVerified(e.target.checked)
                                    }
                                    label="Email Verified"
                                />
                                <p className="mt-1 ml-8 text-xs text-zinc-500">
                                    Mark this user&apos;s email as verified
                                    (skips email verification)
                                </p>
                            </div>
                        </div>
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
                            Create User
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
