'use client'

import React from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { Sidebar } from '@/components/ui/sidebar'
import { useAuth } from '@/context/auth-context'
import { UserRole } from '@fluxo/types'

interface AdminLayoutProps {
    children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { user, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
    }

    const navItems = [
        {
            icon: 'fas fa-objects-column',
            label: 'Dashboard',
            href: '/admin/dashboard',
        },
        { icon: 'fas fa-users', label: 'Users', href: '/admin/users' },
        { icon: 'fas fa-server', label: 'Services', href: '/admin/services' },
        {
            icon: 'fas fa-file-invoice-dollar',
            label: 'Invoices',
            href: '/admin/invoices',
        },
        {
            icon: 'fas fa-boxes-stacked',
            label: 'Products',
            href: '/admin/products',
        },
        {
            icon: 'fas fa-folder',
            label: 'Categories',
            href: '/admin/categories',
        },
        { icon: 'fas fa-headset', label: 'Support', href: '/admin/support' },
        { icon: 'fas fa-tags', label: 'Coupons', href: '/admin/coupons' },
        { icon: 'fas fa-newspaper', label: 'News', href: '/admin/news' },
        ...(user?.role === UserRole.ADMIN
            ? [
                  {
                      icon: 'fas fa-plug',
                      label: 'Plugins',
                      href: '/admin/plugins',
                  },
                  {
                      icon: 'fas fa-cog',
                      label: 'Settings',
                      href: '/admin/settings',
                  },
              ]
            : []),
    ]

    return (
        <AuthGuard requireAdmin>
            <div className="flex min-h-screen bg-black">
                <Sidebar
                    user={user!}
                    items={navItems}
                    onLogout={handleLogout}
                />
                <main className="flex flex-1 flex-col p-0 transition-all duration-300 lg:ml-64">
                    {children}
                </main>
            </div>
        </AuthGuard>
    )
}
