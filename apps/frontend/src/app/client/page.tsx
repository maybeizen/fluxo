'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import TabSelector, { TabView } from '@/components/dashboard/selector'
import DashboardStats from '@/components/dashboard/dashboard-stats'
import QuickActions from '@/components/dashboard/quick-actions'
import ServicesTab from '@/components/dashboard/services-tab'
import InvoicesTab from '@/components/dashboard/invoices-tab'
import NewsTab from '@/components/dashboard/news-tab'
import Card from '@/components/ui/card'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { useDiscordCallback } from '@/hooks/use-discord-callback'
import { fetchNews } from '@/lib/dashboard'

export default function DashboardPage() {
    const { user } = useAuth()
    const router = useRouter()
    const {
        services,
        invoices,
        news,
        isLoadingServices,
        isLoadingInvoices,
        isLoadingNews,
        setNews,
    } = useDashboardData()
    useDiscordCallback()

    const [activeTab, setActiveTab] = useState<TabView>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('dashboard-active-tab')
            if (saved && ['services', 'invoices', 'news'].includes(saved)) {
                return saved as TabView
            }
        }
        return 'services'
    })
    const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)

    useEffect(() => {
        localStorage.setItem('dashboard-active-tab', activeTab)
    }, [activeTab])

    const handleMarkAllAsRead = async () => {
        setIsMarkingAllRead(true)
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/news/mark-all-read`,
                {
                    method: 'POST',
                    credentials: 'include',
                }
            )

            if (response.ok) {
                const data = await fetchNews()
                setNews(data)
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        } finally {
            setIsMarkingAllRead(false)
        }
    }

    if (!user) {
        return null
    }

    const unreadNewsCount = news.filter(
        (article) => (article as { isRead?: boolean }).isRead === false
    ).length
    const isLoadingStats =
        isLoadingServices || isLoadingInvoices || isLoadingNews

    return (
        <div className="min-h-screen bg-black p-4 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-white">
                        Welcome back, {user.profile.username}!
                    </h1>
                    <p className="text-zinc-400">
                        Here&apos;s an overview of your account and services
                    </p>
                </div>

                <div className="mb-6">
                    <DashboardStats
                        services={services}
                        invoices={invoices}
                        news={news}
                        isLoading={isLoadingStats}
                    />
                </div>

                <div className="mb-6">
                    <QuickActions />
                </div>

                <Card padding="lg">
                    <TabSelector
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        unreadNewsCount={unreadNewsCount}
                    />

                    <div className="mt-6">
                        {activeTab === 'services' && (
                            <ServicesTab
                                services={services}
                                isLoading={isLoadingServices}
                            />
                        )}

                        {activeTab === 'invoices' && (
                            <InvoicesTab
                                invoices={invoices}
                                isLoading={isLoadingInvoices}
                            />
                        )}

                        {activeTab === 'news' && (
                            <NewsTab
                                news={news}
                                isLoading={isLoadingNews}
                                unreadCount={unreadNewsCount}
                                isMarkingAllRead={isMarkingAllRead}
                                onMarkAllAsRead={handleMarkAllAsRead}
                            />
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
