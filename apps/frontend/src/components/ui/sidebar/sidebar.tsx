'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, UserRole } from '@fluxo/types'
import {
    Dropdown,
    DropdownHeader,
    DropdownItem,
    DropdownDivider,
} from '@/components/ui/dropdown'
import Image from 'next/image'
import { useAppLogo } from '@/hooks/use-app-logo'

interface SidebarItemProps {
    href: string
    icon: string
    label: string
    isCollapsed?: boolean
}

function SidebarItem({
    href,
    icon,
    label,
    isCollapsed = false,
}: SidebarItemProps) {
    const pathname = usePathname()

    const isActive = (() => {
        if (href === '/client' || href === '/admin/dashboard') {
            return pathname === href || pathname === `${href}/`
        }
        return pathname.startsWith(href)
    })()

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary-400/10 text-primary-400' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'} ${isCollapsed ? 'justify-center' : ''} `}
            title={isCollapsed ? label : undefined}
        >
            <i className={`${icon} w-5 flex-shrink-0 text-center`}></i>
            {!isCollapsed && <span className="truncate">{label}</span>}
        </Link>
    )
}

interface SidebarProfileProps {
    user: User
    isCollapsed?: boolean
    onLogout?: () => void
}

function SidebarProfile({
    user,
    isCollapsed = false,
    onLogout,
}: SidebarProfileProps) {
    const pathname = usePathname()
    const isAdminPage = pathname.startsWith('/admin')
    const username = user.profile?.username || 'User'
    const email = user.email
    const avatarUrl = user.profile?.avatarUrl

    if (isCollapsed) {
        return (
            <Dropdown
                trigger={
                    <div className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-zinc-800 text-sm font-bold text-white uppercase transition-colors hover:bg-zinc-700">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={username}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span>{username.slice(0, 2)}</span>
                        )}
                    </div>
                }
                placement="top"
                align="left"
                useFixed={true}
            >
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

                {(user.role === UserRole.ADMIN ||
                    user.role === UserRole.STAFF) && (
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

    return (
        <Dropdown
            trigger={
                <div className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-zinc-900">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-800 text-sm font-bold text-white uppercase">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={username}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span>{username.slice(0, 2)}</span>
                        )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-white">
                            {username}
                        </span>
                        <span className="truncate text-xs text-zinc-400">
                            {email}
                        </span>
                    </div>
                    <i className="fas fa-chevron-down flex-shrink-0 text-xs text-zinc-400"></i>
                </div>
            }
            placement="top"
        >
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

interface SidebarProps {
    user: User
    items: Array<{ icon: string; label: string; href: string }>
    onLogout?: () => void
}

export default function Sidebar({ user, items, onLogout }: SidebarProps) {
    const pathname = usePathname()
    const { logoUrl, appName } = useAppLogo()
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('sidebar-collapsed')
            return stored === 'true'
        }
        return false
    })
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsCollapsed(true)
            }
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleToggleCollapse = () => {
        const newState = !isCollapsed
        setIsCollapsed(newState)
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar-collapsed', String(newState))
        }
    }

    const dashboardHref = pathname.startsWith('/admin')
        ? '/admin/dashboard'
        : '/client'

    return (
        <>
            <aside
                className={`fixed top-0 left-0 z-30 flex h-screen flex-col overflow-x-hidden border-r border-zinc-900 bg-zinc-950 transition-all duration-300 lg:translate-x-0 ${isCollapsed ? 'w-16' : 'w-64'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} `}
            >
                <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-zinc-900 p-4">
                    {!isCollapsed ? (
                        <Link
                            href={dashboardHref}
                            className="flex items-center gap-2"
                        >
                            <Image
                                src={logoUrl || '/logo.png'}
                                alt="Fluxo"
                                width={32}
                                height={32}
                                className="h-8 w-8"
                            />
                            <span className="text-xl font-bold text-white">
                                {appName || 'Fluxo'}
                            </span>
                        </Link>
                    ) : (
                        <Link
                            href={dashboardHref}
                            className="flex items-center justify-center"
                        >
                            <Image
                                src={logoUrl || '/logo.png'}
                                alt="Fluxo"
                                width={24}
                                height={24}
                                className="h-6 w-6"
                            />
                        </Link>
                    )}
                    <button
                        onClick={handleToggleCollapse}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
                        title={
                            isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                        }
                    >
                        <i
                            className={`fas fa-${isCollapsed ? 'chevron-right' : 'chevron-left'}`}
                        ></i>
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-x-hidden overflow-y-auto p-4">
                    {items.map((item) => (
                        <SidebarItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </nav>

                <div className="flex-shrink-0 overflow-visible border-t border-zinc-900 p-4">
                    <SidebarProfile
                        user={user}
                        isCollapsed={isCollapsed}
                        onLogout={onLogout}
                    />
                </div>
            </aside>

            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="fixed top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white lg:hidden"
                title="Toggle sidebar"
            >
                <i className="fas fa-bars"></i>
            </button>
        </>
    )
}
