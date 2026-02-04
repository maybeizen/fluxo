'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { User, UserRole } from '@fluxo/types'
import Image from 'next/image'

interface MobileMenuItem {
    icon?: string
    label: string
    href: string
}

interface NavbarMobileMenuProps {
    items: MobileMenuItem[]
    user: User
    onLogout?: () => void
    className?: string
}

export default function NavbarMobileMenu({
    items,
    user,
    onLogout,
    className = '',
}: NavbarMobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const isAdminPage = pathname.startsWith('/admin')
    const username = user.profile?.username || 'User'
    const email = user.email
    const avatarUrl = user.profile?.avatarUrl

    useEffect(() => {
        if (isOpen) {
            setIsOpen(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex flex-col gap-1.5 rounded-lg p-2 transition-colors hover:bg-zinc-900 md:hidden ${className}`}
                aria-label="Toggle menu"
            >
                <span
                    className={`h-0.5 w-6 bg-zinc-400 transition-all duration-300 ${
                        isOpen ? 'translate-y-2 rotate-45' : ''
                    }`}
                />
                <span
                    className={`h-0.5 w-6 bg-zinc-400 transition-all duration-300 ${
                        isOpen ? 'opacity-0' : ''
                    }`}
                />
                <span
                    className={`h-0.5 w-6 bg-zinc-400 transition-all duration-300 ${
                        isOpen ? '-translate-y-2 -rotate-45' : ''
                    }`}
                />
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    style={{ animation: 'fadeIn 0.3s ease-out' }}
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div
                className={`fixed top-[57px] right-0 bottom-0 left-0 z-50 transform border-t border-zinc-900 bg-zinc-950 transition-transform duration-300 ease-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'} `}
            >
                <div className="flex h-full flex-col overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-zinc-900 p-4">
                        <h2 className="text-lg font-semibold text-white">
                            Menu
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded-lg p-2 transition-colors hover:bg-zinc-900"
                            aria-label="Close menu"
                        >
                            <i className="fas fa-times text-xl text-zinc-400"></i>
                        </button>
                    </div>

                    <div className="border-b border-zinc-900 p-4">
                        <div className="flex items-center gap-3 rounded-lg bg-zinc-900/50 p-3">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-base font-bold text-white uppercase">
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt={username}
                                        width={48}
                                        height={48}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span>{username.slice(0, 2)}</span>
                                )}
                            </div>
                            <div className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-medium text-white">
                                    {username}
                                </span>
                                <span className="truncate text-xs text-zinc-400">
                                    {email}
                                </span>
                            </div>
                        </div>
                    </div>

                    <nav className="flex flex-1 flex-col space-y-2 p-4">
                        {items.map((item) => {
                            const checkIsActive = () => {
                                if (
                                    item.href === '/client' ||
                                    item.href === '/admin'
                                ) {
                                    return pathname === item.href
                                }
                                return pathname.startsWith(item.href)
                            }
                            const isActive = checkIsActive()
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'bg-primary-400/10 text-primary-400'
                                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                                    } `}
                                >
                                    {item.icon && (
                                        <i
                                            className={`${item.icon} w-5 text-center`}
                                        ></i>
                                    )}
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="space-y-2 border-t border-zinc-900 p-4">
                        <Link
                            href="/client/profile"
                            className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
                        >
                            <i className="fas fa-user w-5 text-center"></i>
                            <span>Profile</span>
                        </Link>
                        <Link
                            href="/client/settings"
                            className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
                        >
                            <i className="fas fa-cog w-5 text-center"></i>
                            <span>Settings</span>
                        </Link>
                        {(user.role === UserRole.ADMIN ||
                            user.role === UserRole.STAFF) &&
                            (isAdminPage ? (
                                <Link
                                    href="/client"
                                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
                                >
                                    <i className="fas fa-arrow-left w-5 text-center"></i>
                                    <span>Leave Admin</span>
                                </Link>
                            ) : (
                                <Link
                                    href="/admin/dashboard"
                                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
                                >
                                    <i className="fas fa-shield-halved w-5 text-center"></i>
                                    <span>Admin Panel</span>
                                </Link>
                            ))}
                        <button
                            onClick={() => {
                                setIsOpen(false)
                                onLogout?.()
                            }}
                            className="hover:text-primary-400 text-primary-300 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-zinc-900"
                        >
                            <i className="fas fa-sign-out-alt w-5 text-center"></i>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
