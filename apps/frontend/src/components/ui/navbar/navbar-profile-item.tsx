'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { User, UserRole } from '@fluxo/types'
import {
    Dropdown,
    DropdownHeader,
    DropdownItem,
    DropdownDivider,
} from '@/components/ui/dropdown'
import Image from 'next/image'

interface NavbarProfileItemProps {
    user: User
    onLogout?: () => void
    className?: string
}

export default function NavbarProfileItem({
    user,
    onLogout,
    className = '',
}: NavbarProfileItemProps) {
    const pathname = usePathname()
    const isAdminPage = pathname.startsWith('/admin')
    const username = user.profile?.username || 'User'
    const email = user.email
    const avatarUrl = user.profile?.avatarUrl

    const trigger = (
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-zinc-900">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-sm font-bold text-white uppercase">
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt={username}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span>{username.slice(0, 2)}</span>
                )}
            </div>
            <div className="hidden flex-col items-start xl:flex">
                <span className="text-sm font-medium text-white">
                    {username}
                </span>
                <span className="text-xs text-zinc-400">{email}</span>
            </div>
            <i className="fas fa-chevron-down hidden text-xs text-zinc-400 xl:block"></i>
        </div>
    )

    return (
        <Dropdown trigger={trigger} className={className}>
            <DropdownHeader>
                <p className="text-sm font-medium text-white">{username}</p>
                <p className="truncate text-xs text-zinc-400">{email}</p>
            </DropdownHeader>

            <div className="py-2">
                <DropdownItem href="/client" icon="fas fa-home">
                    Dashboard
                </DropdownItem>
                <DropdownItem href="/client/profile" icon="fas fa-user">
                    Profile
                </DropdownItem>
                <DropdownItem href="/client/settings" icon="fas fa-cog">
                    Settings
                </DropdownItem>
            </div>

            {(user.role === UserRole.ADMIN || user.role === UserRole.STAFF) && (
                <>
                    <DropdownDivider />
                    <div className="py-2">
                        {isAdminPage ? (
                            <DropdownItem
                                href="/client"
                                icon="fas fa-arrow-left"
                            >
                                Leave Admin
                            </DropdownItem>
                        ) : (
                            <DropdownItem
                                href="/admin/dashboard"
                                icon="fas fa-shield-halved"
                            >
                                Admin Panel
                            </DropdownItem>
                        )}
                    </div>
                </>
            )}

            <DropdownDivider />

            <div className="py-2">
                <DropdownItem
                    onClick={onLogout}
                    icon="fas fa-sign-out-alt"
                    danger
                >
                    Logout
                </DropdownItem>
            </div>
        </Dropdown>
    )
}
