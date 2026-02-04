'use client'

import React from 'react'
import { Service, ServiceStatus } from '@fluxo/types'
import { Invoice, News } from '@/lib/dashboard'
import StatCard from '@/components/ui/stat-card'
import { useRouter } from 'next/navigation'

interface DashboardStatsProps {
    services: Service[]
    invoices: Invoice[]
    news: News[]
    isLoading: boolean
}

export default function DashboardStats({
    services,
    invoices,
    news,
    isLoading,
}: DashboardStatsProps) {
    const router = useRouter()

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-24 animate-pulse rounded-lg border border-zinc-900 bg-zinc-950"
                    />
                ))}
            </div>
        )
    }

    const activeServices = services.filter(
        (s) => s.status === ServiceStatus.ACTIVE
    ).length
    const pendingInvoices = invoices.filter(
        (i) => i.status === 'pending'
    ).length
    const unreadNews = news.filter(
        (article) => (article as { isRead?: boolean }).isRead === false
    ).length

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div
                onClick={() => router.push('/client/services')}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
            >
                <StatCard
                    icon="fas fa-server"
                    iconColor="text-blue-500"
                    iconBg="bg-blue-500/10"
                    label="Total Services"
                    value={services.length}
                />
            </div>
            <div
                onClick={() => router.push('/client/services')}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
            >
                <StatCard
                    icon="fas fa-circle-check"
                    iconColor="text-green-500"
                    iconBg="bg-green-500/10"
                    label="Active Services"
                    value={activeServices}
                />
            </div>
            <div
                onClick={() => router.push('/client/invoices')}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
            >
                <StatCard
                    icon="fas fa-file-invoice-dollar"
                    iconColor="text-yellow-500"
                    iconBg="bg-yellow-500/10"
                    label="Pending Invoices"
                    value={pendingInvoices}
                />
            </div>
            <div
                onClick={() => router.push('/client/news')}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
            >
                <StatCard
                    icon="fas fa-newspaper"
                    iconColor="text-purple-500"
                    iconBg="bg-purple-500/10"
                    label="Unread News"
                    value={unreadNews}
                />
            </div>
        </div>
    )
}
