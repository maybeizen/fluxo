'use client'

import React from 'react'
import { Service } from '@fluxo/types'
import { useRouter } from 'next/navigation'
import ServiceCard from './service-card'
import LoadingState from '@/components/ui/loading-state'
import EmptyState from '@/components/ui/empty-state'
import Button from '@/components/ui/button'

interface ServicesTabProps {
    services: Service[]
    isLoading: boolean
}

export default function ServicesTab({ services, isLoading }: ServicesTabProps) {
    const router = useRouter()

    if (isLoading) {
        return <LoadingState size="md" />
    }

    if (services.length === 0) {
        return (
            <EmptyState
                icon="fas fa-objects-column"
                title="No Services Yet"
                description="You don't have any active services. Get started by creating your first server!"
                iconSize="sm"
            />
        )
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {services.slice(0, 4).map((service) => (
                <ServiceCard key={service.uuid} service={service} />
            ))}

            {services.length > 4 && (
                <div className="flex items-center">
                    <Button
                        variant="secondary"
                        icon="fas fa-network-wired"
                        onClick={() => router.push('/client/services')}
                    >
                        View All Services
                    </Button>
                </div>
            )}
        </div>
    )
}
