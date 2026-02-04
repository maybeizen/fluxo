'use client'

import React from 'react'
import Card from '@/components/ui/card'
import SectionHeader from '@/components/ui/section-header'
import StatCard from '@/components/ui/stat-card'
import LoadingState from '@/components/ui/loading-state'

interface UserMetricsCardProps {
    totalUsers: number
    verifiedUsers: number
    adminUsers: number
    isLoading: boolean
}

export default function UserMetricsCard({
    totalUsers,
    verifiedUsers,
    adminUsers,
    isLoading,
}: UserMetricsCardProps) {
    return (
        <Card>
            <SectionHeader
                title="User Metrics"
                description="Overview of user statistics"
            />

            {isLoading ? (
                <LoadingState size="lg" />
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StatCard
                        icon="fas fa-users"
                        iconColor="text-blue-500"
                        iconBg="bg-blue-500/10"
                        label="Total Users"
                        value={totalUsers}
                    />
                    <StatCard
                        icon="fas fa-check-circle"
                        iconColor="text-green-500"
                        iconBg="bg-green-500/10"
                        label="Verified Users"
                        value={verifiedUsers}
                    />
                    <StatCard
                        icon="fas fa-shield-halved"
                        iconColor="text-primary-400"
                        iconBg="bg-primary-400/10"
                        label="Admin Users"
                        value={adminUsers}
                    />
                </div>
            )}
        </Card>
    )
}
