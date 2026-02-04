'use client'

import { ReactNode } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { Sidebar } from '@/components/ui/sidebar'
import { useAuth } from '@/context/auth-context'

interface ClientLayoutProps {
    children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const { user, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
    }

    const navItems = [
        { icon: 'fas fa-home', label: 'Dashboard', href: '/client' },
        { icon: 'fas fa-box', label: 'Services', href: '/client/services' },
        {
            icon: 'fas fa-file-invoice-dollar',
            label: 'Invoices',
            href: '/client/invoices',
        },
        {
            icon: 'fas fa-basket-shopping',
            label: 'Store',
            href: '/client/store',
        },
        {
            icon: 'fas fa-money-bill',
            label: 'Balances',
            href: '/client/balances',
        },
        { icon: 'fas fa-headset', label: 'Support', href: '/client/support' },
        { icon: 'fas fa-newspaper', label: 'News', href: '/client/news' },
        {
            icon: 'fas fa-user-circle',
            label: 'Profile',
            href: '/client/profile',
        },
    ]

    return (
        <AuthGuard>
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
