'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { useNotifications } from '@/context/notification-context'
import Button from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputLabel } from '@/components/ui/input'
import PageHeader from '@/components/client/page-header'
import Card from '@/components/ui/card'
import {
    updateProfile,
    changePassword,
    uploadAvatar,
    updateAvatarUrl,
} from '@/lib/profile'
import { initiateDiscordConnection, disconnectDiscord } from '@/lib/discord'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ProfilePage() {
    const { user, refreshAuth } = useAuth()
    const notifications = useNotifications()
    const router = useRouter()
    const searchParams = useSearchParams()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const hasShownNotification = useRef(false)

    const [firstName, setFirstName] = useState(user?.firstName || '')
    const [lastName, setLastName] = useState(user?.lastName || '')
    const [email, setEmail] = useState(user?.email || '')
    const [username, setUsername] = useState(user?.profile?.username || '')
    const [headline] = useState(user?.profile?.headline || '')
    const [about] = useState(user?.profile?.about || '')
    const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatarUrl || '')

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [isLoadingProfile, setIsLoadingProfile] = useState(false)
    const [isLoadingPassword, setIsLoadingPassword] = useState(false)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [isDisconnectingDiscord, setIsDisconnectingDiscord] = useState(false)

    const [avatarInputMethod, setAvatarInputMethod] = useState<
        'upload' | 'url'
    >('upload')

    useEffect(() => {
        const discordStatus = searchParams.get('discord')
        const error = searchParams.get('error')

        if (
            (discordStatus === 'connected' || error) &&
            !hasShownNotification.current
        ) {
            hasShownNotification.current = true

            if (discordStatus === 'connected') {
                notifications.success('Discord account connected successfully')
                refreshAuth()
            } else if (error) {
                const errorMessages: Record<string, string> = {
                    user_not_found: 'User not found',
                    invalid_callback: 'Invalid Discord callback',
                    connection_failed: 'Failed to connect Discord account',
                }
                notifications.error(errorMessages[error] || 'An error occurred')
            }

            router.replace('/client/profile')
        }
    }, [searchParams])

    if (!user) {
        return null
    }

    const isDiscordConnected =
        user.discord?.discordId && user.discord.discordId.length > 0

    const handleProfileUpdate = async () => {
        try {
            setIsLoadingProfile(true)

            const updates: Record<string, string> = {}
            if (firstName !== user.firstName) updates.firstName = firstName
            if (lastName !== user.lastName) updates.lastName = lastName
            const emailChanged = email !== user.email
            if (emailChanged) updates.email = email
            if (username !== user.profile?.username)
                updates['profile.username'] = username
            if (headline !== (user.profile?.headline || ''))
                updates['profile.headline'] = headline
            if (about !== (user.profile?.about || ''))
                updates['profile.about'] = about

            if (Object.keys(updates).length === 0) {
                notifications.info('No changes to save')
                return
            }

            const response = await updateProfile(updates)
            await refreshAuth()

            if (response.emailChanged) {
                notifications.success(
                    'Email updated! Please check your new email to verify your account.'
                )
                router.push(
                    `/auth/verify-email?email=${encodeURIComponent(email)}`
                )
            } else {
                notifications.success('Profile updated successfully')
            }
        } catch (error: unknown) {
            notifications.error(
                (error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data
                          ?.message
                    : undefined) ||
                    (error && typeof error === 'object' && 'response' in error
                        ? (
                              error.response as {
                                  data?: {
                                      errors?: Array<{ message?: string }>
                                  }
                              }
                          )?.data?.errors
                        : undefined)?.[0]?.message ||
                    'Failed to update profile'
            )
        } finally {
            setIsLoadingProfile(false)
        }
    }

    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword) {
            notifications.error('Please fill in all password fields')
            return
        }

        if (newPassword !== confirmPassword) {
            notifications.error('New passwords do not match')
            return
        }

        try {
            setIsLoadingPassword(true)

            await changePassword({ currentPassword, newPassword })

            notifications.success('Password changed successfully')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error: unknown) {
            notifications.error(
                (error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data
                          ?.message
                    : undefined) ||
                    (error && typeof error === 'object' && 'response' in error
                        ? (
                              error.response as {
                                  data?: {
                                      errors?: Array<{ message?: string }>
                                  }
                              }
                          )?.data?.errors
                        : undefined)?.[0]?.message ||
                    'Failed to change password'
            )
        } finally {
            setIsLoadingPassword(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            notifications.error('Please upload an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            notifications.error('Image must be less than 5MB')
            return
        }

        try {
            setIsUploadingAvatar(true)

            const newAvatarUrl = await uploadAvatar(file)
            setAvatarUrl(newAvatarUrl)
            await refreshAuth()

            notifications.success('Avatar uploaded successfully')
        } catch (error: unknown) {
            notifications.error(
                (error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data
                          ?.message
                    : undefined) || 'Failed to upload avatar'
            )
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    const handleAvatarUrlUpdate = async () => {
        try {
            setIsUploadingAvatar(true)

            await updateAvatarUrl(avatarUrl)
            await refreshAuth()

            notifications.success('Avatar updated successfully')
        } catch (error: unknown) {
            notifications.error(
                (error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data
                          ?.message
                    : undefined) || 'Failed to update avatar'
            )
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    const handleDiscordConnect = async () => {
        try {
            const authUrl = await initiateDiscordConnection()
            window.location.href = authUrl
        } catch (error: unknown) {
            notifications.error(
                (error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data
                          ?.message
                    : undefined) || 'Failed to initiate Discord connection'
            )
        }
    }

    const handleDiscordDisconnect = async () => {
        try {
            setIsDisconnectingDiscord(true)
            await disconnectDiscord()
            await refreshAuth()
            notifications.success('Discord account disconnected successfully')
        } catch (error: unknown) {
            notifications.error(
                (error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data
                          ?.message
                    : undefined) || 'Failed to disconnect Discord account'
            )
        } finally {
            setIsDisconnectingDiscord(false)
        }
    }

    return (
        <div className="min-h-screen bg-black p-4 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <PageHeader
                    title="Profile Settings"
                    description="Manage your account settings and preferences"
                />

                <div className="space-y-6">
                    <Card padding="lg">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="mb-1 text-xl font-semibold text-white">
                                    Profile Picture
                                </h2>
                                <p className="text-sm text-zinc-400">
                                    Update your avatar
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-6 md:flex-row">
                            <div className="flex-shrink-0">
                                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-pink-600">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="Avatar"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl font-bold text-white">
                                            {user.firstName[0]}
                                            {user.lastName[0]}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() =>
                                            setAvatarInputMethod('upload')
                                        }
                                        variant={
                                            avatarInputMethod === 'upload'
                                                ? 'primary'
                                                : 'ghost'
                                        }
                                        icon="fas fa-upload"
                                        iconPosition="left"
                                    >
                                        Upload File
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            setAvatarInputMethod('url')
                                        }
                                        variant={
                                            avatarInputMethod === 'url'
                                                ? 'primary'
                                                : 'ghost'
                                        }
                                        icon="fas fa-link"
                                        iconPosition="left"
                                    >
                                        Use URL
                                    </Button>
                                </div>

                                {avatarInputMethod === 'upload' ? (
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                        <Button
                                            variant="secondary"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            disabled={isUploadingAvatar}
                                        >
                                            {isUploadingAvatar
                                                ? 'Uploading...'
                                                : 'Choose File'}
                                        </Button>
                                        <p className="mt-2 text-xs text-zinc-500">
                                            Max file size: 5MB. Supported: JPG,
                                            PNG, GIF
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <InputLabel htmlFor="avatarUrl">
                                            Avatar URL
                                        </InputLabel>
                                        <Input
                                            id="avatarUrl"
                                            type="url"
                                            value={avatarUrl}
                                            onChange={(e) =>
                                                setAvatarUrl(e.target.value)
                                            }
                                            placeholder="https://example.com/avatar.jpg"
                                        />
                                        <Button
                                            variant="secondary"
                                            onClick={handleAvatarUrlUpdate}
                                            className="mt-2"
                                            loading={isUploadingAvatar}
                                        >
                                            {isUploadingAvatar
                                                ? 'Updating...'
                                                : 'Update Avatar'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card padding="lg">
                        <div className="mb-6">
                            <h2 className="mb-1 text-xl font-semibold text-white">
                                Personal Information
                            </h2>
                            <p className="text-sm text-zinc-400">
                                Update your basic profile details
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
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
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="email">Email</InputLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => router.push('/client')}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleProfileUpdate}
                                disabled={isLoadingProfile}
                            >
                                {isLoadingProfile
                                    ? 'Saving...'
                                    : 'Save Changes'}
                            </Button>
                        </div>
                    </Card>

                    <Card padding="lg">
                        <div className="mb-6">
                            <h2 className="mb-1 text-xl font-semibold text-white">
                                Change Password
                            </h2>
                            <p className="text-sm text-zinc-400">
                                Update your password to keep your account secure
                            </p>
                        </div>

                        <div className="max-w-md space-y-4">
                            <div>
                                <InputLabel htmlFor="currentPassword">
                                    Current Password
                                </InputLabel>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="newPassword">
                                    New Password
                                </InputLabel>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                />
                                <p className="mt-1 text-xs text-zinc-500">
                                    Must be at least 8 characters with
                                    uppercase, lowercase, and number
                                </p>
                            </div>

                            <div>
                                <InputLabel htmlFor="confirmPassword">
                                    Confirm New Password
                                </InputLabel>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                />
                            </div>

                            <Button
                                variant="primary"
                                onClick={handlePasswordChange}
                                disabled={isLoadingPassword}
                                className="mt-4"
                            >
                                {isLoadingPassword
                                    ? 'Changing...'
                                    : 'Change Password'}
                            </Button>
                        </div>
                    </Card>

                    <Card padding="lg">
                        <div className="mb-6">
                            <h2 className="mb-1 text-xl font-semibold text-white">
                                Discord Integration
                            </h2>
                            <p className="text-sm text-zinc-400">
                                Connect your Discord account
                            </p>
                        </div>

                        <div className="space-y-4">
                            {isDiscordConnected ? (
                                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5865F2]">
                                            <i className="fab fa-discord text-xl text-white"></i>
                                        </div>
                                        <div>
                                            <p className="text-sm text-zinc-400">
                                                Connected to Discord as
                                            </p>
                                            <p className="font-medium text-white">
                                                {user.discord?.discordUsername}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="fail"
                                        onClick={handleDiscordDisconnect}
                                        disabled={isDisconnectingDiscord}
                                        icon="fas fa-unlink"
                                        iconPosition="left"
                                    >
                                        {isDisconnectingDiscord
                                            ? 'Disconnecting...'
                                            : 'Disconnect'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                                            <i className="fab fa-discord text-xl text-zinc-500"></i>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">
                                                Discord Not Connected
                                            </p>
                                            <p className="text-sm text-zinc-400">
                                                Connect your Discord account for
                                                enhanced features
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="custom"
                                        onClick={handleDiscordConnect}
                                        icon="fab fa-discord"
                                        iconPosition="left"
                                        className="border-[#5865F2] bg-[#5865F2] hover:bg-[#4752C4]"
                                    >
                                        Connect Discord
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
