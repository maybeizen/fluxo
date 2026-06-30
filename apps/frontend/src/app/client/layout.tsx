'use client'

import { type ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { Sidebar } from '@/components/ui/sidebar'
import {
    AppSettingsProvider,
    useAppSettings,
} from '@/context/app-settings-context'
import { useAuth } from '@/context/auth-context'
import AnnouncementBanner from '@/components/ui/announcement-banner'

interface ClientLayoutProps {
    children: ReactNode
}

function ClientLayoutContent({ children }: ClientLayoutProps) {
    const { user, logout } = useAuth()
    const { ticketsEnabled } = useAppSettings()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (
            ticketsEnabled === false &&
            pathname.startsWith('/client/support')
        ) {
            router.replace('/client')
        }
    }, [ticketsEnabled, pathname, router])

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
        ...(ticketsEnabled !== false
            ? [
                  {
                      icon: 'fas fa-headset',
                      label: 'Support',
                      href: '/client/support',
                  },
              ]
            : []),
        { icon: 'fas fa-newspaper', label: 'News', href: '/client/news' },
        {
            icon: 'fas fa-user-circle',
            label: 'Profile',
            href: '/client/profile',
        },
    ]

    return (
        <AuthGuard>
            <div className="bg-background flex min-h-screen flex-col">
                <AnnouncementBanner />
                <div className="flex flex-1">
                    <Sidebar
                        user={user!}
                        items={navItems}
                        onLogout={handleLogout}
                    />
                    <main className="flex flex-1 flex-col p-0 transition-all duration-300 lg:ml-64">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    )
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    return (
        <AppSettingsProvider>
            <ClientLayoutContent>{children}</ClientLayoutContent>
        </AppSettingsProvider>
    )
}
