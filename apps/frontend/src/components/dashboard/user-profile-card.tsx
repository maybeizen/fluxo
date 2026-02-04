'use client'

import React from 'react'
import { User } from '@fluxo/types'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import FormattedDate from '@/components/ui/formatted-date'

interface UserProfileCardProps {
    user: User
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
    const router = useRouter()

    return (
        <div className="flex flex-col items-center rounded-lg border border-zinc-900 bg-zinc-950 p-6">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 text-3xl font-bold text-white uppercase">
                {user.profile?.avatarUrl ? (
                    <img
                        src={user.profile.avatarUrl}
                        alt={user.profile.username}
                        className="h-20 w-20 rounded-full object-cover"
                    />
                ) : (
                    <span>{user.profile?.username?.slice(0, 2) || '?'}</span>
                )}
            </div>
            <div className="text-xl font-semibold text-white">
                {user.profile?.username}
            </div>
            <div className="mb-4 text-sm text-zinc-400">{user.email}</div>

            <div className="mt-2 w-full space-y-2 border-t border-zinc-800 pt-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Status:</span>
                    <span className="flex items-center gap-1 text-green-400">
                        <i className="fas fa-circle text-xs"></i>
                        Active
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Member Since:</span>
                    <FormattedDate
                        date={user.timestamps?.createdAt}
                        variant="short"
                        className="text-zinc-300"
                    />
                </div>
            </div>

            <div className="mt-4 w-full pt-4">
                <Button
                    variant="secondary"
                    fullWidth
                    icon="fas fa-user-edit"
                    iconPosition="left"
                    className="py-2.5"
                    onClick={() => router.push('/client/profile')}
                >
                    Edit Profile
                </Button>
            </div>
        </div>
    )
}
