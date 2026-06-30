'use client'

import React from 'react'
import Card from '@/components/ui/card'
import SectionHeader from '@/components/ui/section-header'
import StatCard from '@/components/ui/stat-card'
import LoadingState from '@/components/ui/loading-state'

interface ServiceOverviewCardProps {
    totalServices: number
    activeServices: number
    suspendedServices: number
    cancelledServices: number
    isLoading: boolean
}

export default function ServiceOverviewCard({
    totalServices,
    activeServices,
    suspendedServices,
    cancelledServices,
    isLoading,
}: ServiceOverviewCardProps) {
    return (
        <Card>
            <SectionHeader
                title="Service Overview"
                description="Current service status breakdown"
            />

            {isLoading ? (
                <LoadingState size="lg" />
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StatCard
                        icon="fas fa-server"
                        iconColor="text-blue-500"
                        iconBg="bg-blue-500/10"
                        label="Total Services"
                        value={totalServices}
                    />
                    <StatCard
                        icon="fas fa-circle-check"
                        iconColor="text-green-500"
                        iconBg="bg-green-500/10"
                        label="Active Services"
                        value={activeServices}
                    />
                    <StatCard
                        icon="fas fa-pause-circle"
                        iconColor="text-orange-500"
                        iconBg="bg-orange-500/10"
                        label="Suspended"
                        value={suspendedServices}
                    />
                    <StatCard
                        icon="fas fa-circle-xmark"
                        iconColor="text-primary-400"
                        iconBg="bg-primary-400/10"
                        label="Cancelled"
                        value={cancelledServices}
                    />
                </div>
            )}
        </Card>
    )
}
